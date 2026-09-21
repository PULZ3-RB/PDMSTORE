import { json, cleanText } from "../_lib/http.js";
import { timingSafeEqual } from "../_lib/auth.js";
import {
  VALID_VEHICLE_TYPES,
  listVehicles,
  getAdminVehicle
} from "../_lib/vehicles.js";

async function requireAdmin(context, body) {
  if (!context.env.DB) {
    return { error: json({ ok: false, error: "D1 no está conectado al binding DB." }, 500) };
  }

  if (!context.env.ADMIN_SETUP_KEY) {
    return { error: json({ ok: false, error: "ADMIN_SETUP_KEY no está configurado en Cloudflare." }, 500) };
  }

  const valid = await timingSafeEqual(
    String(body?.setupKey || ""),
    context.env.ADMIN_SETUP_KEY
  );

  if (!valid) {
    return { error: json({ ok: false, error: "Clave de administración incorrecta." }, 403) };
  }

  return { ok: true };
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function makeUniqueId(db, brand, name) {
  const base = slugify(`${brand}-${name}`) || `vehiculo-${Date.now()}`;
  let candidate = base;

  for (let i = 1; i <= 100; i++) {
    const exists = await db.prepare(
      "SELECT id FROM vehicles WHERE id = ? LIMIT 1"
    ).bind(candidate).first();

    if (!exists) return candidate;
    candidate = `${base}-${i + 1}`;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function parseVehicleInput(body) {
  const brand = cleanText(body.brand, 80);
  const name = cleanText(body.name, 100);
  const type = cleanText(body.type, 20);
  const image = cleanText(body.image, 1000);
  const cost = Number(body.cost);
  const stock = Number(body.stock);

  if (!brand || !name) {
    return { error: "Marca y modelo son obligatorios." };
  }

  if (!VALID_VEHICLE_TYPES.has(type)) {
    return { error: "Clase de vehículo no válida." };
  }

  if (!Number.isFinite(cost) || cost < 0) {
    return { error: "El costo debe ser un número válido mayor o igual a 0." };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "El stock debe ser un número entero mayor o igual a 0." };
  }

  return {
    vehicle: {
      brand,
      name,
      type,
      cost,
      stock,
      image
    }
  };
}

async function getVehicleList(db) {
  const vehicles = await listVehicles(db, { includeInactive: true });
  return vehicles.map(getAdminVehicle);
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const auth = await requireAdmin(context, body);
    if (auth.error) return auth.error;

    const action = cleanText(body.action, 30) || "list";

    if (action === "list") {
      return json({
        ok: true,
        vehicles: await getVehicleList(context.env.DB)
      });
    }

    if (action === "create") {
      const parsed = parseVehicleInput(body);
      if (parsed.error) {
        return json({ ok: false, error: parsed.error }, 400);
      }

      const v = parsed.vehicle;
      const id = await makeUniqueId(context.env.DB, v.brand, v.name);

      await context.env.DB.prepare(`
        INSERT INTO vehicles (
          id, brand, name, type, cost, stock, image, active, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `).bind(
        id,
        v.brand,
        v.name,
        v.type,
        v.cost,
        v.stock,
        v.image
      ).run();

      return json({
        ok: true,
        message: `${v.brand} ${v.name} agregado correctamente.`,
        vehicleId: id,
        vehicles: await getVehicleList(context.env.DB)
      });
    }

    if (action === "update") {
      const id = cleanText(body.id, 100);
      if (!id) {
        return json({ ok: false, error: "Falta el ID del vehículo." }, 400);
      }

      const exists = await context.env.DB.prepare(
        "SELECT id FROM vehicles WHERE id = ? LIMIT 1"
      ).bind(id).first();

      if (!exists) {
        return json({ ok: false, error: "Vehículo no encontrado." }, 404);
      }

      const parsed = parseVehicleInput(body);
      if (parsed.error) {
        return json({ ok: false, error: parsed.error }, 400);
      }

      const v = parsed.vehicle;

      await context.env.DB.prepare(`
        UPDATE vehicles
        SET brand = ?,
            name = ?,
            type = ?,
            cost = ?,
            stock = ?,
            image = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        v.brand,
        v.name,
        v.type,
        v.cost,
        v.stock,
        v.image,
        id
      ).run();

      return json({
        ok: true,
        message: `${v.brand} ${v.name} actualizado correctamente.`,
        vehicles: await getVehicleList(context.env.DB)
      });
    }

    if (action === "set-active") {
      const id = cleanText(body.id, 100);
      const active = Number(body.active) === 1 ? 1 : 0;

      if (!id) {
        return json({ ok: false, error: "Vehículo no válido." }, 400);
      }

      const result = await context.env.DB.prepare(`
        UPDATE vehicles
        SET active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(active, id).run();

      if (Number(result.meta?.changes || 0) === 0) {
        return json({ ok: false, error: "Vehículo no encontrado." }, 404);
      }

      return json({
        ok: true,
        message: active ? "Vehículo activado." : "Vehículo desactivado.",
        vehicles: await getVehicleList(context.env.DB)
      });
    }

    return json({ ok: false, error: "Acción de vehículos no válida." }, 400);
  } catch (error) {
    console.error("ADMIN VEHICLES ERROR:", error);
    return json({
      ok: false,
      error: "No se pudo completar la acción de vehículos."
    }, 500);
  }
}
