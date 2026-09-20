import { parseCookies } from "./http.js";

const COOKIE_NAME = "pdm_session";
const SESSION_DAYS = 7;
const PBKDF2_ITERATIONS = 120000;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBytes(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function sha256Base64(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value))
  );
  return bytesToBase64(new Uint8Array(digest));
}

async function derivePasswordHash(password, saltBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS
    },
    key,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function validUsername(username) {
  return /^[a-z0-9._-]{3,32}$/.test(username);
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  return {
    hash: await derivePasswordHash(password, salt),
    salt: bytesToBase64(salt)
  };
}

export async function verifyPassword(password, expectedHash, saltBase64) {
  const actual = await derivePasswordHash(password, base64ToBytes(saltBase64));
  return timingSafeEqual(actual, expectedHash);
}

export async function timingSafeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256Base64(a), sha256Base64(b)]);
  let diff = ha.length ^ hb.length;
  const max = Math.max(ha.length, hb.length);
  for (let i = 0; i < max; i++) {
    diff |= (ha.charCodeAt(i) || 0) ^ (hb.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function createSession(db, userId) {
  const token = bytesToBase64(randomBytes(32)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const tokenHash = await sha256Base64(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();

  await db.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
  ).bind(tokenHash, userId, expiresAt).run();

  return { token, expiresAt };
}

export function sessionCookie(token, expiresAt) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function getCurrentUser(request, db) {
  const token = parseCookies(request)[COOKIE_NAME];
  if (!token) return null;

  const tokenHash = await sha256Base64(token);
  const row = await db.prepare(`
    SELECT u.id, u.username, u.display_name, u.active, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first();

  if (!row || Number(row.active) !== 1) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }

  return {
    id: Number(row.id),
    username: row.username,
    displayName: row.display_name
  };
}

export async function deleteCurrentSession(request, db) {
  const token = parseCookies(request)[COOKIE_NAME];
  if (!token) return;
  const tokenHash = await sha256Base64(token);
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}
