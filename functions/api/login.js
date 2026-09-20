import { json, clean } from "../_lib/http.js";
import { verifyPassword, createSession, sessionCookie } from "../_lib/auth.js";

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    if (!db) return json({ ok: false, error: "Base de datos D1 no configurada." }, 500);

    const body = await context.request.json();
    const username = clean(body.username, 50).toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return json({ ok: false, error: "Completa usuario y contraseña." }, 400);
    }

    const user = await db.prepare(
      `SELECT id, username, display_name, password_hash, password_salt, active
       FROM users WHERE username = ? LIMIT 1`
    ).bind(username).first();

    if (!user || !user.active) {
      return json({ ok: false, error: "Usuario o contraseña incorrectos." }, 401);
    }

    const valid = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!valid) {
      return json({ ok: false, error: "Usuario o contraseña incorrectos." }, 401);
    }

    await db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
    const token = await createSession(db, user.id);

    return json(
      { ok: true, user: { username: user.username, displayName: user.display_name } },
      200,
      { "Set-Cookie": sessionCookie(token) }
    );
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo iniciar sesión." }, 500);
  }
}
