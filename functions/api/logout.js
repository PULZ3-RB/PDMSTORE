import { json } from "../_lib/http.js";
import { deleteCurrentSession, clearSessionCookie } from "../_lib/auth.js";

export async function onRequestPost(context) {
  try {
    await deleteCurrentSession(context.request, context.env.DB);
  } catch (error) {
    console.error(error);
  }

  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}
