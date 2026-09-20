import { json, cleanText } from "../_lib/http.js";
import { getCurrentUser } from "../_lib/auth.js";
import {
  getVehicleById,
  getClassName,
  calculateSalePrice,
  calculateTax,
  calculateTotalWithTax,
  calculateCommission,
  COMMISSION_BY_CLASS
} from "../_lib/vehicles.js";

async function requireUser(context) {
  if (!context.env.DB) return { error: json({ ok: false, error: "D1 no está conectado." }, 500) };
  const user = await getCurrentUser(context.request, context.env.DB);
  if (!user) return { error: json({ ok: false, error: "No autorizado." }, 401) };
  return { user };
}

export async function onRequestGet(context) {
  try {
    const auth = await requireUser(context);
    if (auth.error) return auth.error;

    const salesResult = await context.env.DB.prepare(`
      SELECT id, vehicle_name, vehicle_class, client_name, payment_method,
             base_price, tax, total, commission_rate, commission_amount, created_at
      FROM sales
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 100
    `).bind(auth.user.id).all();

    const summary = await context.env.DB.prepare(`
      SELECT COUNT(*) AS sales_count,
             COALESCE(SUM(base_price), 0) AS sold_total,
             COALESCE(SUM(commission_amount), 0) AS commission_total
      FROM sales
      WHERE user_id = ?
    `).bind(auth.user.id).first();

    return json({ ok: true, sales: salesResult.results || [], summary });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo cargar el historial." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.error) return auth.error;

    const body = await context.request.json();
    const vehicleId = cleanText(body.vehicleId, 80);
    const clientName = cleanText(body.clientName, 120);
    const paymentMethod = cleanText(body.paymentMethod, 60);

    if (!vehicleId || !clientName || !paymentMethod) {
      return json({ ok: false, error: "Completa todos los datos de la venta." }, 400);
    }

    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) return json({ ok: false, error: "Vehículo no válido." }, 400);

    const basePrice = calculateSalePrice(vehicle.cost, vehicle.type);
    const tax = calculateTax(basePrice);
    const total = calculateTotalWithTax(basePrice);
    const commissionRate = COMMISSION_BY_CLASS[vehicle.type] ?? 0;
    const commissionAmount = calculateCommission(basePrice, vehicle.type);
    const vehicleName = `${vehicle.brand} ${vehicle.name}`;
    const vehicleClass = getClassName(vehicle.type);

    const insert = await context.env.DB.prepare(`
      INSERT INTO sales (
        user_id, vehicle_id, vehicle_name, vehicle_class, client_name, payment_method,
        base_price, tax, total, commission_rate, commission_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      auth.user.id, vehicle.id, vehicleName, vehicleClass, clientName, paymentMethod,
      basePrice, tax, total, commissionRate, commissionAmount
    ).run();

    let discordSent = false;
    if (context.env.DISCORD_SALES_WEBHOOK_URL) {
      const payload = {
        username: "PDMSTORE Ventas",
        allowed_mentions: { parse: [] },
        embeds: [{
          title: "🚘 Nueva venta registrada",
          color: 0x2783DE,
          fields: [
            { name: "Empleado", value: auth.user.displayName, inline: true },
            { name: "Cliente", value: clientName, inline: true },
            { name: "Vehículo", value: vehicleName, inline: true },
            { name: "Clase", value: vehicleClass, inline: true },
            { name: "Precio", value: `$${basePrice.toLocaleString("en-US")}`, inline: true },
            { name: "TAX 9.8%", value: `$${tax.toLocaleString("en-US")}`, inline: true },
            { name: "Total", value: `$${total.toLocaleString("en-US")}`, inline: true },
            { name: "Comisión", value: `${(commissionRate * 100).toFixed(0)}% · $${commissionAmount.toLocaleString("en-US")}`, inline: true },
            { name: "Pago", value: paymentMethod, inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      const discord = await fetch(context.env.DISCORD_SALES_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      discordSent = discord.ok;
      if (!discord.ok) console.error("Discord ventas:", await discord.text());
    }

    return json({
      ok: true,
      sale: {
        id: insert.meta?.last_row_id ?? null,
        commissionAmount,
        basePrice,
        tax,
        total
      },
      discordSent
    });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo registrar la venta." }, 500);
  }
}
