// Módulo Podcast "Lunes Creativo".
// Lee content/podcast/episodes.json. Cada episodio tiene su guion (texto) y,
// cuando GitHub termina de generarlo, su audio (mp3) y duración.
// Rutas: #/podcast (lista) y #/podcast/ep-001 (episodio).
import { icons } from "../icons.js";

const DONE_KEY = "lolalab.podcast.escuchados";
const POS_KEY = "lolalab.podcast.posicion";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

const fmtTime = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
const fmtDate = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long" });
const fmtDuration = (s) => (s ? `${Math.round(s / 60)} min` : "Audio en preparación");

const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

async function loadEpisodes() {
  try {
    const res = await fetch("content/podcast/episodes.json", { cache: "no-cache" });
    if (res.ok) return ((await res.json()).episodes ?? []).sort((a, b) => b.date.localeCompare(a.date));
  } catch { /* sin conexión */ }
  return [];
}

function listView(view, episodes) {
  const done = read(DONE_KEY, []);
  view.innerHTML = `
    <div class="top-actions"><a class="circle-btn" href="#/" aria-label="Volver al inicio">${icons.back}</a></div>
    <h1 class="large-title">Lunes Creativo</h1>
    <p class="subtitle">Novedades creativas, una técnica para destrabar ideas y un ejercicio para tu semana. Cada lunes, 9:00.</p>

    <div class="section-head">${icons.waveform}<h2>Episodios</h2></div>
    ${episodes.length ? `
      <ul class="group">
        ${episodes.map((ep) => `
          <li>
            <a class="group-item ep-row" href="#/podcast/${ep.id}">
              <span class="ep-num" aria-hidden="true">${ep.number}</span>
              <span class="group-label">
                ${esc(ep.title)}
                <span class="group-sub">${fmtDate(ep.date)} · ${fmtDuration(ep.duration)}${done.includes(ep.id) ? " · Escuchado" : ""}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </a>
          </li>`).join("")}
      </ul>` : `
      <div class="empty-note">
        <strong>Todavía no hay episodios</strong>
        El primero va a aparecer acá apenas esté listo. Lo vas a poder escuchar o leer.
      </div>`}
  `;
}

async function episodeView(view, ep) {
  let text = "";
  try {
    const res = await fetch(ep.script, { cache: "no-cache" });
    if (res.ok) text = await res.text();
  } catch { /* sin conexión */ }
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  view.innerHTML = `
    <div class="top-actions"><a class="circle-btn" href="#/podcast" aria-label="Volver a episodios">${icons.back}</a></div>
    <p class="ep-kicker">Episodio ${ep.number} · ${fmtDate(ep.date)}</p>
    <h1 class="large-title">${esc(ep.title)}</h1>
    <p class="subtitle">${esc(ep.summary)}</p>

    <section class="player" aria-label="Reproductor">
      ${ep.audio ? `
        <audio id="audio" preload="metadata" src="${esc(ep.audio)}"></audio>
        <div class="player-row">
          <button class="play-btn" id="play" aria-label="Reproducir">${playIcon}</button>
          <div class="player-track">
            <input type="range" id="seek" min="0" max="100" step="0.1" value="0" aria-label="Posición">
            <div class="player-times"><span id="cur">0:00</span><span id="dur">${ep.duration ? fmtTime(ep.duration) : "0:00"}</span></div>
          </div>
        </div>
        <div class="player-controls">
          <button class="pill-btn" id="back15" aria-label="Retroceder 15 segundos">−15 s</button>
          <button class="pill-btn" id="speed" aria-label="Velocidad">1×</button>
          <button class="pill-btn" id="fwd30" aria-label="Adelantar 30 segundos">+30 s</button>
        </div>` : `
        <p class="player-pending">El audio se está generando. Mientras tanto, podés leer el episodio acá abajo.</p>`}
    </section>

    <div class="section-head">${icons.waveform}<h2>Leer el episodio</h2></div>
    <article class="transcript">
      ${paragraphs.length ? paragraphs.map((p) => `<p>${esc(p)}</p>`).join("") : "<p>El texto no está disponible sin conexión.</p>"}
    </article>

    ${ep.sources?.length ? `
      <div class="section-head"><h2>Fuentes</h2></div>
      <ul class="group">
        ${ep.sources.map((s) => `
          <li><a class="group-item" href="${esc(s.url)}" target="_blank" rel="noopener">
            <span class="group-label">${esc(s.title)}</span><span class="chevron" aria-hidden="true">↗</span>
          </a></li>`).join("")}
      </ul>` : ""}
  `;

  if (ep.audio) wirePlayer(view, ep);
}

function wirePlayer(view, ep) {
  const audio = view.querySelector("#audio");
  const play = view.querySelector("#play");
  const seek = view.querySelector("#seek");
  const cur = view.querySelector("#cur");
  const dur = view.querySelector("#dur");
  const speedBtn = view.querySelector("#speed");
  const speeds = [1, 1.25, 1.5, 0.75];
  let s = 0;

  const positions = read(POS_KEY, {});
  audio.addEventListener("loadedmetadata", () => {
    dur.textContent = fmtTime(audio.duration);
    if (positions[ep.id] && positions[ep.id] < audio.duration - 5) audio.currentTime = positions[ep.id];
  });

  const setIcon = () => {
    play.innerHTML = audio.paused ? playIcon : pauseIcon;
    play.setAttribute("aria-label", audio.paused ? "Reproducir" : "Pausar");
  };
  play.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));
  audio.addEventListener("play", setIcon);
  audio.addEventListener("pause", setIcon);

  let lastSave = 0;
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    seek.value = (audio.currentTime / audio.duration) * 100;
    cur.textContent = fmtTime(audio.currentTime);
    if (Date.now() - lastSave > 5000) {
      lastSave = Date.now();
      positions[ep.id] = audio.currentTime;
      write(POS_KEY, positions);
    }
    if (audio.currentTime / audio.duration > 0.9) {
      const done = read(DONE_KEY, []);
      if (!done.includes(ep.id)) write(DONE_KEY, [...done, ep.id]);
    }
  });
  seek.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  });
  view.querySelector("#back15").addEventListener("click", () => (audio.currentTime = Math.max(0, audio.currentTime - 15)));
  view.querySelector("#fwd30").addEventListener("click", () => (audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30)));
  speedBtn.addEventListener("click", () => {
    s = (s + 1) % speeds.length;
    audio.playbackRate = speeds[s];
    speedBtn.textContent = `${speeds[s]}×`.replace(".", ",");
  });

  // Controles en la pantalla bloqueada del iPhone.
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: ep.title,
      artist: "Lunes Creativo",
      album: "Lola Lab",
      artwork: [{ src: "assets/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => (audio.currentTime -= 15));
    navigator.mediaSession.setActionHandler("seekforward", () => (audio.currentTime += 30));
  }
}

export async function render(view, path) {
  const episodes = await loadEpisodes();
  const id = path.split("/")[2];
  const ep = id && episodes.find((e) => e.id === id);
  if (ep) return episodeView(view, ep);
  listView(view, episodes);
}
