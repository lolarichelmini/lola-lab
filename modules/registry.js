// Registro de módulos de la plataforma.
// Para sumar un módulo nuevo: crear su carpeta en /modules y agregar una entrada acá.
// El shell arma la barra inferior, las rutas y los mosaicos del inicio a partir de esta lista.
//
// tile.title → título del mosaico
// tile.meta  → línea secundaria (cuándo se actualiza)
// tile.color → degradé definido en styles/tokens.css
// icon       → ícono de styles compartidos (modules/icons.js)

import { icons } from "./icons.js";

export const modules = [
  {
    id: "podcast",
    name: "Podcast",
    route: "/podcast",
    icon: icons.waveform,
    tile: { title: "Lunes Creativo", meta: "Cada lunes, 9:00", color: "var(--grad-blue)" },
    load: () => import("./podcast/podcast.js"),
  },
  {
    id: "tendencias",
    name: "Tendencias",
    route: "/tendencias",
    icon: icons.photos,
    tile: { title: "Tendencias", meta: "Cada domingo", color: "var(--grad-pink)" },
    load: () => import("./tendencias/tendencias.js"),
  },
];
