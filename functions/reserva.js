export async function onRequestPost(context) {

  try {

    const webhook =
      context.env.DISCORD_WEBHOOK_URL;


    if (!webhook) {

      return jsonResponse(
        {
          ok: false,
          error:
            "Webhook de Discord no configurado."
        },
        500
      );

    }


    const data =
      await context.request.json();


    const nombre =
      clean(data.nombre);

    const apellidos =
      clean(data.apellidos);

    const telefono =
      clean(data.telefono);

    const vehiculo =
      clean(data.vehiculo);

    const precio =
      clean(data.precio);


    if (
      !nombre ||
      !apellidos ||
      !telefono ||
      !vehiculo ||
      !precio
    ) {

      return jsonResponse(
        {
          ok: false,
          error:
            "Faltan datos obligatorios."
        },
        400
      );

    }


    const payload = {

      username: "PDMSTORE",

      embeds: [

        {

          title: "🚗 Nueva reserva",

          color: 0x2783DE,

          fields: [

            {
              name: "👤 Cliente",
              value:
                `${nombre} ${apellidos}`,
              inline: true
            },

            {
              name: "📞 Teléfono",
              value: telefono,
              inline: true
            },

            {
              name: "🚘 Vehículo",
              value: vehiculo,
              inline: true
            },

            {
              name: "💰 Precio",
              value: `$${precio}`,
              inline: true
            }

          ],

          footer: {
            text:
              "PDMSTORE · Nueva solicitud de reserva"
          },

          timestamp:
            new Date().toISOString()

        }

      ]

    };


    const discordResponse =
      await fetch(
        webhook,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)

        }
      );


    if (!discordResponse.ok) {

      console.error(
        await discordResponse.text()
      );


      return jsonResponse(
        {
          ok: false,
          error:
            "Discord rechazó el mensaje."
        },
        502
      );

    }


    return jsonResponse({

      ok: true,

      message:
        "Reserva enviada correctamente."

    });


  } catch (error) {

    console.error(error);


    return jsonResponse(
      {
        ok: false,
        error:
          "Error interno del servidor."
      },
      500
    );

  }

}


function clean(value) {

  return String(value || "")
    .trim()
    .slice(0, 500);

}


function jsonResponse(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {

      status,

      headers: {
        "Content-Type":
          "application/json"
      }

    }
  );

}