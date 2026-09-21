import { json } from "../_lib/http.js";
import { listVehicles, getPublicVehicle } from "../_lib/vehicles.js";

export async function onRequestGet(context) {
  try {
    if (!context.env.DB) {
      return json({
        ok: false,
        error: "D1 no está conectado al binding DB."
      }, 500);
    }

    const vehicles = await listVehicles(context.env.DB);

    return json({
      ok: true,
      vehicles: vehicles.map(getPublicVehicle)
    });
  } catch (error) {
    console.error("VEHICLES API ERROR:", error);
    return json({
      ok: false,
      error: "No se pudo cargar el catálogo."
    }, 500);
  }
}
