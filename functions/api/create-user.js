import { json, cleanText } from "../_lib/http.js";
import {
  hashPassword,
  normalizeUsername,
  timingSafeEqual,
  validUsername
} from "../_lib/auth.js";

export async function onRequestPost(context) {
  try {
    if (!context.env.DB) {
      return json({
        ok: false,
        error: "D1 no está conectado al binding DB."
      }, 500);
    }

    if (!context.env.ADMIN_SETUP_KEY) {
      return json({
        ok: false,
        error: "ADMIN_SETUP_KEY no está configurado en Cloudflare."
      }, 500);
    }

    const body = await context.request.json();
    const setupKey = String(body.setupKey || "");

    const keyIsValid = await timingSafeEqual(
      setupKey,
      context.env.ADMIN_SETUP_KEY
    );

    if (!keyIsValid) {
      return json({
        ok: false,
        error: "Clave de administración incorrecta."
      }, 403);
    }

    const username = normalizeUsername(body.username);
    const displayName = cleanText(body.displayName, 80);
    const password = String(body.password || "");

    if (!validUsername(username)) {
      return json({
        ok: false,
        error: "El usuario debe tener 3-32 caracteres: letras minúsculas, números, punto, guion o guion bajo."
      }, 400);
    }

    if (!displayName) {
      return json({
        ok: false,
        error: "Falta el nombre visible."
      }, 400);
    }

    if (password.length < 6 || password.length > 128) {
      return json({
        ok: false,
        error: "La contraseña debe tener entre 6 y 128 caracteres."
      }, 400);
    }

    const passwordData = await hashPassword(password);
    const hash = passwordData.hash;
    const salt = passwordData.salt;

    await context.env.DB.prepare(`
      INSERT INTO users (
        username,
        display_name,
        password_hash,
        password_salt,
        active
      )
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(username) DO UPDATE SET
        display_name = excluded.display_name,
        password_hash = excluded.password_hash,
        password_salt = excluded.password_salt,
        active = 1
    `).bind(
      username,
      displayName,
      hash,
      salt
    ).run();

    const user = await context.env.DB.prepare(
      "SELECT id FROM users WHERE username = ? LIMIT 1"
    ).bind(username).first();

    if (user && user.id) {
      await context.env.DB.prepare(
        "DELETE FROM sessions WHERE user_id = ?"
      ).bind(user.id).run();
    }

    return json({
      ok: true,
      message: `Cuenta ${username} creada/actualizada correctamente.`
    });

  } catch (error) {
    console.error("ERROR CREANDO USUARIO:", error);

    const errorMessage =
      error && error.message
        ? error.message
        : String(error);

    return json({
      ok: false,
      error: "Error interno: " + errorMessage
    }, 500);
  }
}