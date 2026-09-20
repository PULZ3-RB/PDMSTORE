const RESERVA_API_URL = "/reserva";


/* ================= VEHÍCULOS ================= */

const vehicles = [

  {
    brand: "Albany",
    name: "Primo",
    type: "claseC",
    km: "0 km",
    fuel: "Gasolina",
    price: "18,000",
    color: "#4f9def",
    image: "https://cdn.prodigyrp.net/vehicles/primo.webp"
  },

  {
    brand: "Albany",
    name: "Washington",
    type: "claseC",
    km: "0 km",
    fuel: "Gasolina",
    price: "5,760",
    color: "#4f9def",
    image: "https://cdn.prodigyrp.net/vehicles/washington.webp"
  }

];


let selectedVehicle = null;
let currentFilter = "todos";


/* ================= EMPLEADOS ================= */

const empleados = [

  {
    name: "Raven",
    phone: "605-042-3584",
    color: "#2783DE"
  },

  {
    name: "Nico Blaze",
    phone: "354-800-5830",
    color: "#46A171"
  }
];


/* ================= RENDER VEHÍCULOS ================= */

function renderCars(filter = currentFilter) {

  currentFilter = filter;

  const grid = document.getElementById("carsGrid");

  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();


  let filtered = vehicles;


  if (filter !== "todos") {

    filtered = filtered.filter(
      vehicle => vehicle.type === filter
    );

  }


  if (search) {

    filtered = filtered.filter(vehicle => {

      const text =
        `${vehicle.brand} ${vehicle.name} ${vehicle.fuel}`
          .toLowerCase();

      return text.includes(search);

    });

  }


  if (!filtered.length) {

    grid.innerHTML = `
      <div class="no-results">
        No se encontraron vehículos.
      </div>
    `;

    return;

  }


  grid.innerHTML = filtered.map(vehicle => `

    <article class="car-card">

      <div class="car-img">

        ${
          vehicle.image

            ? `
              <img
                src="${vehicle.image}"
                alt="${escapeHtml(
                  vehicle.brand + " " + vehicle.name
                )}">
            `

            : `
              <span
                style="
                  font-size:4rem;
                  opacity:.3;
                ">
                🚘
              </span>
            `
        }

      </div>


      <div class="car-body">

        <div class="car-brand">
          ${escapeHtml(vehicle.brand)}
        </div>

        <div class="car-name">
          ${escapeHtml(vehicle.name)}
        </div>


        <div class="car-specs">

          <span class="car-spec">
            📍 ${escapeHtml(vehicle.km)}
          </span>

          <span class="car-spec">
            ⛽ ${escapeHtml(vehicle.fuel)}
          </span>

        </div>


        <div class="car-price">
          $${escapeHtml(vehicle.price)}
          <span>PVP</span>
        </div>


        <div class="car-actions">

          <button
            class="btn-sm btn-sm-primary"
            onclick="openVehicleModal('${escapeJs(
              vehicle.brand + " " + vehicle.name
            )}')">

            VER VEHÍCULO

          </button>

          <button
            class="btn-sm btn-sm-ghost"
            onclick="preselect('${escapeJs(
              vehicle.brand + " " + vehicle.name
            )}')">

            RESERVAR

          </button>

        </div>

      </div>

    </article>

  `).join("");

}


/* ================= FILTROS ================= */

function filterCars(type, element) {

  document
    .querySelectorAll(".filter-btn")
    .forEach(button => {
      button.classList.remove("active");
    });


  element.classList.add("active");


  renderCars(type);

}


function searchCars() {

  renderCars(currentFilter);

}


/* ================= MODAL ================= */

function openVehicleModal(fullName) {

  const vehicle = vehicles.find(
    v => `${v.brand} ${v.name}` === fullName
  );


  if (!vehicle) return;


  selectedVehicle = vehicle;


  document.getElementById("modalBrand").textContent =
    vehicle.brand;

  document.getElementById("modalName").textContent =
    vehicle.name;

  document.getElementById("modalPrice").textContent =
    `$${vehicle.price}`;

  document.getElementById("modalKm").textContent =
    vehicle.km;

  document.getElementById("modalFuel").textContent =
    vehicle.fuel;

  document.getElementById("modalClass").textContent =
    getClassName(vehicle.type);


  const imageBox =
    document.getElementById("modalImage");


  if (vehicle.image) {

    imageBox.innerHTML = `
      <img
        src="${vehicle.image}"
        alt="${escapeHtml(
          vehicle.brand + " " + vehicle.name
        )}">
    `;

  } else {

    imageBox.innerHTML = `
      <span style="font-size:6rem;opacity:.25">
        🚘
      </span>
    `;

  }


  document
    .getElementById("vehicleModal")
    .classList.add("show");


  document.body.style.overflow = "hidden";

}


function closeVehicleModal() {

  document
    .getElementById("vehicleModal")
    .classList.remove("show");

  document.body.style.overflow = "";

}


function reserveSelectedVehicle() {

  if (!selectedVehicle) return;


  closeVehicleModal();


  preselect(
    `${selectedVehicle.brand} ${selectedVehicle.name}`
  );


  document
    .getElementById("reservar")
    .scrollIntoView({
      behavior: "smooth"
    });

}


function getClassName(type) {

  const classes = {
    claseA: "Clase A",
    claseB: "Clase B",
    claseC: "Clase C",
    claseD: "Clase D"
  };

  return classes[type] || type;

}


/* ================= SELECCIONAR VEHÍCULO ================= */

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


  const imageBox =
    document.getElementById("selectedCarImage");


  if (vehicle.image) {

    imageBox.innerHTML = `
      <img
        src="${vehicle.image}"
        alt="${escapeHtml(
          vehicle.brand + " " + vehicle.name
        )}">
    `;

  } else {

    imageBox.innerHTML = `
      <span>🚘</span>
    `;

  }

}


/* ================= EMPLEADOS ================= */

function renderEmpleados() {

  document.getElementById("empGrid").innerHTML =
    empleados.map(employee => `

      <div class="emp-card">

        <div
          class="emp-avatar"
          style="background:${employee.color}">

          ${employee.name
            .split(" ")
            .map(name => name[0])
            .join("")
            .slice(0, 2)}

        </div>


        <div>

          <div class="emp-name">
            ${escapeHtml(employee.name)}
          </div>

          <a
            class="emp-phone"
            href="tel:${employee.phone.replace(/\s/g, "")}">

            📞 ${escapeHtml(employee.phone)}

          </a>

        </div>

      </div>

    `).join("");

}


/* ================= RESERVA ================= */

async function enviarReserva(event) {

  event.preventDefault();


  if (!selectedVehicle) {

    showToast(
      "⚠️ Primero selecciona un vehículo."
    );

    return;

  }


  const btn =
    document.getElementById("submitBtn");


  const data = {

    nombre:
      document
        .getElementById("rNombre")
        .value
        .trim(),

    apellidos:
      document
        .getElementById("rApellidos")
        .value
        .trim(),

    telefono:
      document
        .getElementById("rTelefono")
        .value
        .trim(),

    vehiculo:
      `${selectedVehicle.brand} ${selectedVehicle.name}`,

    precio:
      selectedVehicle.price

  };


  if (
    !data.nombre ||
    !data.apellidos ||
    !data.telefono
  ) {

    showToast(
      "⚠️ Completa todos los campos."
    );

    return;

  }


  btn.disabled = true;

  btn.textContent = "Enviando...";


  try {

    const response = await fetch(
      RESERVA_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
      }
    );


    const result =
      await response.json();


    if (!result.ok) {

      throw new Error(
        result.error ||
        "No se pudo enviar la reserva."
      );

    }


    showToast(
      "✅ Reserva enviada correctamente."
    );


    btn.textContent =
      "✅ Reserva enviada";


    document
      .getElementById("reservaForm")
      .reset();


    setTimeout(() => {

      btn.disabled = false;

      btn.textContent =
        "ENVIAR RESERVA →";

    }, 2500);


  } catch (error) {

    console.error(
      "Error enviando reserva:",
      error
    );


    showToast(
      "❌ No se pudo enviar la reserva."
    );


    btn.disabled = false;

    btn.textContent =
      "ENVIAR RESERVA →";

  }

}


/* ================= TOAST ================= */

function showToast(message) {

  const toast =
    document.getElementById("toast");


  toast.textContent =
    message;


  toast.style.display =
    "block";


  setTimeout(() => {

    toast.style.display =
      "none";

  }, 4000);

}


/* ================= MENU ================= */

function toggleMenu() {

  document
    .getElementById("navLinks")
    .classList.toggle("open");

}


/* ================= UTILIDADES ================= */

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


/* ================= INICIO ================= */

renderCars();

renderEmpleados();