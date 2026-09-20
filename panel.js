let currentUser = null;
let vehicles = [];
let summary = null;

const commissionRates = {
  claseD: 0.05,
  claseC: 0.04,
  claseB: 0.03,
  claseA: 0.02,
  claseS: 0.01
};

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
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
  const select = document.getElementById("saleVehicle");
  select.innerHTML = `<option value="">Selecciona un vehículo</option>` + vehicles.map(v =>
    `<option value="${v.id}">${v.brand} ${v.name} · ${v.className}</option>`
  ).join("");
}

function renderPreview() {
  const id = document.getElementById("saleVehicle").value;
  const box = document.getElementById("vehiclePreview");
  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) {
    box.textContent = "Selecciona un vehículo para ver precio y comisión.";
    return;
  }

  const rate = commissionRates[vehicle.type] || 0;
  const commission = Math.round(vehicle.price * rate);
  box.innerHTML = `
    <strong>${vehicle.brand} ${vehicle.name}</strong><br>
    ${vehicle.className} · Precio ${money(vehicle.price)} · TAX ${money(vehicle.tax)} · Total ${money(vehicle.total)}<br>
    Comisión: ${(rate * 100).toFixed(0)}% = <strong>${money(commission)}</strong>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("saleVehicle").addEventListener("change", renderPreview);

document.getElementById("saleForm").addEventListener("submit", async event => {
  event.preventDefault();
  const btn = document.getElementById("saleBtn");
  const message = document.getElementById("saleMessage");

  btn.disabled = true;
  btn.textContent = "Registrando...";
  message.textContent = "";

  try {
    const response = await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: document.getElementById("saleVehicle").value,
        clientName: document.getElementById("clientName").value.trim(),
        paymentMethod: document.getElementById("paymentMethod").value
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo registrar la venta.");

    message.textContent = `Venta registrada. Comisión: ${money(result.sale.commissionAmount)}`;
    document.getElementById("saleForm").reset();
    renderPreview();
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

(async () => {
  if (!await requireLogin()) return;
  try {
    await Promise.all([loadVehicles(), loadSales()]);
  } catch (error) {
    console.error(error);
    document.getElementById("saleMessage").textContent = error.message;
  }
})();
