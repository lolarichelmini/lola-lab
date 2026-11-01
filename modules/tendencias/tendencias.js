// Módulo Tendencias — estructura y estado vacío.
// Se actualiza cada domingo a partir de los informes públicos de Pinterest.
// Cada tendencia se carga en content/tendencias/trends.json con este formato:
// { id, title, summary, body, palette: [{ name, hex }], images: [{ src, alt, credit }] }
// La vista de fichas se construye en su etapa de desarrollo.
import { icons } from "../icons.js";

export async function render(view) {
  let trends = [];
  try {
    const res = await fetch("content/tendencias/trends.json", { cache: "no-cache" });
    if (res.ok) trends = (await res.json()).trends ?? [];
  } catch { /* sin conexión: se muestra el estado vacío */ }

  view.innerHTML = `
    <div class="top-actions"><a class="circle-btn" href="#/" aria-label="Volver al inicio">${icons.back}</a></div>
    <h1 class="large-title">Tendencias</h1>
    <p class="subtitle">Lo que marca Pinterest en moda, con fotos, colores y cómo llevarlo. Cada domingo.</p>

    <div class="section-head">${icons.photos}<h2>Esta semana</h2></div>
    ${trends.length ? "" : `
      <div class="empty-note">
        <strong>Todavía no hay tendencias</strong>
        Cada domingo van a aparecer acá las nuevas, con sus fotos y una explicación.
      </div>`}
  `;
}
