import { json, cleanText } from "../_lib/http.js";
import { getCurrentUser } from "../_lib/auth.js";
import { listVehicles, getAdminVehicle } from "../_lib/vehicles.js";

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

export async function onRequestGet(context) {
  try {
    const auth = await requireStaff(context);
    if (auth.error) return auth.error;

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

    const body = await context.request.json();
    const action = cleanText(body.action, 30);

    // Los empleados solo pueden activar o desactivar.
    if (action !== "set-active") {
      return json({
        ok: false,
        error: "Esta cuenta no puede editar ni eliminar vehículos."
      }, 403);
    }

    const id = cleanText(body.id, 100);
    const active = Number(body.active) === 1 ? 1 : 0;

    if (!id) {
      return json({
        ok: false,
        error: "Vehículo no válido."
      }, 400);
    }

    const exists = await context.env.DB.prepare(
      "SELECT id FROM vehicles WHERE id = ? LIMIT 1"
    ).bind(id).first();

    if (!exists) {
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

    return json({
      ok: true,
      message: active ? "Vehículo activado." : "Vehículo desactivado.",
      vehicles: await getVehicleList(context.env.DB)
    });
  } catch (error) {
    console.error("STAFF VEHICLES POST ERROR:", error);
    return json({
      ok: false,
      error: "No se pudo cambiar la disponibilidad del vehículo."
    }, 500);
  }
}
