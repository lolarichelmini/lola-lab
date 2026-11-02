// Módulo Tendencias — moda, a partir de los informes públicos de Pinterest.
// Lee content/tendencias/trends.json. Rutas: #/tendencias (lista) y #/tendencias/<id> (ficha).
// Cada tendencia: { id, title, summary, body, howto[], palette[{name,hex}], stats[{label,value}],
//                   image{src, alt, credit, creditUrl} }
// Fotos: Unsplash (licencia gratuita), con crédito al fotógrafo.
import { icons } from "../icons.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const img = (src, w) => `${src}?w=${w}&q=75&auto=format&fit=crop`;
const fmtWeek = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long" });

async function loadData() {
  try {
    const res = await fetch("content/tendencias/trends.json", { cache: "no-cache" });
    if (res.ok) return await res.json();
  } catch { /* sin conexión */ }
  return { trends: [] };
}

const credit = (i) =>
  `Foto: <a href="${esc(i.creditUrl)}?utm_source=lola_lab&utm_medium=referral" target="_blank" rel="noopener">${esc(i.credit)}</a> en <a href="https://unsplash.com/?utm_source=lola_lab&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`;

function listView(view, data) {
  const trends = data.trends ?? [];
  view.innerHTML = `
    <div class="top-actions"><a class="circle-btn" href="#/" aria-label="Volver al inicio">${icons.back}</a></div>
    <h1 class="large-title">Tendencias</h1>
    <p class="subtitle">${data.week ? `Semana del ${fmtWeek(data.week)}. ` : ""}Lo que marca Pinterest en moda, con colores y cómo llevarlo.</p>

    ${trends.length ? `
      <div class="trend-list">
        ${trends.map((t) => `
          <a class="trend-card" href="#/tendencias/${t.id}">
            <img src="${esc(img(t.image.src, 800))}" alt="${esc(t.image.alt)}" loading="lazy">
            <span class="trend-card-body">
              <span class="trend-card-title">${esc(t.title)}</span>
              <span class="trend-card-sub">${esc(t.summary)}</span>
              <span class="trend-dots" aria-hidden="true">${t.palette.map((c) => `<i style="background:${c.hex}"></i>`).join("")}</span>
            </span>
          </a>`).join("")}
      </div>
      ${data.report ? `<p class="trend-foot">Fuente: ${esc(data.report)}. Fotos de Unsplash.</p>` : ""}` : `
      <div class="empty-note">
        <strong>Todavía no hay tendencias</strong>
        Cada domingo van a aparecer acá las nuevas, con sus fotos y una explicación.
      </div>`}
  `;
}

function detailView(view, data, t) {
  view.innerHTML = `
    <div class="top-actions"><a class="circle-btn" href="#/tendencias" aria-label="Volver a tendencias">${icons.back}</a></div>

    <figure class="trend-hero">
      <img src="${esc(img(t.image.src, 1200))}" alt="${esc(t.image.alt)}">
      <figcaption>${credit(t.image)}</figcaption>
    </figure>

    <h1 class="large-title trend-title">${esc(t.title)}</h1>
    <p class="subtitle">${esc(t.summary)}</p>

    <div class="section-head"><h2>Paleta</h2></div>
    <ul class="palette">
      ${t.palette.map((c) => `
        <li><span class="palette-chip" style="background:${c.hex}"></span><span class="palette-name">${esc(c.name)}</span><span class="palette-hex">${esc(c.hex)}</span></li>`).join("")}
    </ul>

    <div class="section-head"><h2>Qué es</h2></div>
    <p class="trend-body">${esc(t.body)}</p>

    <div class="section-head"><h2>Cómo llevarlo</h2></div>
    <ul class="group">
      ${t.howto.map((h) => `<li class="group-item"><span class="check" aria-hidden="true"></span><span class="group-label">${esc(h)}</span></li>`).join("")}
    </ul>

    ${t.stats?.length ? `
      <div class="section-head"><h2>Datos de Pinterest</h2></div>
      <ul class="group">
        ${t.stats.map((s) => `<li class="group-item"><span class="group-label">${esc(s.label)}</span><span class="group-value stat">${esc(s.value)}</span></li>`).join("")}
      </ul>` : ""}

    ${data.sources?.length ? `
      <div class="section-head"><h2>Fuentes</h2></div>
      <ul class="group">
        ${data.sources.map((s) => `
          <li><a class="group-item" href="${esc(s.url)}" target="_blank" rel="noopener">
            <span class="group-label">${esc(s.title)}</span><span class="chevron" aria-hidden="true">↗</span>
          </a></li>`).join("")}
      </ul>` : ""}
  `;
}

export async function render(view, path) {
  const data = await loadData();
  const id = path.split("/")[2];
  const t = id && (data.trends ?? []).find((x) => x.id === id);
  if (t) return detailView(view, data, t);
  listView(view, data);
}
