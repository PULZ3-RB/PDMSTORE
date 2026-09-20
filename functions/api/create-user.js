import { json, clean } from "../_lib/http.js";
import { makePassword } from "../_lib/auth.js";

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    const setupKey = context.env.ADMIN_SETUP_KEY;

    if (!db) return json({ ok: false, error: "Base de datos D1 no configurada." }, 500);
    if (!setupKey) return json({ ok: false, error: "ADMIN_SETUP_KEY no configurada." }, 500);

    const body = await context.request.json();
    const key = String(body.setupKey || "");

    if (key !== setupKey) {
      return json({ ok: false, error: "Clave de administración incorrecta." }, 403);
    }

    const username = clean(body.username, 50).toLowerCase();
    const displayName = clean(body.displayName, 80);
    const password = String(body.password || "");

    if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
      return json({ ok: false, error: "Usuario inválido. Usa 3-50 letras, números, punto, guion o guion bajo." }, 400);
    }

    if (!displayName || password.length < 6) {
      return json({ ok: false, error: "Pon un nombre y una contraseña de mínimo 6 caracteres." }, 400);
    }

    const { salt, hash } = await makePassword(password);

    await db.prepare(
      `INSERT INTO users (username, display_name, password_hash, password_salt, active)
       VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(username) DO UPDATE SET
         display_name = excluded.display_name,
         password_hash = excluded.password_hash,
         password_salt = excluded.password_salt,
         active = 1`
    ).bind(username, displayName, hash, salt).run();

    return json({ ok: true, message: `Cuenta ${username} creada/actualizada.` });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo crear la cuenta." }, 500);
  }
}
