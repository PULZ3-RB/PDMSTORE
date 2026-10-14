export const TAX_RATE = 0.098;
export const LOAN_DOWN_PAYMENT_RATE = 0.30;

export const MARKUP_BY_CLASS = {
  claseD: 1.00,
  claseC: 0.80,
  claseB: 0.40,
  claseA: 0.20,
  claseS: 0.00
};

export const COMMISSION_BY_CLASS = {
  claseD: 0.05,
  claseC: 0.04,
  claseB: 0.03,
  claseA: 0.02,
  claseS: 0.01
};

export const VALID_VEHICLE_TYPES = new Set([
  "claseS",
  "claseA",
  "claseB",
  "claseC",
  "claseD"
]);

export const VALID_VEHICLE_CATEGORIES = new Set([
  "auto",
  "moto"
]);

export function calculateSalePrice(cost, type) {
  const markup = MARKUP_BY_CLASS[type] ?? 0;
  return Math.round(Number(cost || 0) * (1 + markup));
}

export function calculateTax(price) {
  return Math.round(Number(price || 0) * TAX_RATE);
}

export function calculateTotalWithTax(price) {
  return Number(price || 0) + calculateTax(price);
}

export function calculateLoanDownPayment(price) {
  return Math.round(Number(price || 0) * LOAN_DOWN_PAYMENT_RATE);
}

export function calculateCommission(price, type) {
  const rate = COMMISSION_BY_CLASS[type] ?? 0;
  return Math.round(Number(price || 0) * rate);
}

export function getClassName(type) {
  return ({
    claseS: "Clase S",
    claseA: "Clase A",
    claseB: "Clase B",
    claseC: "Clase C",
    claseD: "Clase D"
  })[type] || type;
}

export function getCategoryName(category) {
  return category === "moto" ? "Moto" : "Auto";
}

function normalizeRow(row) {
  if (!row) return null;

  const category = String(row.category || "auto").toLowerCase() === "moto"
    ? "moto"
    : "auto";

  return {
    id: String(row.id),
    brand: String(row.brand || ""),
    name: String(row.name || ""),
    type: String(row.type || ""),
    category,
    cost: Number(row.cost || 0),
    stock: Number(row.stock || 0),
    image: String(row.image || ""),
    active: Number(row.active ?? 1)
  };
}

function formatD1Timestamp(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Devuelve el último corte de rotación de Clase A usando hora de Panamá.
 * Panamá es UTC-5 todo el año: 00:00 = 05:00 UTC y 12:00 = 17:00 UTC.
 */
export function getLatestPanamaClassABoundary(now = new Date()) {
  const PANAMA_OFFSET_MS = 5 * 60 * 60 * 1000;
  const panamaNow = new Date(now.getTime() - PANAMA_OFFSET_MS);

  const year = panamaNow.getUTCFullYear();
  const month = panamaNow.getUTCMonth();
  const day = panamaNow.getUTCDate();
  const localHour = panamaNow.getUTCHours();
  const boundaryLocalHour = localHour >= 12 ? 12 : 0;

  return new Date(Date.UTC(
    year,
    month,
    day,
    boundaryLocalHour + 5,
    0,
    0
  ));
}

/**
 * Desactiva automáticamente TODOS los vehículos Clase A (autos y motos)
 * que estaban activos antes del
 * último corte de 00:00 / 12:00 (hora de Panamá).
 *
 * Si un trabajador/admin vuelve a activar un Clase A DESPUÉS del corte,
 * queda activo hasta el próximo corte.
 */
export async function ensureClassARotation(db, now = new Date()) {
  const boundary = formatD1Timestamp(getLatestPanamaClassABoundary(now));

  const result = await db.prepare(`
    UPDATE vehicles
    SET active = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE type = 'claseA'
      AND active = 1
      AND datetime(updated_at) < datetime(?)
  `).bind(boundary).run();

  return {
    boundary,
    deactivated: Number(result.meta?.changes || 0)
  };
}

export function getPublicVehicle(row) {
  const vehicle = normalizeRow(row);
  if (!vehicle) return null;

  const price = calculateSalePrice(vehicle.cost, vehicle.type);
  const tax = calculateTax(price);
  const total = calculateTotalWithTax(price);
  const loanDownPayment = calculateLoanDownPayment(price);

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    name: vehicle.name,
    type: vehicle.type,
    className: getClassName(vehicle.type),
    category: vehicle.category,
    categoryName: getCategoryName(vehicle.category),
    stock: vehicle.stock,
    image: vehicle.image,
    price,
    tax,
    total,
    loanDownPayment,
    availability: vehicle.stock > 0 ? "inmediata" : "reserva"
  };
}

export function getAdminVehicle(row) {
  const vehicle = normalizeRow(row);
  if (!vehicle) return null;

  const publicVehicle = getPublicVehicle(vehicle);
  const commissionRate = COMMISSION_BY_CLASS[vehicle.type] ?? 0;

  return {
    ...publicVehicle,
    cost: vehicle.cost,
    active: vehicle.active,
    markupRate: MARKUP_BY_CLASS[vehicle.type] ?? 0,
    commissionRate,
    commissionAmount: calculateCommission(publicVehicle.price, vehicle.type)
  };
}

export async function getVehicleById(db, id, options = {}) {
  await ensureClassARotation(db);

  const includeInactive = Boolean(options.includeInactive);
  const sql = includeInactive
    ? `SELECT * FROM vehicles WHERE id = ? LIMIT 1`
    : `SELECT * FROM vehicles WHERE id = ? AND active = 1 LIMIT 1`;

  const row = await db.prepare(sql).bind(String(id || "")).first();
  return normalizeRow(row);
}

export async function listVehicles(db, options = {}) {
  await ensureClassARotation(db);

  const includeInactive = Boolean(options.includeInactive);
  const sql = includeInactive
    ? `SELECT *
       FROM vehicles
       ORDER BY
         CASE LOWER(COALESCE(category, 'auto'))
           WHEN 'auto' THEN 1
           WHEN 'moto' THEN 2
           ELSE 9
         END,
         CASE type
           WHEN 'claseS' THEN 1
           WHEN 'claseA' THEN 2
           WHEN 'claseB' THEN 3
           WHEN 'claseC' THEN 4
           WHEN 'claseD' THEN 5
           ELSE 9
         END,
         brand COLLATE NOCASE,
         name COLLATE NOCASE`
    : `SELECT *
       FROM vehicles
       WHERE active = 1
       ORDER BY
         CASE LOWER(COALESCE(category, 'auto'))
           WHEN 'auto' THEN 1
           WHEN 'moto' THEN 2
           ELSE 9
         END,
         CASE type
           WHEN 'claseS' THEN 1
           WHEN 'claseA' THEN 2
           WHEN 'claseB' THEN 3
           WHEN 'claseC' THEN 4
           WHEN 'claseD' THEN 5
           ELSE 9
         END,
         brand COLLATE NOCASE,
         name COLLATE NOCASE`;

  try {
    const result = await db.prepare(sql).all();
    return (result.results || []).map(normalizeRow);
  } catch (error) {
    // Compatibilidad con una base antigua que todavía no tenga category.
    const oldSql = includeInactive
      ? `SELECT * FROM vehicles
         ORDER BY
           CASE type
             WHEN 'claseS' THEN 1
             WHEN 'claseA' THEN 2
             WHEN 'claseB' THEN 3
             WHEN 'claseC' THEN 4
             WHEN 'claseD' THEN 5
             ELSE 9
           END,
           brand COLLATE NOCASE,
           name COLLATE NOCASE`
      : `SELECT * FROM vehicles
         WHERE active = 1
         ORDER BY
           CASE type
             WHEN 'claseS' THEN 1
             WHEN 'claseA' THEN 2
             WHEN 'claseB' THEN 3
             WHEN 'claseC' THEN 4
             WHEN 'claseD' THEN 5
             ELSE 9
           END,
           brand COLLATE NOCASE,
           name COLLATE NOCASE`;

    const result = await db.prepare(oldSql).all();
    return (result.results || []).map(normalizeRow);
  }
}
