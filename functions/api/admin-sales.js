import { json, cleanText } from "../_lib/http.js";
import { timingSafeEqual } from "../_lib/auth.js";

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

async function requireAdmin(context, body) {
  if (!context.env.DB) {
    return { error: json({ ok: false, error: "D1 no está conectado al binding DB." }, 500) };
  }

  if (!context.env.ADMIN_SETUP_KEY) {
    return { error: json({ ok: false, error: "ADMIN_SETUP_KEY no está configurado en Cloudflare." }, 500) };
  }

  const setupKey = String(body?.setupKey || "");
  const valid = await timingSafeEqual(setupKey, context.env.ADMIN_SETUP_KEY);

  if (!valid) {
    return { error: json({ ok: false, error: "Clave de administración incorrecta." }, 403) };
  }

  return { ok: true };
}

async function getEmployeeSummary(db) {
  const employeesResult = await db.prepare(`
    SELECT
      u.id,
      u.username,
      u.display_name,
      u.active,
      COUNT(s.id) AS sales_count,
      COALESCE(SUM(s.base_price), 0) AS sold_total,
      COALESCE(SUM(s.commission_amount), 0) AS commission_total
    FROM users u
    LEFT JOIN sales s ON s.user_id = u.id
    GROUP BY u.id, u.username, u.display_name, u.active
    ORDER BY commission_total DESC, sales_count DESC, u.display_name ASC
  `).all();

  const totals = await db.prepare(`
    SELECT
      COUNT(*) AS sales_count,
      COALESCE(SUM(base_price), 0) AS sold_total,
      COALESCE(SUM(commission_amount), 0) AS commission_total
    FROM sales
  `).first();

  return {
    employees: employeesResult.results || [],
    totals: totals || { sales_count: 0, sold_total: 0, commission_total: 0 }
  };
}

async function sendSummaryToDiscord(webhook, summary) {
  const employees = summary.employees || [];
  const batches = [];

  if (!employees.length) {
    batches.push([]);
  } else {
    for (let i = 0; i < employees.length; i += 20) {
      batches.push(employees.slice(i, i + 20));
    }
  }

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index];
    const isFirst = index === 0;

    const fields = batch.map(employee => ({
      name: `${employee.display_name} (@${employee.username})`,
      value:
        `🚘 Vehículos vendidos: **${Number(employee.sales_count || 0).toLocaleString("en-US")}**\n` +
        `💵 Total vendido: **${money(employee.sold_total)}**\n` +
        `💰 Comisión: **${money(employee.commission_total)}**`,
      inline: true
    }));

    if (!fields.length) {
      fields.push({
        name: "Sin empleados",
        value: "Todavía no hay empleados registrados.",
        inline: false
      });
    }

    const payload = {
      username: "PDMSTORE Administración",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: index === 0
          ? "📊 Resumen de ventas por empleado"
          : `📊 Resumen de ventas por empleado · ${index + 1}`,
        color: 0x2783DE,
        description: isFirst
          ? `**Ventas totales:** ${Number(summary.totals.sales_count || 0).toLocaleString("en-US")}\n` +
            `**Total vendido:** ${money(summary.totals.sold_total)}\n` +
            `**Comisiones totales:** ${money(summary.totals.commission_total)}`
          : undefined,
        fields,
        footer: { text: "Premium Deluxe Motorsport · PDMSTORE" },
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Discord admin summary:", detail);
      throw new Error("Discord rechazó el resumen de empleados.");
    }
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const auth = await requireAdmin(context, body);
    if (auth.error) return auth.error;

    const action = cleanText(body.action, 40) || "load";

    if (action === "load") {
      const summary = await getEmployeeSummary(context.env.DB);
      return json({ ok: true, ...summary });
    }

    if (action === "send-summary") {
      if (!context.env.DISCORD_ADMIN_WEBHOOK_URL) {
        return json({
          ok: false,
          error: "DISCORD_ADMIN_WEBHOOK_URL no está configurado en Cloudflare."
        }, 500);
      }

      const summary = await getEmployeeSummary(context.env.DB);
      await sendSummaryToDiscord(context.env.DISCORD_ADMIN_WEBHOOK_URL, summary);

      return json({
        ok: true,
        message: "Resumen de empleados enviado a Discord.",
        ...summary
      });
    }

    if (action === "clear-user") {
      const userId = Number(body.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return json({ ok: false, error: "Empleado no válido." }, 400);
      }

      const user = await context.env.DB.prepare(
        "SELECT id, display_name FROM users WHERE id = ? LIMIT 1"
      ).bind(userId).first();

      if (!user) {
        return json({ ok: false, error: "Empleado no encontrado." }, 404);
      }

      const result = await context.env.DB.prepare(
        "DELETE FROM sales WHERE user_id = ?"
      ).bind(userId).run();

      const summary = await getEmployeeSummary(context.env.DB);

      return json({
        ok: true,
        message: `Ventas de ${user.display_name} eliminadas.`,
        deleted: Number(result.meta?.changes || 0),
        ...summary
      });
    }

    if (action === "clear-all") {
      const result = await context.env.DB.prepare("DELETE FROM sales").run();
      const summary = await getEmployeeSummary(context.env.DB);

      return json({
        ok: true,
        message: "Se limpiaron todas las ventas registradas.",
        deleted: Number(result.meta?.changes || 0),
        ...summary
      });
    }

    return json({ ok: false, error: "Acción de administración no válida." }, 400);
  } catch (error) {
    console.error("ADMIN SALES ERROR:", error);
    return json({
      ok: false,
      error: "No se pudo completar la acción de administración."
    }, 500);
  }
}
