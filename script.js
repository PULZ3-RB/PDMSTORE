/*
  PDMSTORE - configuración
  1. Crea tu Web App de Google Apps Script.
  2. Copia la URL /exec que te entregue Google.
  3. Pégala aquí.
*/
const RESERVA_API_URL = "/reserva";

const vehicles = [
  {
    brand: "BMW",
    name: "Serie 3 2024",
    type: "claseD",
    km: "0 km",
    fuel: "Gasolina",
    price: "45.900",
    color: "#4f9def",
    image: "https://kappa.lol/DB9n2d"
  },
  {
    brand: "Audi",
    name: "Q5 2024",
    type: "claseD",
    km: "0 km",
    fuel: "Gasolina",
    price: "52.500",
    color: "#e85454",
    image: ""
  },
  {
    brand: "Mercedes-Benz",
    name: "C220 2024",
    type: "claseC",
    km: "12.000 km",
    fuel: "Gasolina",
    price: "38.750",
    color: "#2C2C2B",
    image: ""
  },
  {
    brand: "Tesla",
    name: "Model 3",
    type: "claseB",
    km: "0 km",
    fuel: "Eléctrico",
    price: "41.990",
    color: "#46a171",
    image: ""
  }
];

const empleados = [
  { name: "Antonio Martínez", phone: "+34 600 100 001", color: "#2783DE" },
  { name: "Laura Sánchez", phone: "+34 600 100 002", color: "#46A171" },
  { name: "Carlos Rodríguez", phone: "+34 600 100 003", color: "#D5803B" },
  { name: "María López", phone: "+34 600 100 004", color: "#7C5CBF" },
  { name: "Pedro Jiménez", phone: "+34 600 100 005", color: "#E56458" },
  { name: "Ana Torres", phone: "+34 600 100 006", color: "#16A085" },
  { name: "Miguel García", phone: "+34 600 100 007", color: "#C0392B" },
  { name: "Sofía Fernández", phone: "+34 600 100 008", color: "#2C2C2B" }
];

let selectedVehicle = null;

function renderCars(filter = "todos") {
  const grid = document.getElementById("carsGrid");
  const filtered = filter === "todos"
    ? vehicles
    : vehicles.filter(v => v.type === filter);

  grid.innerHTML = filtered.map(v => `
    <div class="car-card">
      <div class="car-img">
        ${v.image
          ? `<img src="${v.image}" alt="${escapeHtml(v.brand + " " + v.name)}">`
          : `<span style="font-size:4rem;opacity:.3">🚘</span>`}
      </div>

      <div class="car-body">
        <div class="car-brand">${escapeHtml(v.brand)}</div>
        <div class="car-name">${escapeHtml(v.name)}</div>

        <div class="car-specs">
          <span class="car-spec">📍 ${escapeHtml(v.km)}</span>
          <span class="car-spec">⛽ ${escapeHtml(v.fuel)}</span>
        </div>

        <div class="car-price">
          $${escapeHtml(v.price)} <span>PVP</span>
        </div>

        <div class="car-actions">
          <a href="#reservar"
             class="btn-sm btn-sm-primary"
             onclick="preselect('${escapeJs(v.brand + " " + v.name)}')">
             Reservar
          </a>
          <button class="btn-sm btn-sm-ghost"
                  onclick="preselect('${escapeJs(v.brand + " " + v.name)}')">
            Ver más
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterCars(type, el) {
  document.querySelectorAll(".filter-btn")
    .forEach(btn => btn.classList.remove("active"));

  el.classList.add("active");
  renderCars(type);
}

function preselect(fullName) {
  const vehicle = vehicles.find(
    v => `${v.brand} ${v.name}` === fullName
  );

  if (!vehicle) return;

  selectedVehicle = vehicle;

  document.getElementById("rVehiculo").value =
    `${vehicle.brand} ${vehicle.name}`;

  document.getElementById("rPrecio").value =
    vehicle.price;

  document.getElementById("selectedCarBrand").textContent =
    vehicle.brand;

  document.getElementById("selectedCarName").textContent =
    vehicle.name;

  document.getElementById("selectedCarPrice").textContent =
    `$${vehicle.price}`;

  const imageBox = document.getElementById("selectedCarImage");

  if (vehicle.image) {
    imageBox.innerHTML =
      `<img src="${vehicle.image}" alt="${escapeHtml(vehicle.brand + " " + vehicle.name)}">`;
  } else {
    imageBox.innerHTML =
      `<span style="font-size:5rem;opacity:.3">🚘</span>`;
  }
}

function renderEmpleados() {
  document.getElementById("empGrid").innerHTML = empleados.map(e => `
    <div class="emp-card">
      <div class="emp-avatar" style="background:${e.color}">
        ${e.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>

      <div>
        <div class="emp-name">${escapeHtml(e.name)}</div>
        <a class="emp-phone"
           href="tel:${e.phone.replace(/\s/g, "")}">
          📞 ${escapeHtml(e.phone)}
        </a>
      </div>
    </div>
  `).join("");
}

async function enviarReserva(event) {
  event.preventDefault();

  if (!selectedVehicle) {
    showToast("⚠️ Primero selecciona un vehículo.");
    return;
  }

  const btn = document.getElementById("submitBtn");

  const data = {
    nombre: document.getElementById("rNombre").value.trim(),
    apellidos: document.getElementById("rApellidos").value.trim(),
    telefono: document.getElementById("rTelefono").value.trim(),
    vehiculo: `${selectedVehicle.brand} ${selectedVehicle.name}`,
    precio: selectedVehicle.price
  };

  if (!data.nombre || !data.apellidos || !data.telefono) {
    showToast("⚠️ Completa todos los campos.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    const response = await fetch("/reserva", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || "No se pudo enviar la reserva.");
    }

    btn.textContent = "✅ Reserva enviada";
    showToast("✅ Reserva enviada correctamente.");

    document.getElementById("reservaForm").reset();

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "Enviar reserva →";
    }, 2500);

  } catch (error) {
    console.error("Error:", error);

    btn.disabled = false;
    btn.textContent = "Enviar reserva →";

    showToast("❌ No se pudo enviar la reserva.");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeJs(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}

renderCars();
renderEmpleados();
