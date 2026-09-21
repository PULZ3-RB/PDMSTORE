export const TAX_RATE = 0.098;

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

function normalizeRow(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    brand: String(row.brand || ""),
    name: String(row.name || ""),
    type: String(row.type || ""),
    cost: Number(row.cost || 0),
    stock: Number(row.stock || 0),
    image: String(row.image || ""),
    active: Number(row.active ?? 1)
  };
}

export function getPublicVehicle(row) {
  const vehicle = normalizeRow(row);
  if (!vehicle) return null;

  const price = calculateSalePrice(vehicle.cost, vehicle.type);
  const tax = calculateTax(price);
  const total = calculateTotalWithTax(price);

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    name: vehicle.name,
    type: vehicle.type,
    className: getClassName(vehicle.type),
    stock: vehicle.stock,
    image: vehicle.image,
    price,
    tax,
    total,
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
  const includeInactive = Boolean(options.includeInactive);
  const sql = includeInactive
    ? `SELECT id, brand, name, type, cost, stock, image, active
       FROM vehicles
       WHERE id = ?
       LIMIT 1`
    : `SELECT id, brand, name, type, cost, stock, image, active
       FROM vehicles
       WHERE id = ? AND active = 1
       LIMIT 1`;

  const row = await db.prepare(sql).bind(String(id || "")).first();
  return normalizeRow(row);
}

export async function listVehicles(db, options = {}) {
  const includeInactive = Boolean(options.includeInactive);
  const sql = includeInactive
    ? `SELECT id, brand, name, type, cost, stock, image, active
       FROM vehicles
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
    : `SELECT id, brand, name, type, cost, stock, image, active
       FROM vehicles
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

  const result = await db.prepare(sql).all();
  return (result.results || []).map(normalizeRow);
}
