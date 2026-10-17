import { json, cleanText } from "../_lib/http.js";
import { getCurrentUser } from "../_lib/auth.js";
import {
  VALID_VEHICLE_TYPES,
  VALID_VEHICLE_CATEGORIES,
  listVehicles,
  getAdminVehicle,
  calculateSalePrice,
  calculateTax,
  calculateTotalWithTax,
  getClassName,
  getCategoryName
} from "../_lib/vehicles.js";

async function requireStaff(context) {
  if (!context.env.DB) {
    return {
      error: json({
        ok: false,
        error: "D1 no está conectado al binding DB."
      }, 500)
    };
  }

  const user = await getCurrentUser(context.request, context.env.DB);

  if (!user) {
    return {
      error: json({
        ok: false,
        error: "Debes iniciar sesión."
      }, 401)
    };
  }

  return { user };
}

async function ensureVehicleColumns(db) {
  const result = await db.prepare("PRAGMA table_info(vehicles)").all();
  const columns = result.results || [];
  const names = new Set(columns.map(column => String(column.name)));

  if (!names.has("category")) {
    await db.prepare(
      "ALTER TABLE vehicles ADD COLUMN category TEXT NOT NULL DEFAULT 'auto'"
    ).run();
  }

  if (!names.has("updated_at")) {
    await db.prepare("ALTER TABLE vehicles ADD COLUMN updated_at TEXT").run();
    await db.prepare(`
      UPDATE vehicles
      SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
      WHERE updated_at IS NULL OR TRIM(updated_at) = ''
    `).run();
  }
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
  const category = cleanText(body.category, 20).toLowerCase() || "auto";
  const image = cleanText(body.image, 1000);
  const cost = Number(body.cost);
  const stock = Number(body.stock);

  if (!brand || !name) {
    return { error: "Marca y modelo son obligatorios." };
  }

  if (!VALID_VEHICLE_TYPES.has(type)) {
    return { error: "Clase de vehículo no válida." };
  }

  if (!VALID_VEHICLE_CATEGORIES.has(category)) {
    return { error: "El tipo de catálogo debe ser Auto o Moto." };
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
      category,
      cost,
      stock,
      image
    }
  };
}

function getStaffVehicle(row) {
  const vehicle = getAdminVehicle(row);

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    name: vehicle.name,
    type: vehicle.type,
    className: vehicle.className,
    category: vehicle.category,
    categoryName: vehicle.categoryName,
    stock: vehicle.stock,
    active: vehicle.active,
    price: vehicle.price,
    tax: vehicle.tax,
    total: vehicle.total
  };
}

async function getVehicleList(db) {
  const vehicles = await listVehicles(db, { includeInactive: true });
  return vehicles.map(getStaffVehicle);
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

async function sendCatalogDiscord(context, payload) {
  const webhook = context.env.DISCORD_CATALOG_WEBHOOK_URL
    || context.env.DISCORD_ADMIN_WEBHOOK_URL
    || context.env.DISCORD_SALES_WEBHOOK_URL;

  if (!webhook) {
    return { configured: false, sent: false };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Discord catálogo:", await response.text());
    }

    return { configured: true, sent: response.ok };
  } catch (error) {
    console.error("Discord catálogo error:", error);
    return { configured: true, sent: false };
  }
}

async function sendVehicleCreatedLog(context, user, vehicle, id) {
  const price = calculateSalePrice(vehicle.cost, vehicle.type);
  const tax = calculateTax(price);
  const total = calculateTotalWithTax(price);

  return sendCatalogDiscord(context, {
    username: "PDMSTORE Catálogo",
    allowed_mentions: { parse: [] },
    embeds: [{
      title: "📦 Vehículo agregado al catálogo",
      color: 0x2783DE,
      fields: [
        { name: "Empleado", value: user.displayName, inline: true },
        { name: "Usuario", value: user.username, inline: true },
        { name: "Vehículo", value: `${vehicle.brand} ${vehicle.name}`, inline: false },
        { name: "Tipo", value: getCategoryName(vehicle.category), inline: true },
        { name: "Clase", value: getClassName(vehicle.type), inline: true },
        { name: "Stock", value: String(vehicle.stock), inline: true },
        { name: "Costo base", value: formatMoney(vehicle.cost), inline: true },
        { name: "Precio catálogo", value: formatMoney(price), inline: true },
        { name: "Con TAX 9.8%", value: formatMoney(total), inline: true },
        { name: "ID", value: id, inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

async function sendVehicleToggleLog(context, user, vehicle, active) {
  const price = calculateSalePrice(vehicle.cost, vehicle.type);

  return sendCatalogDiscord(context, {
    username: "PDMSTORE Catálogo",
    allowed_mentions: { parse: [] },
    embeds: [{
      title: "🔄 Disponibilidad modificada",
      color: active ? 0x59D58B : 0xD95C5C,
      fields: [
        { name: "Empleado", value: user.displayName, inline: true },
        { name: "Usuario", value: user.username, inline: true },
        { name: "Vehículo", value: `${vehicle.brand} ${vehicle.name}`, inline: false },
        { name: "Clase", value: getClassName(vehicle.type), inline: true },
        { name: "Precio catálogo", value: formatMoney(price), inline: true },
        { name: "Nuevo estado", value: active ? "ACTIVO" : "DESACTIVADO", inline: true }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

export async function onRequestGet(context) {
  try {
    const auth = await requireStaff(context);
    if (auth.error) return auth.error;

    await ensureVehicleColumns(context.env.DB);

    return json({
      ok: true,
      vehicles: await getVehicleList(context.env.DB)
    });
  } catch (error) {
    console.error("STAFF VEHICLES GET ERROR:", error);
    return json({
      ok: false,
      error: "No se pudo cargar la disponibilidad de los vehículos."
    }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const auth = await requireStaff(context);
    if (auth.error) return auth.error;

    await ensureVehicleColumns(context.env.DB);

    const body = await context.request.json();
    const action = cleanText(body.action, 30);

    if (action === "create") {
      const parsed = parseVehicleInput(body);
      if (parsed.error) {
        return json({ ok: false, error: parsed.error }, 400);
      }

      const vehicle = parsed.vehicle;
      const id = await makeUniqueId(context.env.DB, vehicle.brand, vehicle.name);

      await context.env.DB.prepare(`
        INSERT INTO vehicles (
          id, brand, name, type, category, cost, stock, image, active, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `).bind(
        id,
        vehicle.brand,
        vehicle.name,
        vehicle.type,
        vehicle.category,
        vehicle.cost,
        vehicle.stock,
        vehicle.image
      ).run();

      const discord = await sendVehicleCreatedLog(context, auth.user, vehicle, id);
      const price = calculateSalePrice(vehicle.cost, vehicle.type);

      return json({
        ok: true,
        message: `${vehicle.brand} ${vehicle.name} agregado al catálogo por ${formatMoney(price)}.`,
        vehicleId: id,
        discordConfigured: discord.configured,
        discordSent: discord.sent,
        vehicles: await getVehicleList(context.env.DB)
      });
    }

    if (action === "set-active") {
      const id = cleanText(body.id, 100);
      const active = Number(body.active) === 1 ? 1 : 0;

      if (!id) {
        return json({
          ok: false,
          error: "Vehículo no válido."
        }, 400);
      }

      const vehicle = await context.env.DB.prepare(
        "SELECT * FROM vehicles WHERE id = ? LIMIT 1"
      ).bind(id).first();

      if (!vehicle) {
        return json({
          ok: false,
          error: "Vehículo no encontrado."
        }, 404);
      }

      await context.env.DB.prepare(`
        UPDATE vehicles
        SET active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(active, id).run();

      const discord = await sendVehicleToggleLog(context, auth.user, vehicle, active);

      return json({
        ok: true,
        message: active ? "Vehículo activado." : "Vehículo desactivado.",
        discordConfigured: discord.configured,
        discordSent: discord.sent,
        vehicles: await getVehicleList(context.env.DB)
      });
    }

    return json({
      ok: false,
      error: "Los empleados pueden agregar vehículos y cambiar su disponibilidad, pero no editarlos ni eliminarlos."
    }, 403);
  } catch (error) {
    console.error("STAFF VEHICLES POST ERROR:", error);
    return json({
      ok: false,
      error: "No se pudo completar la acción del catálogo: " + (error?.message || String(error))
    }, 500);
  }
}
