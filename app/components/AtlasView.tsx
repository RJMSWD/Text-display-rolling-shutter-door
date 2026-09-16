export function AtlasView() {
  return (
    <section
      id="homePage"
      data-page="home"
      aria-label="Interactive atlas"
      data-i18n-aria-label="atlas.label"
    >
      <section className="detail-view" id="detailView" aria-live="polite">
        <button
          className="country-card country-card--previous"
          id="previousCountry"
          type="button"
        >
          <span
            className="country-card__art"
            id="previousArt"
            aria-hidden="true"
          />
          <span className="country-card__name" id="previousName" />
          <span className="country-card__direction" data-i18n="atlas.previous">
            Previous
          </span>
        </button>

        <article className="story-panel" id="storyPanel">
          <p className="story-panel__eyebrow" id="storyEyebrow" />
          <h1 id="storyTitle" />
        </article>

        <div className="main-visual" id="mainVisual" aria-hidden="true">
          <div className="main-roof" id="mainRoof" />
        </div>

        <p className="story-footnote" id="storyFootnote" />

        <button
          className="country-card country-card--next"
          id="nextCountry"
          type="button"
        >
          <span className="country-card__art" id="nextArt" aria-hidden="true" />
          <span className="country-card__name" id="nextName" />
          <span className="country-card__direction" data-i18n="atlas.next">
            Next
          </span>
        </button>
      </section>

      <section className="gallery-view" id="galleryView" aria-hidden="true">
        <div className="gallery-intro">
          <p data-i18n="atlas.eyebrow">Four structures / four languages</p>
          <h2>
            <span data-i18n="atlas.heading1">Move through</span>
            <br />
            <span data-i18n="atlas.heading2">the archive</span>
          </h2>
        </div>
        <div className="gallery-track" id="galleryTrack" />
      </section>

      <canvas id="clothCanvas" aria-hidden="true" />

      <div className="cloth-cursor" id="clothCursor" aria-hidden="true">
        <span />
      </div>

      <div className="interaction-note" id="interactionNote">
        <span className="interaction-note__mark">↝</span>
        <span data-i18n="atlas.hint">Move across the language</span>
      </div>
    </section>
  );
}
