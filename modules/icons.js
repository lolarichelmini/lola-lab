// Íconos de línea, compartidos por todos los módulos (estilo símbolos de iOS).
const svg = (body, sw = 1.9) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  home: svg('<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1z"/>'),
  waveform: svg('<path d="M3 12h1.5M6.5 8v8M9.5 4.5v15M12.5 7.5v9M15.5 10v4M18.5 6v12M21 12h.01"/>'),
  photos: svg('<rect x="7" y="7" width="14" height="12" rx="2.5"/><path d="M4 16V6.5A2.5 2.5 0 0 1 6.5 4H17"/><circle cx="11.5" cy="11" r="1.4"/><path d="m21 16-3.5-3.5L11 19"/>'),
  calendar: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  grid: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
  back: svg('<path d="M15 4.5 7.5 12 15 19.5"/>', 2.4),
};
