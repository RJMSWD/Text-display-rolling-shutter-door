import { createAtlas } from "./modules/atlas.js";
import { createCommunity } from "./modules/community.js";
import { initLanguage, t, setTranslatedText } from "./modules/i18n.js";

initLanguage();

// Hash navigation keeps the atlas state while the reading pages use normal scrolling.
const atlas = createAtlas();
const community = createCommunity();
const pages = [...document.querySelectorAll("[data-page]")];
const navigation = [...document.querySelectorAll("[data-nav]")];
const configure = document.querySelector("#configureButton");
let currentPage = "";

function navigate() {
  const [requested = "home", country] = location.hash.slice(1).split("/");
  if (requested === "mainContent") {
    document.querySelector("#mainContent").focus();
    return;
  }
  const page = ["home", "destinations", "community"].includes(requested)
    ? requested
    : "home";
  for (const element of pages) element.hidden = element.dataset.page !== page;
  for (const link of navigation) {
    const active = link.dataset.nav === page;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.body.classList.toggle("content-mode", page !== "home");
  configure.hidden = page !== "home";
  if (page === "home") atlas.show(country);
  else {
    atlas.hide();
    document.querySelector("#sceneCounter").textContent = t("footer.index");
  }
  if (page === "community") community.load();
  if (page !== currentPage) {
    window.scrollTo(0, 0);
    if (currentPage && page !== "home")
      document.querySelector(`#${page}Title`).focus({ preventScroll: true });
  }

  currentPage = page;
  updateChrome();
}
function updateChrome() {
  setTranslatedText(
    document.querySelector("#footerHint"),
    currentPage === "home" ? "footer.home" : "footer.content",
  );
  if (currentPage !== "home")
    document.querySelector("#sceneCounter").textContent = t("footer.index");
  document.title =
    currentPage === "home"
      ? t("title.home")
      : `${t(`nav.${currentPage}`)} — Budarina`;
}
document.addEventListener("languagechange", () => {
  atlas.translate();
  community.translate();
  updateChrome();
});
window.addEventListener("hashchange", navigate);
navigate();
