import { modules } from "../registry.js";
import { icons } from "../icons.js";
import { renderHoy } from "../hoy/hoy.js";

const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Un mosaico por módulo del registro.
const tile = (m) => `
  <a class="tile" href="#${m.route}" style="background:${m.tile.color}">
    ${m.icon}
    <span class="tile-title">${m.tile.title}<span class="tile-meta">${m.tile.meta}</span></span>
  </a>`;

export function render(view) {
  const now = new Date();
  const date = now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  view.innerHTML = `
    <h1 class="large-title">Buen ${days[now.getDay()]}, Lola</h1>

    <div class="section-head">${icons.calendar}<h2>Hoy</h2><span class="meta">${date}</span></div>
    ${renderHoy()}

    <div class="section-head">${icons.grid}<h2>Mis espacios</h2></div>
    <div class="tiles">${modules.map(tile).join("")}</div>
  `;
}
