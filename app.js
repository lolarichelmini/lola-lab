import { modules } from "./modules/registry.js";
import { icons } from "./modules/icons.js";
import * as home from "./modules/home/home.js";
import { captureFromUrl } from "./modules/hoy/hoy.js";

const view = document.getElementById("view");
const tabbar = document.getElementById("tabbar");

// La barra inferior se genera desde el registro: sumar un módulo suma su pestaña.
const tabs = [{ route: "/", name: "Inicio", icon: icons.home }, ...modules];
tabbar.innerHTML = tabs
  .map((t) => `<a class="tab" href="#${t.route}" data-route="${t.route}">${t.icon}<span>${t.name}</span></a>`)
  .join("");

async function route() {
  // Si la app ya estaba abierta, el Atajo solo cambia la dirección: leemos los datos igual.
  captureFromUrl();
  const path = location.hash.replace(/^#/, "").split("?")[0] || "/";
  const mod = modules.find((m) => path === m.route || path.startsWith(m.route + "/"));

  tabbar.querySelectorAll(".tab").forEach((a) => {
    const active = a.dataset.route === (mod ? mod.route : "/");
    active ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });

  if (mod) {
    const page = await mod.load();
    await page.render(view, path);
  } else {
    home.render(view);
  }
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
}

window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
