// Bloque "Hoy": eventos del Calendario y Recordatorios de Apple.
// Los datos llegan desde un Atajo de iPhone que abre la app con esta dirección:
//   .../#/?hoy=<texto codificado>
// Formato del texto, una línea por ítem:
//   E|09:30|Título del evento     (evento con hora)
//   E||Título del evento          (evento de todo el día)
//   R|Título del recordatorio     (recordatorio)
// Los datos viven solo en el celular (almacenamiento local) y nunca se envían
// al servidor: lo que va después del "#" no sale del dispositivo.

const KEY = "lolalab.hoy";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Pasa "3:30 PM", "3:30 p. m." o "15:30" a "15:30".
function to24(t) {
  const m = t.match(/^(\d{1,2})[:.](\d{2})\s*([ap])?/i);
  if (!m) return t;
  let h = Number(m[1]);
  const ap = (m[3] || "").toLowerCase();
  if (ap === "p" && h < 12) h += 12;
  if (ap === "a" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

function parse(text) {
  const events = [];
  const reminders = [];
  for (const raw of text.split(/\r?\n/)) {
    const [type, a = "", b = ""] = raw.split("|").map((p) => p.trim());
    // Los eventos de todo el día llegan del Atajo con hora 0:00.
    const allDay = !a || /^0?0[:.]00(\s*a\.?\s*m\.?)?$/i.test(a) || /^12[:.]00\s*a\.?\s*m\.?$/i.test(a);
    if (type === "E" && b) events.push({ time: allDay ? "" : to24(a), title: b });
    else if (type === "R" && a) reminders.push({ title: a });
  }
  events.sort((x, y) => (x.time || "").localeCompare(y.time || ""));
  const now = new Date();
  const updated = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return { date: todayISO(), events, reminders, updated };
}

// Si la app se abrió desde el Atajo, guarda los datos y limpia la dirección.
export function captureFromUrl() {
  const hash = location.hash;
  const i = hash.indexOf("?");
  if (i === -1) return;
  const params = new URLSearchParams(hash.slice(i + 1));
  const text = params.get("hoy");
  if (text === null) return;
  try { localStorage.setItem(KEY, JSON.stringify(parse(text))); } catch { /* sin almacenamiento */ }
  history.replaceState(null, "", location.pathname + location.search + "#/");
  return true;
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    return data && data.date === todayISO() ? data : null;
  } catch {
    return null;
  }
}

export function renderHoy() {
  const data = load();

  if (!data) {
    return `
      <div class="empty-note">
        <strong>Tu día todavía no está cargado</strong>
        Abrí Lola Lab desde tu Atajo para ver tus eventos y recordatorios de hoy.
      </div>`;
  }

  const events = data.events.length
    ? data.events.map((e) => `
        <li class="group-item">
          <span class="group-label">${esc(e.title)}</span>
          <span class="group-value">${e.time ? esc(e.time) : "Todo el día"}</span>
        </li>`).join("")
    : `<li class="group-item group-empty">Sin eventos</li>`;

  const reminders = data.reminders.length
    ? data.reminders.map((r) => `
        <li class="group-item">
          <span class="check" aria-hidden="true"></span>
          <span class="group-label">${esc(r.title)}</span>
        </li>`).join("")
    : `<li class="group-item group-empty">Sin recordatorios</li>`;

  return `
    <ul class="group">${events}</ul>
    <ul class="group" style="margin-top: var(--space-3)">${reminders}</ul>
    <p class="hoy-updated">Actualizado a las ${data.updated || "—"}</p>`;
}
