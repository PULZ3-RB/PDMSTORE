import {
  getVehicleById,
  calculateSalePrice,
  calculateTax,
  calculateTotalWithTax,
  getClassName
} from "./_lib/vehicles.js";
import { json, clean } from "./_lib/http.js";

export async function onRequestPost(context) {
  try {
    const webhook = context.env.DISCORD_RESERVATIONS_WEBHOOK_URL || context.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return json({ ok: false, error: "Webhook de reservas no configurado en Cloudflare." }, 500);
    }

    const data = await context.request.json();
    const nombre = clean(data.nombre, 80);
    const apellidos = clean(data.apellidos, 100);
    const telefono = clean(data.telefono, 40);
    const vehicleId = clean(data.vehicleId, 80);

    if (!nombre || !apellidos || !telefono || !vehicleId) {
      return json({ ok: false, error: "Faltan datos obligatorios." }, 400);
    }

    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) {
      return json({ ok: false, error: "Vehículo no válido." }, 400);
    }

    const price = calculateSalePrice(vehicle.cost, vehicle.type);
    const tax = calculateTax(price);
    const total = calculateTotalWithTax(price);
    const availability = Number(vehicle.stock || 0) > 0
      ? `Unidad inmediata · ${vehicle.stock} disponible${vehicle.stock === 1 ? "" : "s"}`
      : "Solo por reserva";

    const payload = {
      username: "PDMSTORE",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: "🚗 Nueva reserva",
        color: 0x2783DE,
        fields: [
          { name: "👤 Cliente", value: `${nombre} ${apellidos}`, inline: true },
          { name: "📞 Teléfono", value: telefono, inline: true },
          { name: "🚘 Vehículo", value: `${vehicle.brand} ${vehicle.name}`, inline: true },
          { name: "🏷️ Clase", value: getClassName(vehicle.type), inline: true },
          { name: "💵 Precio", value: `$${price.toLocaleString("en-US")}`, inline: true },
          { name: "🧾 TAX 9.8%", value: `$${tax.toLocaleString("en-US")}`, inline: true },
          { name: "💳 Total", value: `$${total.toLocaleString("en-US")}`, inline: true },
          { name: "📦 Disponibilidad", value: availability, inline: true }
        ],
        footer: { text: "PDMSTORE · Solicitud de reserva" },
        timestamp: new Date().toISOString()
      }]
    };

    const discordResponse = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!discordResponse.ok) {
      console.error("Discord reserva:", await discordResponse.text());
      return json({ ok: false, error: "Discord rechazó el mensaje." }, 502);
    }

    return json({ ok: true, message: "Reserva enviada correctamente." });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "Error interno del servidor." }, 500);
  }
}
