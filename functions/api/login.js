import { json } from "../_lib/http.js";
import {
  normalizeUsername,
  verifyPassword,
  createSession,
  sessionCookie
} from "../_lib/auth.js";

export async function onRequestPost(context) {
  try {
    if (!context.env.DB) return json({ ok: false, error: "D1 no está conectado." }, 500);

    const body = await context.request.json();
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    const user = await context.env.DB.prepare(`
      SELECT id, username, display_name, password_hash, password_salt, active
      FROM users
      WHERE username = ?
      LIMIT 1
    `).bind(username).first();

    if (!user || Number(user.active) !== 1 || !await verifyPassword(password, user.password_hash, user.password_salt)) {
      return json({ ok: false, error: "Usuario o contraseña incorrectos." }, 401);
    }

    await context.env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(new Date().toISOString()).run();
    const session = await createSession(context.env.DB, user.id);

    return json(
      { ok: true, user: { username: user.username, displayName: user.display_name } },
      200,
      { "Set-Cookie": sessionCookie(session.token, session.expiresAt) }
    );
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo iniciar sesión." }, 500);
  }
}
