import { countries } from "./countries.js";
import { languages, messages, countryTranslations } from "./locales.js";

const STORAGE_KEY = "budarina-language";
let language = "en";
export function getLanguage() {
  return language;
}
export function getLocale() {
  return { en: "en", zh: "zh-CN", ja: "ja-JP" }[language];
}
export function t(key, values = {}) {
  const value =
    messages[key]?.[languages.indexOf(language)] || messages[key]?.[0] || key;
  return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}
export function localizedCountry(country) {
  return { ...country, ...countryTranslations[language]?.[country.id] };
}
export function countryName(id) {
  const country = countries.find((c) => c.id === id);
  return country ? localizedCountry(country).name : id;
}
export function setTranslatedText(element, key) {
  element.dataset.i18n = key;
  element.textContent = key ? t(key) : "";
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = node.dataset.i18n ? t(node.dataset.i18n) : "";
  });
  for (const attribute of ["placeholder", "aria-label", "alt"]) {
    root.querySelectorAll(`[data-i18n-${attribute}]`).forEach((node) => {
      node.setAttribute(
        attribute,
        t(node.getAttribute(`data-i18n-${attribute}`)),
      );
    });
  }
  root.querySelectorAll("[data-country-name]").forEach((node) => {
    node.textContent = countryName(node.dataset.countryName);
  });
  root.querySelectorAll("[data-destination]").forEach((card) => {
    const country = localizedCountry(
      countries.find((c) => c.id === card.dataset.destination),
    );
    card.querySelector("[data-country-meaning]").textContent = country.eyebrow
      .split("·")[1]
      .trim();
    card.querySelector("[data-country-description]").textContent =
      country.footnote;
    card
      .querySelector(".destination-art")
      .setAttribute("aria-label", t("atlas.open", { name: country.name }));
    card.querySelector("img").alt = t("atlas.roof", { name: country.name });
  });
}

export function setLanguage(next, persist = true) {
  language = languages.includes(next) ? next : "en";
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* Session-only switching still works. */
    }
  }
  document.documentElement.lang = getLocale();
  document.querySelector("#languageSelect").value = language;
  applyTranslations();
  document.dispatchEvent(new CustomEvent("languagechange"));
}
export function initLanguage() {
  let saved = "en";
  try {
    saved = localStorage.getItem(STORAGE_KEY) || "en";
  } catch {
    /* English is the default. */
  }
  setLanguage(saved, false);
  document
    .querySelector("#languageSelect")
    .addEventListener("change", (event) => setLanguage(event.target.value));
}

const serverErrors = {
  "Allow browser storage so you can manage your notes later.": "error.storage",
  "Allow browser storage before publishing a note.": "error.storage",
  "Use a name between 1 and 40 characters.": "error.name",
  "Write a note between 3 and 500 characters.": "error.message",
  "This note is too long.": "error.message",
  "Please fill in the note.": "error.message",
  "Choose one of the four places.": "error.country",
  "Unknown place.": "error.country",
  "Invalid page.": "error.refresh",
  "Invalid note.": "error.refresh",
  "Please refresh the page before publishing.": "error.refresh",
  "Please refresh and try again.": "error.refresh",
  "Please publish from the notebook page.": "error.refresh",
  "Please remove notes from the notebook page.": "error.refresh",
  "This browser does not own the note.": "error.owner",
  "This note is unavailable or belongs to another visitor.": "error.owner",
  "Please wait 30 seconds before publishing another note.": "error.cooldown",
};
export function errorKey(error) {
  return serverErrors[error.message] || "error.unavailable";
}
