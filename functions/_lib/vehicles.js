export const TAX_RATE = 0.098;

export const MARKUP_BY_CLASS = {
  claseD: 1.00, // +100%
  claseC: 0.80, // +80%
  claseB: 0.40, // +40%
  claseA: 0.20, // +20%
  claseS: 0.00  // cámbialo aquí si luego defines un margen para S
};

export const COMMISSION_BY_CLASS = {
  claseD: 0.05, // 5%
  claseC: 0.04, // 4%
  claseB: 0.03, // 3%
  claseA: 0.02, // 2%
  claseS: 0.01  // 1%
};

/*
  ESTE ES EL ARCHIVO PRINCIPAL QUE MODIFICAS PARA LOS COCHES.

  - cost = lo que PDM paga por el coche.
  - stock = 0 significa "Solo por reserva".
  - stock > 0 significa unidades inmediatas.
  - El precio de venta se calcula automáticamente por clase.
*/
export const vehicles = [
  /* ================= CLASE A ================= */
  {
    id: "remus",
    brand: "Annis",
    name: "Remus",
    type: "claseA",
    cost: 95000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/remus.webp"
  },

  /* ================= CLASE B ================= */
  {
    id: "komoda",
    brand: "Lampadati",
    name: "Komoda",
    type: "claseB",
    cost: 66000,
    stock: 0,
    image: "https://cdn.prodigyrp.net/vehicles/komoda.webp"
  },
  {
    id: "terminus",
    brand: "Canis",
    name: "Terminus",
    type: "claseB",
    cost: 62500,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/terminus.webp"
  },
  {
    id: "castigator",
    brand: "Canis",
    name: "Castigator",
    type: "claseB",
    cost: 60000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/castigator.webp"
  },

  /* ================= CLASE C ================= */
  {
    id: "patriot",
    brand: "Mammoth",
    name: "Patriot",
    type: "claseC",
    cost: 10000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/patriot.webp"
  },
  {
    id: "sandking-d155-xl",
    brand: "Vapid",
    name: "Sandking D155 XL",
    type: "claseC",
    cost: 17500,
    stock: 3,
    image: "https://cdn.prodigyrp.net/vehicles/onx_sandking3.webp"
  },
  {
    id: "primo",
    brand: "Albany",
    name: "Primo",
    type: "claseC",
    cost: 10000,
    stock: 2,
    image: "https://cdn.prodigyrp.net/vehicles/primo.webp"
  },
  {
    id: "washington",
    brand: "Albany",
    name: "Washington",
    type: "claseC",
    cost: 3200,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/washington.webp"
  },
  {
    id: "comet-cl",
    brand: "Pfister",
    name: "Comet CL",
    type: "claseC",
    cost: 16000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/gbcometcl.webp"
  },
  {
    id: "asterope",
    brand: "Karin",
    name: "Asterope",
    type: "claseC",
    cost: 10000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/asterope.webp"
  },
  {
    id: "sandking-d155-swb",
    brand: "Vapid",
    name: "Sandking D155 SWB",
    type: "claseC",
    cost: 17000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/onx_sandking2.webp"
  },
  {
    id: "baller-ii",
    brand: "Gallivan",
    name: "Baller II",
    type: "claseC",
    cost: 10000,
    stock: 2,
    image: "https://cdn.prodigyrp.net/vehicles/baller2.webp"
  },
  {
    id: "contender",
    brand: "Vapid",
    name: "Contender",
    type: "claseC",
    cost: 17555.56,
    stock: 2,
    image: "https://cdn.prodigyrp.net/vehicles/contender.webp"
  },
  {
    id: "jogger-passenger-lwb-4x4",
    brand: "Benefactor",
    name: "Jogger Passenger LWB 4x4",
    type: "claseC",
    cost: 19000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/onx_tfjoggerpl3.webp"
  },

  /* ================= CLASE D ================= */
  {
    id: "tow-truck",
    brand: "Stanley",
    name: "Tow Truck",
    type: "claseD",
    cost: 3000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/towtruck2.webp"
  },
  {
    id: "paradise",
    brand: "Bravado",
    name: "Paradise",
    type: "claseD",
    cost: 5000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/paradise.webp"
  },
  {
    id: "speedo",
    brand: "Vapid",
    name: "Speedo",
    type: "claseD",
    cost: 2000,
    stock: 1,
    image: "https://cdn.prodigyrp.net/vehicles/speedo.webp"
  },
  {
    id: "ratbike",
    brand: "Western",
    name: "Ratbike",
    type: "claseD",
    cost: 1000,
    stock: 3,
    image: "https://cdn.prodigyrp.net/vehicles/ratbike.webp"
  }
];

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

export function getVehicleById(id) {
  return vehicles.find(vehicle => vehicle.id === id);
}

export function getPublicVehicle(vehicle) {
  const price = calculateSalePrice(vehicle.cost, vehicle.type);
  const tax = calculateTax(price);
  const total = calculateTotalWithTax(price);

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    name: vehicle.name,
    type: vehicle.type,
    className: getClassName(vehicle.type),
    stock: Number(vehicle.stock || 0),
    image: vehicle.image || "",
    price,
    tax,
    total,
    availability: Number(vehicle.stock || 0) > 0 ? "inmediata" : "reserva"
  };
}
