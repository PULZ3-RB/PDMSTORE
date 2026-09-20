import { vehicles, getPublicVehicle } from "../_lib/vehicles.js";
import { json } from "../_lib/http.js";

export async function onRequestGet() {
  return json({
    ok: true,
    vehicles: vehicles.map(getPublicVehicle)
  });
}
