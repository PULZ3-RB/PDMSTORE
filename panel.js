let currentUser = null;
let vehicles = [];
let staffVehicles = [];
let summary = null;

const commissionRates = {
  claseD: 0.05,
  claseC: 0.04,
  claseB: 0.03,
  claseA: 0.02,
  claseS: 0.01
};

const markupRates = {
  claseD: 1.00,
  claseC: 0.80,
  claseB: 0.40,
  claseA: 0.20,
  claseS: 0.00
};

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function requireLogin() {
  const response = await fetch("/api/me", { cache: "no-store" });
  if (!response.ok) {
    location.href = "login.html";
    return false;
  }

  const result = await response.json();
  currentUser = result.user;
  document.getElementById("userName").textContent = currentUser.displayName;
  document.getElementById("welcomeName").textContent = currentUser.displayName;
  return true;
}

async function loadVehicles() {
  const response = await fetch("/api/vehicles", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "No se pudieron cargar los vehículos.");

  vehicles = result.vehicles || [];

  const selectedId = document.getElementById("saleVehicle").value;
  if (selectedId && !vehicles.some(vehicle => vehicle.id === selectedId)) {
    clearSaleVehicleSelection();
  }

  renderSaleVehicleSuggestions();
}

function getMatchingSaleVehicles(query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return vehicles.slice(0, 10);

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return vehicles
    .map(vehicle => {
      const name = normalizeSearchText(vehicle.name);
      const brand = normalizeSearchText(vehicle.brand);
      const haystack = normalizeSearchText(
        `${vehicle.brand} ${vehicle.name} ${vehicle.className} ${vehicle.categoryName}`
      );

      if (!terms.every(term => haystack.includes(term))) return null;

      let score = 4;
      if (name === normalizedQuery || `${brand} ${name}` === normalizedQuery) score = 0;
      else if (name.startsWith(normalizedQuery)) score = 1;
      else if (brand.startsWith(normalizedQuery)) score = 2;
      else if (haystack.includes(normalizedQuery)) score = 3;

      return { vehicle, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.vehicle.name.localeCompare(b.vehicle.name))
    .slice(0, 10)
    .map(item => item.vehicle);
}

function renderSaleVehicleSuggestions() {
  const input = document.getElementById("saleVehicleSearch");
  const suggestions = document.getElementById("saleVehicleSuggestions");
  if (!input || !suggestions) return;

  const matches = getMatchingSaleVehicles(input.value);

  if (!document.activeElement || document.activeElement !== input) {
    suggestions.hidden = true;
    return;
  }

  if (!matches.length) {
    suggestions.innerHTML = `<div class="sale-vehicle-no-results">No se encontraron vehículos activos.</div>`;
    suggestions.hidden = false;
    return;
  }

  suggestions.innerHTML = matches.map(vehicle => `
    <button type="button" class="sale-vehicle-option" data-sale-vehicle-id="${escapeHtml(vehicle.id)}">
      <span class="sale-vehicle-option-name">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.name)}</span>
      <span class="sale-vehicle-option-meta">${escapeHtml(vehicle.categoryName)} · ${escapeHtml(vehicle.className)} · ${money(vehicle.price)}</span>
    </button>
  `).join("");
  suggestions.hidden = false;
}

function selectSaleVehicle(id) {
  const vehicle = vehicles.find(item => item.id === id);
  if (!vehicle) return;

  document.getElementById("saleVehicle").value = vehicle.id;
  document.getElementById("saleVehicleSearch").value = `${vehicle.brand} ${vehicle.name}`;
  document.getElementById("saleVehicleSuggestions").hidden = true;
  renderPreview();
}

function clearSaleVehicleSelection() {
  document.getElementById("saleVehicle").value = "";
  document.getElementById("saleVehicleSearch").value = "";
  document.getElementById("saleVehicleSuggestions").hidden = true;
  renderPreview();
}

function renderPreview() {
  const id = document.getElementById("saleVehicle").value;
  const box = document.getElementById("vehiclePreview");
  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) {
    box.textContent = "Escribe el nombre del vehículo y selecciónalo para ver precio y comisión.";
    return;
  }

  const rate = commissionRates[vehicle.type] || 0;
  const commission = Math.round(vehicle.price * rate);
  box.innerHTML = `
    <strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.name)}</strong><br>
    ${escapeHtml(vehicle.categoryName || (vehicle.category === "moto" ? "Moto" : "Auto"))} · ${escapeHtml(vehicle.className)} · Precio ${money(vehicle.price)} · TAX ${money(vehicle.tax)} · Total ${money(vehicle.total)}<br>
    Comisión: ${(rate * 100).toFixed(rate * 100 % 1 ? 1 : 0)}% = <strong>${money(commission)}</strong>
  `;
}

async function loadSales() {
  const response = await fetch("/api/ventas", { cache: "no-store" });
  if (response.status === 401) {
    location.href = "login.html";
    return;
  }

  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo cargar el historial.");

  summary = result.summary;
  document.getElementById("salesCount").textContent = Number(summary.sales_count || 0).toLocaleString("en-US");
  document.getElementById("soldTotal").textContent = money(summary.sold_total);
  document.getElementById("commissionTotal").textContent = money(summary.commission_total);

  const list = document.getElementById("salesList");
  const sales = result.sales || [];

  if (!sales.length) {
    list.innerHTML = `<div class="empty-state">Todavía no tienes ventas registradas.</div>`;
    return;
  }

  list.innerHTML = sales.map(sale => `
    <div class="sale-item">
      <div class="sale-top">
        <div class="sale-name">${escapeHtml(sale.vehicle_name)}</div>
        <div class="sale-date">${escapeHtml(sale.created_at)}</div>
      </div>
      <div class="sale-meta">
        <span>${escapeHtml(sale.vehicle_class)}</span>
        <span>Cliente: ${escapeHtml(sale.client_name)}</span>
        <span>Venta: ${money(sale.base_price)}</span>
        <span class="sale-commission">Comisión: ${money(sale.commission_amount)}</span>
      </div>
    </div>
  `).join("");
}

async function loadStaffVehicles() {
  const response = await fetch("/api/staff-vehicles", { cache: "no-store" });

  if (response.status === 401) {
    location.href = "login.html";
    return;
  }

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "No se pudo cargar la disponibilidad del catálogo.");
  }

  staffVehicles = result.vehicles || [];
  renderStaffVehicles();
}

function renderStaffVehicles() {
  const list = document.getElementById("staffVehiclesList");
  const search = normalizeSearchText(document.getElementById("staffVehicleSearch")?.value || "");
  const classFilter = document.getElementById("staffVehicleClassFilter")?.value || "todos";
  const statusFilter = document.getElementById("staffVehicleStatusFilter")?.value || "todos";

  const filtered = staffVehicles.filter(vehicle => {
    if (classFilter !== "todos" && vehicle.type !== classFilter) return false;

    const isActive = Number(vehicle.active) === 1;
    if (statusFilter === "activo" && !isActive) return false;
    if (statusFilter === "desactivado" && isActive) return false;

    if (!search) return true;
    const text = normalizeSearchText(`${vehicle.brand} ${vehicle.name} ${vehicle.className} ${vehicle.categoryName}`);
    return text.includes(search);
  });

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state">No se encontraron vehículos.</div>`;
    return;
  }

  list.innerHTML = filtered.map(vehicle => {
    const isActive = Number(vehicle.active) === 1;
    const categoryIcon = vehicle.category === "moto" ? "🏍️" : "🚘";

    return `
      <div class="staff-vehicle-row ${isActive ? "" : "staff-vehicle-disabled"}">
        <div class="staff-vehicle-info">
          <div class="staff-vehicle-name">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.name)}</div>
          <div class="staff-vehicle-meta">
            <span>${categoryIcon} ${escapeHtml(vehicle.categoryName)}</span>
            <span>🏷️ ${escapeHtml(vehicle.className)}</span>
            <span>Stock: ${Number(vehicle.stock || 0).toLocaleString("en-US")}</span>
            <span>${money(vehicle.price)}</span>
          </div>
        </div>

        <div class="staff-vehicle-controls">
          <span class="admin-status ${isActive ? "status-active" : "status-inactive"}">
            ${isActive ? "ACTIVO" : "DESACTIVADO"}
          </span>
          <button
            type="button"
            class="${isActive ? "mini-danger-btn" : "mini-enable-btn"} staff-toggle-btn"
            data-vehicle-id="${escapeHtml(vehicle.id)}"
            data-next-active="${isActive ? "0" : "1"}">
            ${isActive ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

async function toggleStaffVehicle(button) {
  const id = button.dataset.vehicleId;
  const nextActive = Number(button.dataset.nextActive) === 1 ? 1 : 0;
  const message = document.getElementById("staffVehicleMessage");

  button.disabled = true;
  message.textContent = "Guardando cambio...";

  try {
    const response = await fetch("/api/staff-vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set-active",
        id,
        active: nextActive
      })
    });

    if (response.status === 401) {
      location.href = "login.html";
      return;
    }

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "No se pudo cambiar la disponibilidad.");
    }

    staffVehicles = result.vehicles || [];
    message.textContent = result.message || "Disponibilidad actualizada.";
    renderStaffVehicles();
    await loadVehicles();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

function renderStaffAddPricePreview() {
  const cost = Number(document.getElementById("staffAddCost").value);
  const type = document.getElementById("staffAddType").value;
  const box = document.getElementById("staffAddPricePreview");

  if (!Number.isFinite(cost) || cost < 0) {
    box.textContent = "Introduce el costo base para ver el precio que aparecerá en el catálogo.";
    return;
  }

  const markup = markupRates[type] ?? 0;
  const price = Math.round(cost * (1 + markup));
  const tax = Math.round(price * 0.098);
  const total = price + tax;
  const downPayment = Math.round(price * 0.30);

  box.innerHTML = `
    Costo base: <strong>${money(cost)}</strong> ·
    Precio catálogo: <strong>${money(price)}</strong> ·
    TAX: ${money(tax)} · Total: ${money(total)} · Inicial 30%: ${money(downPayment)}
  `;
}

async function addStaffVehicle(event) {
  event.preventDefault();

  const button = document.getElementById("staffAddVehicleBtn");
  const message = document.getElementById("staffAddVehicleMessage");
  button.disabled = true;
  button.textContent = "Agregando...";
  message.textContent = "";

  try {
    const response = await fetch("/api/staff-vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        brand: document.getElementById("staffAddBrand").value.trim(),
        name: document.getElementById("staffAddName").value.trim(),
        category: document.getElementById("staffAddCategory").value,
        type: document.getElementById("staffAddType").value,
        cost: Number(document.getElementById("staffAddCost").value),
        stock: Number(document.getElementById("staffAddStock").value),
        image: document.getElementById("staffAddImage").value.trim()
      })
    });

    if (response.status === 401) {
      location.href = "login.html";
      return;
    }

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "No se pudo agregar el vehículo.");
    }

    staffVehicles = result.vehicles || [];
    renderStaffVehicles();
    await loadVehicles();

    const discordNote = result.discordSent === false && result.discordConfigured === false
      ? " El vehículo se guardó, pero no hay webhook de catálogo configurado."
      : "";

    message.textContent = `${result.message || "Vehículo agregado correctamente."}${discordNote}`;
    document.getElementById("staffAddVehicleForm").reset();
    document.getElementById("staffAddStock").value = "0";
    document.getElementById("staffAddCategory").value = "auto";
    document.getElementById("staffAddType").value = "claseA";
    renderStaffAddPricePreview();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Agregar vehículo";
  }
}

document.getElementById("saleVehicleSearch").addEventListener("focus", renderSaleVehicleSuggestions);
document.getElementById("saleVehicleSearch").addEventListener("input", () => {
  document.getElementById("saleVehicle").value = "";
  renderPreview();
  renderSaleVehicleSuggestions();
});

document.getElementById("saleVehicleSearch").addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  const first = document.querySelector("#saleVehicleSuggestions .sale-vehicle-option");
  if (!first) return;
  event.preventDefault();
  selectSaleVehicle(first.dataset.saleVehicleId);
});

document.getElementById("saleVehicleSuggestions").addEventListener("click", event => {
  const option = event.target.closest(".sale-vehicle-option");
  if (!option) return;
  selectSaleVehicle(option.dataset.saleVehicleId);
});

document.addEventListener("click", event => {
  if (!event.target.closest(".sale-vehicle-search-wrap")) {
    document.getElementById("saleVehicleSuggestions").hidden = true;
  }
});

document.getElementById("staffVehicleSearch").addEventListener("input", renderStaffVehicles);
document.getElementById("staffVehicleClassFilter").addEventListener("change", renderStaffVehicles);
document.getElementById("staffVehicleStatusFilter").addEventListener("change", renderStaffVehicles);

document.getElementById("staffVehiclesList").addEventListener("click", event => {
  const button = event.target.closest(".staff-toggle-btn");
  if (!button) return;
  toggleStaffVehicle(button);
});

document.getElementById("staffAddCost").addEventListener("input", renderStaffAddPricePreview);
document.getElementById("staffAddType").addEventListener("change", renderStaffAddPricePreview);
document.getElementById("staffAddVehicleForm").addEventListener("submit", addStaffVehicle);

document.getElementById("saleForm").addEventListener("submit", async event => {
  event.preventDefault();
  const btn = document.getElementById("saleBtn");
  const message = document.getElementById("saleMessage");
  const vehicleId = document.getElementById("saleVehicle").value;

  if (!vehicleId) {
    message.textContent = "Busca el vehículo por nombre y selecciónalo de la lista.";
    document.getElementById("saleVehicleSearch").focus();
    renderSaleVehicleSuggestions();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Registrando...";
  message.textContent = "";

  try {
    const response = await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        clientName: document.getElementById("clientName").value.trim(),
        paymentMethod: document.getElementById("paymentMethod").value
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo registrar la venta.");

    message.textContent = `Venta registrada. Comisión: ${money(result.sale.commissionAmount)}`;
    document.getElementById("saleForm").reset();
    clearSaleVehicleSelection();
    await loadSales();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Registrar venta";
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  location.href = "login.html";
});

// Mantiene el panel abierto sincronizado con los cortes de Clase A a la 1 AM / 1 PM.
function millisecondsUntilNextPanamaClassARotation() {
  const PANAMA_OFFSET_MS = 5 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const panamaNow = new Date(nowMs - PANAMA_OFFSET_MS);
  const year = panamaNow.getUTCFullYear();
  const month = panamaNow.getUTCMonth();
  const day = panamaNow.getUTCDate();
  const hour = panamaNow.getUTCHours();

  const nextUtcMs = hour < 1
    ? Date.UTC(year, month, day, 6, 0, 2)
    : hour < 13
      ? Date.UTC(year, month, day, 18, 0, 2)
      : Date.UTC(year, month, day + 1, 6, 0, 2);

  return Math.max(1000, nextUtcMs - nowMs);
}

function scheduleClassARotationRefresh() {
  clearTimeout(window.__classARotationTimer);
  window.__classARotationTimer = setTimeout(async () => {
    try {
      await Promise.all([loadVehicles(), loadStaffVehicles()]);
      document.getElementById("staffVehicleMessage").textContent =
        "Rotación de Clase A actualizada automáticamente.";
    } catch (error) {
      console.error(error);
    }
    scheduleClassARotationRefresh();
  }, millisecondsUntilNextPanamaClassARotation());
}

(async () => {
  if (!await requireLogin()) return;
  try {
    await Promise.all([
      loadVehicles(),
      loadSales(),
      loadStaffVehicles()
    ]);
    renderStaffAddPricePreview();
    scheduleClassARotationRefresh();
  } catch (error) {
    console.error(error);
    document.getElementById("saleMessage").textContent = error.message;
    document.getElementById("staffVehicleMessage").textContent = error.message;
  }
})();
