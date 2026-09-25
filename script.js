const RESERVA_API_URL = "/reserva";

let vehicles = [];
let selectedVehicle = null;
let currentFilter = "todos";

const empleados = [
  { name: "Raven", phone: "605-042-3584", color: "#2783DE" },
  { name: "Nico Blaze", phone: "354-800-5830", color: "#46A171" },
  { name: "Emmett Hobbs", phone: "265-348-1214", color: "#46A171" }
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function availabilityText(vehicle) {
  const stock = Number(vehicle.stock || 0);
  return stock > 0
    ? `Unidad inmediata · ${stock} disponible${stock === 1 ? "" : "s"}`
    : "Solo por reserva";
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
  return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function loadVehicles() {
  const grid = document.getElementById("carsGrid");

  try {
    const response = await fetch("/api/vehicles", { cache: "no-store" });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "No se pudo cargar el catálogo.");
    }

    vehicles = result.vehicles || [];
    renderCars();
  } catch (error) {
    console.error(error);
    if (grid) {
      grid.innerHTML = `<div class="no-results">No se pudo cargar el catálogo. Verifica que Cloudflare Pages Functions esté desplegado.</div>`;
    }
  }
}

function renderCars(filter = currentFilter) {
  currentFilter = filter;
  const grid = document.getElementById("carsGrid");
  if (!grid) return;

  const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();

  let filtered = [...vehicles];
  if (filter !== "todos") filtered = filtered.filter(v => v.type === filter);
  if (search) {
    filtered = filtered.filter(v => `${v.brand} ${v.name} ${v.className}`.toLowerCase().includes(search));
  }

  if (!filtered.length) {
    grid.innerHTML = `<div class="no-results">No se encontraron vehículos.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(vehicle => {
    const availability = vehicle.stock > 0
      ? `<span class="availability available">● UNIDAD INMEDIATA · ${vehicle.stock} disponible${vehicle.stock === 1 ? "" : "s"}</span>`
      : `<span class="availability reservation">◷ SOLO POR RESERVA</span>`;

    return `
      <article class="car-card">
        <div class="car-img">
          ${vehicle.image
            ? `<img src="${vehicle.image}" alt="${escapeHtml(vehicle.brand + " " + vehicle.name)}">`
            : `<span style="font-size:4rem;opacity:.3">🚘</span>`}
        </div>

        <div class="car-body">
          <div class="car-brand">${escapeHtml(vehicle.brand)}</div>
          <div class="car-name">${escapeHtml(vehicle.name)}</div>
          <div class="car-specs"><span class="car-spec">🚘 ${escapeHtml(vehicle.className)}</span></div>
          <div class="car-availability">${availability}</div>
          <div class="car-price">$${formatMoney(vehicle.price)}<span>+ TAX 9.8%</span></div>

          <div class="car-actions">
            <button class="btn-sm btn-sm-primary" onclick="openVehicleModal('${escapeJs(vehicle.id)}')">VER VEHÍCULO</button>
            <button class="btn-sm btn-sm-ghost" onclick="preselect('${escapeJs(vehicle.id)}')">RESERVAR</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function filterCars(type, element) {
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  element?.classList.add("active");
  renderCars(type);
}

function searchCars() {
  renderCars(currentFilter);
}

function getVehicle(id) {
  return vehicles.find(v => v.id === id);
}

function openVehicleModal(id) {
  const vehicle = getVehicle(id);
  if (!vehicle) return;
  selectedVehicle = vehicle;

  document.getElementById("modalBrand").textContent = vehicle.brand;
  document.getElementById("modalName").textContent = vehicle.name;
  document.getElementById("modalPrice").textContent = `$${formatMoney(vehicle.price)}`;
  document.getElementById("modalClass").textContent = vehicle.className;
  document.getElementById("modalAvailability").textContent = availabilityText(vehicle);
  document.getElementById("modalTax").textContent = `$${formatMoney(vehicle.tax)}`;
  document.getElementById("modalTotal").textContent = `$${formatMoney(vehicle.total)}`;

  const imageBox = document.getElementById("modalImage");
  imageBox.innerHTML = vehicle.image
    ? `<img src="${vehicle.image}" alt="${escapeHtml(vehicle.brand + " " + vehicle.name)}">`
    : `<span style="font-size:6rem;opacity:.25">🚘</span>`;

  document.getElementById("vehicleModal").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeVehicleModal() {
  document.getElementById("vehicleModal")?.classList.remove("show");
  document.body.style.overflow = "";
}

function reserveSelectedVehicle() {
  if (!selectedVehicle) return;
  const id = selectedVehicle.id;
  closeVehicleModal();
  preselect(id);
}

function preselect(id) {
  const vehicle = getVehicle(id);
  if (!vehicle) return;
  selectedVehicle = vehicle;

  document.getElementById("rVehiculo").value = `${vehicle.brand} ${vehicle.name}`;
  document.getElementById("rPrecio").value = vehicle.price;
  document.getElementById("selectedCarBrand").textContent = vehicle.brand;
  document.getElementById("selectedCarName").textContent = vehicle.name;
  document.getElementById("selectedCarPrice").textContent = `$${formatMoney(vehicle.price)}`;
  document.getElementById("reservationAvailability").textContent = availabilityText(vehicle);
  document.getElementById("reservationBasePrice").textContent = `$${formatMoney(vehicle.price)}`;
  document.getElementById("reservationTax").textContent = `$${formatMoney(vehicle.tax)}`;
  document.getElementById("reservationTotal").textContent = `$${formatMoney(vehicle.total)}`;

  const imageBox = document.getElementById("selectedCarImage");
  imageBox.innerHTML = vehicle.image
    ? `<img src="${vehicle.image}" alt="${escapeHtml(vehicle.brand + " " + vehicle.name)}">`
    : `<span>🚘</span>`;

  document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
}

function renderEmpleados() {
  const grid = document.getElementById("empGrid");
  if (!grid) return;

  grid.innerHTML = empleados.map(employee => `
    <div class="emp-card">
      <div class="emp-avatar" style="background:${employee.color}">${employee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
      <div>
        <div class="emp-name">${escapeHtml(employee.name)}</div>
        <a class="emp-phone" href="tel:${employee.phone.replace(/\s/g, "")}">📞 ${escapeHtml(employee.phone)}</a>
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
    vehicleId: selectedVehicle.id
  };

  if (!data.nombre || !data.apellidos || !data.telefono) {
    showToast("⚠️ Completa todos los campos.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    const response = await fetch(RESERVA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo enviar la reserva.");

    showToast("✅ Reserva enviada correctamente.");
    btn.textContent = "✅ Reserva enviada";
    document.getElementById("reservaForm").reset();

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "Enviar reserva →";
    }, 2200);
  } catch (error) {
    console.error(error);
    showToast(`❌ ${error.message}`);
    btn.disabled = false;
    btn.textContent = "Enviar reserva →";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { toast.style.display = "none"; }, 4000);
}

function toggleMenu() {
  document.getElementById("navLinks")?.classList.toggle("open");
}

renderEmpleados();
loadVehicles();
