import { json, cleanText } from "./_lib/http.js";
import { getVehicleById, getPublicVehicle } from "./_lib/vehicles.js";

export async function onRequestPost(context) {
  try {
    if (!context.env.DB) {
      return json({ ok: false, error: "D1 no está conectado al binding DB." }, 500);
    }

    if (!context.env.DISCORD_RESERVATIONS_WEBHOOK_URL) {
      return json({
        ok: false,
        error: "Falta configurar DISCORD_RESERVATIONS_WEBHOOK_URL."
      }, 500);
    }

    const body = await context.request.json();
    const nombre = cleanText(body.nombre, 80);
    const apellidos = cleanText(body.apellidos, 100);
    const telefono = cleanText(body.telefono, 40);
    const vehicleId = cleanText(body.vehicleId, 100);

    if (!nombre || !apellidos || !telefono || !vehicleId) {
      return json({ ok: false, error: "Faltan datos obligatorios." }, 400);
    }

    const vehicle = await getVehicleById(context.env.DB, vehicleId);

    if (!vehicle) {
      return json({ ok: false, error: "Vehículo no válido o desactivado." }, 400);
    }

    const publicVehicle = getPublicVehicle(vehicle);

    const payload = {
      username: "PDMSTORE Reservas",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: "🚗 Nueva reserva",
        color: 0x2783DE,
        fields: [
          { name: "Cliente", value: `${nombre} ${apellidos}`, inline: true },
          { name: "Teléfono", value: telefono, inline: true },
          { name: "Vehículo", value: `${vehicle.brand} ${vehicle.name}`, inline: true },
          { name: "Clase", value: publicVehicle.className, inline: true },
          { name: "Precio", value: `$${publicVehicle.price.toLocaleString("en-US")}`, inline: true },
          { name: "TAX 9.8%", value: `$${publicVehicle.tax.toLocaleString("en-US")}`, inline: true },
          { name: "Total", value: `$${publicVehicle.total.toLocaleString("en-US")}`, inline: true },
          {
            name: "Disponibilidad",
            value: publicVehicle.stock > 0
              ? `Unidad inmediata (${publicVehicle.stock})`
              : "Solo por reserva",
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const discord = await fetch(context.env.DISCORD_RESERVATIONS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!discord.ok) {
      console.error("Discord reservas:", await discord.text());
      return json({ ok: false, error: "Discord rechazó la reserva." }, 502);
    }

    return json({ ok: true, message: "Reserva enviada correctamente." });
  } catch (error) {
    console.error("RESERVA ERROR:", error);
    return json({ ok: false, error: "Error interno al enviar la reserva." }, 500);
  }
}
