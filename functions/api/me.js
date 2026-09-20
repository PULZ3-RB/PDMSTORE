import { json } from "../_lib/http.js";
import { getCurrentUser } from "../_lib/auth.js";

export async function onRequestGet(context) {
  try {
    if (!context.env.DB) return json({ ok: false, error: "D1 no está conectado." }, 500);
    const user = await getCurrentUser(context.request, context.env.DB);
    if (!user) return json({ ok: false, error: "No autorizado." }, 401);
    return json({ ok: true, user });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo comprobar la sesión." }, 500);
  }
}
