import { countries, roofAssets } from "./countries.js";
import { createClothEngine } from "./cloth-engine.js";
import { t, localizedCountry, countryName } from "./i18n.js";

/** Home: focus/archive UI. The cloth engine owns rendering and sleep/wake behavior. */
export function createAtlas() {
  const ui = {
    canvas: document.querySelector("#clothCanvas"),
    cursor: document.querySelector("#clothCursor"),
    detail: document.querySelector("#detailView"),
    gallery: document.querySelector("#galleryView"),
    galleryTrack: document.querySelector("#galleryTrack"),
    configure: document.querySelector("#configureButton"),
    mainRoof: document.querySelector("#mainRoof"),
    mainVisual: document.querySelector("#mainVisual"),
    story: document.querySelector("#storyPanel"),
    eyebrow: document.querySelector("#storyEyebrow"),
    title: document.querySelector("#storyTitle"),
    footnote: document.querySelector("#storyFootnote"),
    previous: document.querySelector("#previousCountry"),
    previousArt: document.querySelector("#previousArt"),
    previousName: document.querySelector("#previousName"),
    next: document.querySelector("#nextCountry"),
    nextArt: document.querySelector("#nextArt"),
    nextName: document.querySelector("#nextName"),
    counter: document.querySelector("#sceneCounter"),
    note: document.querySelector("#interactionNote"),
  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const engine = createClothEngine({
    canvas: ui.canvas,
    cursor: ui.cursor,
    note: ui.note,
    reducedMotion,
  });
  let enabled = true;
  let currentIndex = 1;
  let galleryOpen = false;
  let transitioning = false;
  let pendingDirection = 0;
  let pendingGallery = null;
  let galleryTransitionTarget = null;
  let resizeTimer;
  let transitionGeneration = 0;

  function cancelTransitions() {
    transitionGeneration++;
    pendingDirection = 0;
    pendingGallery = null;
    galleryTransitionTarget = null;
    transitioning = false;
    for (const element of [
      ui.story,
      ui.mainVisual,
      ui.footnote,
      ui.canvas,
      ui.gallery,
      ui.detail,
    ]) {
      element.getAnimations().forEach((animation) => animation.cancel());
      element.style.opacity = "1";
      element.style.transform = "";
    }
  }
  function roofImage(kind) {
    return `<img class="roof-image roof-image--${kind}" src="${roofAssets[kind]}" alt="" draggable="false" />`;
  }

  function transitionTo(element, keyframes, finalStyles, duration, easing) {
    return new Promise((resolve) => {
      const applyFinalStyles = () => {
        Object.entries(finalStyles).forEach(([property, value]) => {
          element.style[property] = value;
        });
      };

      if (reducedMotion || duration <= 1) {
        applyFinalStyles();
        resolve();
        return;
      }

      let settled = false;
      let animation;
      let watchdog;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        applyFinalStyles();
        try {
          animation?.cancel();
        } catch {
          // The final inline styles already preserve the intended state.
        }
        resolve();
      };

      try {
        animation = element.animate(keyframes, { duration, easing });
        animation.onfinish = finish;
        animation.oncancel = finish;
        watchdog = setTimeout(finish, duration + 160);
      } catch {
        finish();
      }
    });
  }

  function fadeGroup(elements, opacity, duration, easing) {
    return Promise.all(
      elements.map((element) => {
        const fromOpacity =
          Number.parseFloat(getComputedStyle(element).opacity) || 0;
        return transitionTo(
          element,
          [{ opacity: fromOpacity }, { opacity }],
          { opacity: String(opacity) },
          duration,
          easing,
        );
      }),
    );
  }

  function scaleFadeGroup(
    elements,
    fromScale,
    toScale,
    opacity,
    duration,
    easing,
  ) {
    return Promise.all(
      elements.map((element) => {
        const fromOpacity =
          Number.parseFloat(getComputedStyle(element).opacity) || 0;
        return transitionTo(
          element,
          [
            { opacity: fromOpacity, transform: `scale(${fromScale})` },
            { opacity, transform: `scale(${toScale})` },
          ],
          { opacity: String(opacity), transform: "" },
          duration,
          easing,
        );
      }),
    );
  }

  function setDetailContent() {
    const country = localizedCountry(countries[currentIndex]);
    const previousIndex =
      (currentIndex - 1 + countries.length) % countries.length;
    const nextIndex = (currentIndex + 1) % countries.length;
    const previous = countries[previousIndex];
    const next = countries[nextIndex];

    ui.eyebrow.textContent = country.eyebrow;
    ui.title.innerHTML = country.title
      .map((line) => `<span class="title-line">${line}</span>`)
      .join("");
    ui.footnote.textContent = country.footnote;
    ui.mainRoof.innerHTML = roofImage(country.kind);
    ui.previousName.textContent = countryName(previous.id);
    ui.previousArt.innerHTML = roofImage(previous.kind);
    ui.nextName.textContent = countryName(next.id);
    ui.nextArt.innerHTML = roofImage(next.kind);
    ui.counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(countries.length).padStart(2, "0")}`;
    document.documentElement.style.setProperty("--scene-ink", country.ink);
    ui.detail.setAttribute(
      "aria-label",
      t("atlas.destination", { name: country.name }),
    );
  }

  function buildGallery() {
    ui.galleryTrack.innerHTML = countries
      .map(
        (
          country,
          index,
        ) => `<button class="gallery-tower" type="button" data-index="${index}" aria-label="${t("atlas.open", { name: countryName(country.id) })}">
        <span class="gallery-roof">${roofImage(country.kind)}</span>
        <span class="gallery-cloth-space" aria-hidden="true"></span>
        <span class="gallery-tower__label"><strong>${countryName(country.id)}</strong><span>${country.eyebrow.split("·")[0].trim()}</span></span>
      </button>`,
      )
      .join("");

    ui.galleryTrack.querySelectorAll(".gallery-tower").forEach((tower) => {
      tower.addEventListener("click", (event) => {
        if (event.target.closest?.(".gallery-cloth-space")) return;
        currentIndex = Number(tower.dataset.index);
        toggleGallery(false);
      });
    });
  }

  function buildCloths() {
    if (!enabled) return;
    const layouts = [];

    if (galleryOpen) {
      const towers = [...ui.galleryTrack.querySelectorAll(".gallery-tower")];
      towers.forEach((tower, index) => {
        const space = tower
          .querySelector(".gallery-cloth-space")
          .getBoundingClientRect();
        const width = Math.max(1, space.width * 0.72);
        const fontSize = Math.max(11, Math.min(14, width / 10));
        const height = Math.max(1, space.height - fontSize * 2);
        layouts.push({
          x: space.left + space.width / 2 - width / 2,
          y: space.top + fontSize,
          width,
          height,
          cols: Math.max(4, Math.min(10, Math.floor(width / (fontSize * 1.5)))),
          rows: Math.max(
            2,
            Math.min(18, Math.floor(height / (fontSize * 1.5)) + 1),
          ),
          glyphs: countries[index].glyphs,
          ink: countries[index].ink,
          fontSize,
          fontFamily: countries[index].fontFamily,
          strength: 0.66,
          constraintPasses: 2,
        });
      });
      engine.rebuild(layouts, { gallery: true });
      return;
    }

    const roof = ui.mainRoof.getBoundingClientRect();
    const rowGap = Math.max(16, Math.min(21, window.innerWidth * 0.0103));
    const columnGap = Math.max(16, Math.min(23, window.innerWidth * 0.0112));
    const fontSize = Math.max(10, Math.min(16, window.innerWidth * 0.0078));
    const width = Math.min(440, Math.max(270, window.innerWidth * 0.235));
    const availableHeight = Math.max(
      160,
      window.innerHeight - roof.bottom - (window.innerWidth <= 700 ? 150 : 60),
    );
    const rows = Math.max(
      8,
      Math.floor(Math.min(570, availableHeight) / rowGap),
    );
    const height = (rows - 1) * rowGap;
    const cols = Math.max(15, Math.round(width / columnGap));
    const country = countries[currentIndex];
    layouts.push({
      x: roof.left + roof.width / 2 - width / 2,
      y: roof.bottom + (window.innerWidth <= 700 ? 8 : -3),
      width,
      height,
      cols,
      rows,
      glyphs: country.glyphs,
      ink: country.ink,
      fontSize,
      fontFamily: country.fontFamily,
      strength: 1,
      constraintPasses: 3,
    });
    engine.rebuild(layouts);
  }

  function flushPendingAction() {
    if (transitioning) return;
    if (pendingGallery !== null) {
      const galleryTarget = pendingGallery;
      pendingGallery = null;
      toggleGallery(galleryTarget);
      return;
    }
    if (pendingDirection !== 0) {
      const direction = pendingDirection;
      pendingDirection = 0;
      if (!galleryOpen) changeScene(direction);
    }
  }

  async function changeScene(direction) {
    if (galleryOpen) return;
    if (transitioning) {
      pendingDirection = direction;
      return;
    }
    transitioning = true;
    const generation = ++transitionGeneration;
    engine.deactivate();
    const elements = [ui.story, ui.mainVisual, ui.footnote, ui.canvas];
    try {
      await fadeGroup(elements, 0, 240, "ease-in");
      if (!enabled || generation !== transitionGeneration) return;

      currentIndex =
        (currentIndex + direction + countries.length) % countries.length;
      setDetailContent();
      buildCloths();

      await fadeGroup(elements, 1, 480, "cubic-bezier(.16,1,.3,1)");
    } finally {
      if (generation !== transitionGeneration) return;
      elements.forEach((element) => {
        element.style.opacity = "1";
      });
      transitioning = false;
      flushPendingAction();
    }
  }

  async function toggleGallery(force) {
    if (transitioning) {
      const intendedState =
        pendingGallery ?? galleryTransitionTarget ?? galleryOpen;
      pendingGallery = typeof force === "boolean" ? force : !intendedState;
      return;
    }
    const shouldOpen = typeof force === "boolean" ? force : !galleryOpen;
    if (shouldOpen === galleryOpen) return;

    transitioning = true;
    const generation = ++transitionGeneration;
    galleryTransitionTarget = shouldOpen;
    engine.deactivate();
    const outgoing = galleryOpen ? ui.gallery : ui.detail;
    try {
      await scaleFadeGroup(
        [outgoing, ui.canvas],
        1,
        0.965,
        0,
        280,
        "cubic-bezier(.55,.06,.68,.19)",
      );
      if (!enabled || generation !== transitionGeneration) return;

      galleryOpen = shouldOpen;
      document.body.classList.toggle("gallery-open", galleryOpen);
      ui.configure.setAttribute("aria-pressed", String(galleryOpen));
      ui.configure.textContent = t(galleryOpen ? "atlas.focus" : "atlas.all");
      ui.detail.style.display = galleryOpen ? "none" : "block";
      ui.gallery.classList.toggle("is-active", galleryOpen);
      ui.gallery.setAttribute("aria-hidden", String(!galleryOpen));
      setDetailContent();
      buildCloths();

      const incoming = galleryOpen ? ui.gallery : ui.detail;
      incoming.style.opacity = "0";
      await scaleFadeGroup(
        [incoming, ui.canvas],
        0.96,
        1,
        1,
        520,
        "cubic-bezier(.16,1,.3,1)",
      );
    } finally {
      if (generation !== transitionGeneration) return;
      [ui.gallery, ui.detail, ui.canvas].forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "";
      });
      galleryTransitionTarget = null;
      transitioning = false;
      flushPendingAction();
    }
  }

  ui.previous.addEventListener("click", () => changeScene(-1));
  ui.next.addEventListener("click", () => changeScene(1));
  ui.configure.addEventListener("click", () => toggleGallery());
  window.addEventListener(
    "pointermove",
    (event) => {
      if (enabled && !transitioning) engine.move(event);
    },
    { passive: true },
  );
  window.addEventListener("pointerleave", engine.deactivate);
  window.addEventListener("blur", engine.deactivate);
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildCloths, 160);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) engine.suspend();
    else if (enabled) engine.resume();
  });
  window.addEventListener("keydown", (event) => {
    if (
      !enabled ||
      event.isComposing ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.target.closest?.("input, textarea, select, [contenteditable=true]")
    )
      return;
    if (event.key === "ArrowLeft") changeScene(-1);
    if (event.key === "ArrowRight") changeScene(1);
    if (event.key.toLowerCase() === "c" || event.key === "Escape")
      toggleGallery(event.key === "Escape" ? false : undefined);
  });
  document.fonts?.addEventListener("loadingdone", () => {
    engine.refreshFonts();
    buildCloths();
  });
  ui.configure.textContent = t("atlas.all");
  setDetailContent();
  buildGallery();
  requestAnimationFrame(buildCloths);

  return {
    translate() {
      cancelTransitions();
      setDetailContent();
      ui.configure.textContent = t(galleryOpen ? "atlas.focus" : "atlas.all");
      ui.galleryTrack.querySelectorAll(".gallery-tower").forEach((tower) => {
        const country = countries[Number(tower.dataset.index)];
        tower.setAttribute(
          "aria-label",
          t("atlas.open", { name: countryName(country.id) }),
        );
        tower.querySelector("strong").textContent = countryName(country.id);
      });
      requestAnimationFrame(buildCloths);
    },
    show(countryId) {
      enabled = true;
      engine.resume();
      if (countryId) {
        cancelTransitions();
        const index = countries.findIndex((c) => c.id === countryId);
        if (index >= 0) currentIndex = index;
        if (galleryOpen) {
          toggleGallery(false);
          return;
        }
        setDetailContent();
      }
      setDetailContent();
      requestAnimationFrame(buildCloths);
    },
    hide() {
      enabled = false;
      cancelTransitions();
      engine.suspend();
    },
  };
}
