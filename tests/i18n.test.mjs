import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  languages,
  messages,
  countryTranslations,
} from "../public/modules/locales.js";
import { countries } from "../public/modules/countries.js";
import {
  t,
  setLanguage,
  initLanguage,
  localizedCountry,
  getLanguage,
  getLocale,
  errorKey,
} from "../public/modules/i18n.js";

test("every UI key and country has all three translations", async () => {
  for (const [key, translations] of Object.entries(messages)) {
    assert.equal(translations.length, languages.length, key);
    for (const text of translations)
      assert.ok(typeof text === "string" && text.trim(), key);
  }
  for (const locale of ["zh", "ja"])
    for (const country of countries) {
      const copy = countryTranslations[locale][country.id];
      for (const key of ["name", "eyebrow", "footnote"]) assert.ok(copy[key]);
      assert.ok(copy.title.length > 1);
    }
  for (const file of [
    "page.tsx",
    "components/AtlasView.tsx",
    "components/DestinationsView.tsx",
    "components/CommunityView.tsx",
  ]) {
    const source = await readFile(
      new URL(`../app/${file}`, import.meta.url),
      "utf8",
    );
    for (const match of source.matchAll(/data-i18n(?:-[a-z-]+)?="([\w.]+)"/g))
      assert.ok(messages[match[1]], `missing ${match[1]}`);
  }
});

test("language changes update labels, preserve original glyphs, and survive reload", () => {
  const storage = new Map();
  const select = { value: "en", addEventListener() {} };
  const label = {
    dataset: { i18n: "nav.community" },
    textContent: "Community",
  };
  globalThis.localStorage = {
    getItem: (key) => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
  };
  globalThis.document = {
    documentElement: { lang: "en" },
    dispatchEvent() {},
    querySelector: () => select,
    querySelectorAll: (selector) => (selector === "[data-i18n]" ? [label] : []),
  };
  for (const language of languages) {
    setLanguage(language);
    assert.equal(getLanguage(), language);
    assert.equal(select.value, language);
    assert.equal(label.textContent, t("nav.community"));
    for (const country of countries)
      assert.equal(localizedCountry(country).glyphs, country.glyphs);
  }
  setLanguage("zh");
  assert.equal(getLocale(), "zh-CN");
  assert.equal(t("atlas.open", { name: "日本" }), "探索日本");
  setLanguage("en", false);
  initLanguage();
  assert.equal(getLanguage(), "zh", "saved choice is restored");
  setLanguage("unsupported");
  assert.equal(getLanguage(), "en");
  globalThis.localStorage.setItem = () => {
    throw new Error("Storage blocked");
  };
  assert.doesNotThrow(() => setLanguage("ja"));
  assert.equal(getLanguage(), "ja");
  assert.equal(
    errorKey(
      new Error("Please wait 30 seconds before publishing another note."),
    ),
    "error.cooldown",
  );
  delete globalThis.document;
  delete globalThis.localStorage;
});
