PDMSTORE - VERSIÓN COMPLETA
===========================

ESTA VERSIÓN INCLUYE
--------------------
- Portada con la imagen Premium Deluxe Motorsport.
- Catálogo de vehículos.
- Precio calculado automáticamente desde el COSTO BASE.
- Porcentajes:
    D = +100%
    C = +80%
    B = +40%
    A = +20%
- TAX = 9.8%.
- Stock > 0 = unidad inmediata.
- Stock = 0 = solo por reserva.
- Formulario de reserva -> Discord.
- Login para empleados.
- Panel de ventas por empleado.
- Comisiones automáticas:
    D = 5%
    C = 4%
    B = 3%
    A = 2%
    S = 1%
- Historial y total de comisiones por empleado.
- Registro de ventas -> otro canal de Discord.

DONDE MODIFICAR LOS COCHES
--------------------------
Abre:

functions/_lib/vehicles.js

Ese es el archivo principal de vehículos.

Ejemplo:

{
  id: "remus",
  brand: "Annis",
  name: "Remus",
  type: "claseA",
  cost: 95000,
  stock: 0,
  image: "https://cdn.prodigyrp.net/vehicles/remus.webp"
}

cost = lo que tú pagas por el coche.
stock = 0 si es solo por reserva.
stock = 1, 2, 3... si hay unidades inmediatas.

NO tienes que escribir el precio de venta. Se calcula solo.

IMPORTANTE SOBRE CLOUDFLARE
---------------------------
Este proyecto usa Cloudflare Pages Functions.
No funciona completo como un HTML abierto directamente desde tu PC ni como GitHub Pages sin Functions.

Lo recomendado es conectar el repositorio de GitHub a Cloudflare Pages.

VARIABLES / SECRETS EN CLOUDFLARE
---------------------------------
Configura en tu proyecto:

1) DISCORD_RESERVATIONS_WEBHOOK_URL
   Webhook del canal donde quieres recibir las reservas.

2) DISCORD_SALES_WEBHOOK_URL
   Webhook del canal donde quieres recibir las ventas de empleados.

3) ADMIN_SETUP_KEY
   Una clave privada que tú inventes, por ejemplo una contraseña larga.
   NO la pongas dentro del código.
   Se usa en admin.html para crear cuentas.

No envíes tus webhooks ni ADMIN_SETUP_KEY por chat.

CONFIGURAR D1 PARA CUENTAS Y VENTAS
-----------------------------------
1. En Cloudflare crea una base de datos D1, por ejemplo:
   pdmstore-db

2. Ejecuta el contenido de schema.sql en esa base de datos.

3. En tu proyecto Pages, añade el binding de D1:
   Nombre del binding: DB
   Base de datos: pdmstore-db

CREAR CUENTAS DE EMPLEADO
-------------------------
IMPORTANTE: el endpoint /api/create-user ya está incluido en functions/api/create-user.js.

Después de configurar DB y ADMIN_SETUP_KEY abre:

https://TU-PAGINA.pages.dev/admin.html

Pon:
- Tu ADMIN_SETUP_KEY
- Usuario del empleado
- Nombre visible
- Contraseña

La contraseña se guarda usando PBKDF2 y no se guarda en texto plano.

INICIAR SESIÓN
--------------
Los empleados entran desde:

/login.html

Después de entrar pasan a:

/panel.html

COMISIONES
----------
La comisión se calcula sobre el PRECIO DEL VEHÍCULO ANTES DEL TAX.
El navegador no decide el precio ni la comisión: Cloudflare vuelve a calcularlos en el servidor.

ARCHIVOS IMPORTANTES
--------------------
index.html                  Catálogo público
main.css                    Estilos del catálogo
script.js                   Catálogo y reservas
login.html                  Login de empleados
panel.html                  Panel de empleado
panel.css                   Estilos de login/panel
panel.js                    Ventas e historial
admin.html                  Crear/actualizar cuentas
schema.sql                  Tablas D1
images/hero.png             Imagen de portada
functions/reserva.js        Reserva -> Discord
functions/api/vehicles.js   Catálogo calculado
functions/api/login.js      Login
functions/api/logout.js     Cerrar sesión
functions/api/me.js         Sesión actual
functions/api/ventas.js     Registrar/listar ventas
functions/api/create-user.js Crear cuentas
functions/_lib/vehicles.js  VEHÍCULOS + PRECIOS + COMISIONES
functions/_lib/auth.js      Seguridad de cuentas
functions/_lib/http.js      Utilidades del servidor
