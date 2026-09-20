import { json, clean } from "../_lib/http.js";
import { requireUser } from "../_lib/auth.js";
import {
  getVehicleById,
  calculateSalePrice,
  calculateTax,
  calculateTotalWithTax,
  calculateCommission,
  COMMISSION_BY_CLASS,
  getClassName
} from "../_lib/vehicles.js";

export async function onRequestGet(context) {
  const auth = await requireUser(context);
  if (auth.error) return auth.error;

  const rows = await context.env.DB.prepare(
    `SELECT id, vehicle_id, vehicle_name, vehicle_class, client_name, payment_method,
            base_price, tax, total, commission_rate, commission_amount, created_at
     FROM sales
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 100`
  ).bind(auth.user.id).all();

  const summary = await context.env.DB.prepare(
    `SELECT COUNT(*) AS sales_count,
            COALESCE(SUM(base_price), 0) AS sold_total,
            COALESCE(SUM(commission_amount), 0) AS commission_total
     FROM sales
     WHERE user_id = ?`
  ).bind(auth.user.id).first();

  return json({
    ok: true,
    sales: rows.results || [],
    summary: summary || { sales_count: 0, sold_total: 0, commission_total: 0 }
  });
}

export async function onRequestPost(context) {
  const auth = await requireUser(context);
  if (auth.error) return auth.error;

  try {
    const body = await context.request.json();
    const vehicleId = clean(body.vehicleId, 80);
    const clientName = clean(body.clientName, 120);
    const paymentMethod = clean(body.paymentMethod, 50);

    if (!vehicleId || !clientName || !paymentMethod) {
      return json({ ok: false, error: "Completa todos los campos de la venta." }, 400);
    }

    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) return json({ ok: false, error: "Vehículo no válido." }, 400);

    const price = calculateSalePrice(vehicle.cost, vehicle.type);
    const tax = calculateTax(price);
    const total = calculateTotalWithTax(price);
    const commissionRate = COMMISSION_BY_CLASS[vehicle.type] ?? 0;
    const commissionAmount = calculateCommission(price, vehicle.type);
    const vehicleName = `${vehicle.brand} ${vehicle.name}`;
    const className = getClassName(vehicle.type);

    const result = await context.env.DB.prepare(
      `INSERT INTO sales (
        user_id, vehicle_id, vehicle_name, vehicle_class, client_name, payment_method,
        base_price, tax, total, commission_rate, commission_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      auth.user.id,
      vehicle.id,
      vehicleName,
      className,
      clientName,
      paymentMethod,
      price,
      tax,
      total,
      commissionRate,
      commissionAmount
    ).run();

    const webhook = context.env.DISCORD_SALES_WEBHOOK_URL;
    if (webhook) {
      const payload = {
        username: "PDMSTORE · Ventas",
        allowed_mentions: { parse: [] },
        embeds: [{
          title: "💼 Nueva venta registrada",
          color: 0x46A171,
          fields: [
            { name: "👤 Empleado", value: auth.user.display_name, inline: true },
            { name: "👥 Cliente", value: clientName, inline: true },
            { name: "🚘 Vehículo", value: vehicleName, inline: true },
            { name: "🏷️ Clase", value: className, inline: true },
            { name: "💵 Precio", value: `$${price.toLocaleString("en-US")}`, inline: true },
            { name: "🧾 TAX 9.8%", value: `$${tax.toLocaleString("en-US")}`, inline: true },
            { name: "💳 Total", value: `$${total.toLocaleString("en-US")}`, inline: true },
            { name: "💰 Comisión", value: `${(commissionRate * 100).toFixed(0)}% · $${commissionAmount.toLocaleString("en-US")}`, inline: true },
            { name: "💳 Pago", value: paymentMethod, inline: true }
          ],
          footer: { text: `PDMSTORE · Venta #${result.meta?.last_row_id || ""}` },
          timestamp: new Date().toISOString()
        }]
      };

      const discordResponse = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!discordResponse.ok) {
        console.error("Discord ventas:", await discordResponse.text());
      }
    }

    return json({
      ok: true,
      sale: {
        vehicleName,
        className,
        price,
        tax,
        total,
        commissionRate,
        commissionAmount
      }
    });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo registrar la venta." }, 500);
  }
}
