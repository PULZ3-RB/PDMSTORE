import { json } from "./http.js";

const SESSION_COOKIE = "pdm_session";
const SESSION_DAYS = 7;
const PBKDF2_ITERATIONS = 120000;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}

function randomBytes(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function hashPassword(password, saltBase64) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(saltBase64),
      iterations: PBKDF2_ITERATIONS
    },
    keyMaterial,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

export async function makePassword(password) {
  const salt = bytesToBase64(randomBytes(16));
  const hash = await hashPassword(password, salt);
  return { salt, hash };
}

export async function verifyPassword(password, salt, expectedHash) {
  const actual = await hashPassword(password, salt);
  if (actual.length !== expectedHash.length) return false;

  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export function createSessionToken() {
  return bytesToHex(randomBytes(32));
}

export async function hashToken(token) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );
  return bytesToHex(new Uint8Array(digest));
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").map(part => {
      const index = part.indexOf("=");
      if (index < 0) return [part.trim(), ""];
      return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
    }).filter(([key]) => key)
  );
}

export function sessionCookie(token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function createSession(db, userId) {
  const token = createSessionToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();

  await db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES (?, ?, ?)`
  ).bind(tokenHash, userId, expiresAt).run();

  return token;
}

export async function getSessionUser(request, db) {
  if (!db) return null;

  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const tokenHash = await hashToken(token);

  const row = await db.prepare(
    `SELECT users.id, users.username, users.display_name
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ?
       AND sessions.expires_at > datetime('now')
       AND users.active = 1
     LIMIT 1`
  ).bind(tokenHash).first();

  return row || null;
}

export async function requireUser(context) {
  if (!context.env.DB) {
    return { error: json({ ok: false, error: "Base de datos D1 no configurada." }, 500) };
  }

  const user = await getSessionUser(context.request, context.env.DB);
  if (!user) {
    return { error: json({ ok: false, error: "Sesión no válida." }, 401) };
  }

  return { user };
}

export async function deleteCurrentSession(request, db) {
  if (!db) return;
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return;

  const tokenHash = await hashToken(token);
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?")
    .bind(tokenHash)
    .run();
}
