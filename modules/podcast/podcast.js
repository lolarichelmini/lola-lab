// Módulo Podcast — estructura y estado vacío.
// En la Etapa 3 se suma el reproductor y la lista de episodios
// leída desde content/podcast/episodes.json.
import { icons } from "../icons.js";

export async function render(view) {
  let episodes = [];
  try {
    const res = await fetch("content/podcast/episodes.json", { cache: "no-cache" });
    if (res.ok) episodes = (await res.json()).episodes ?? [];
  } catch { /* sin conexión: se muestra el estado vacío */ }

  view.innerHTML = `
    <div class="top-actions"><a class="circle-btn" href="#/" aria-label="Volver al inicio">${icons.back}</a></div>
    <h1 class="large-title">Lunes Creativo</h1>
    <p class="subtitle">Novedades creativas, una técnica para destrabar ideas y un ejercicio para tu semana. Cada lunes, 9:00.</p>

    <div class="section-head">${icons.waveform}<h2>Episodios</h2></div>
    ${episodes.length ? "" : `
      <div class="empty-note">
        <strong>Todavía no hay episodios</strong>
        El primero va a aparecer acá apenas esté listo. Lo vas a poder escuchar o leer.
      </div>`}
  `;
}
