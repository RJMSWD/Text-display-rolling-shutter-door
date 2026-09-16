import { countries, roofAssets } from "../public-data";

export function DestinationsView() {
  return (
    <section
      id="destinationsPage"
      className="content-page destinations-page"
      data-page="destinations"
      hidden
      aria-labelledby="destinationsTitle"
    >
      <div className="section-heading">
        <p className="eyebrow" data-i18n="dest.eyebrow">
          The atlas / 01—04
        </p>
        <h1 id="destinationsTitle" tabIndex={-1}>
          <span data-i18n="dest.title1">Places to pause.</span>
          <br />
          <em>
            <span data-i18n="dest.title2">Words to move.</span>
          </em>
        </h1>
        <p className="section-description" data-i18n="dest.description">
          Four places, four languages. Explore their roofs, words, and the small
          details that make each one feel different.
        </p>
      </div>
      <div className="destination-grid">
        {countries.map((country, index) => (
          <article
            className="destination-card"
            key={country.id}
            data-destination={country.id}
          >
            <div className="destination-card__top">
              <span>0{index + 1}</span>
              <span>{country.eyebrow.split("·")[0].trim()}</span>
            </div>
            <a
              className="destination-art"
              href={`#home/${country.id}`}
              aria-label={`Explore ${country.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={roofAssets[country.kind as keyof typeof roofAssets]}
                alt={`${country.name} architectural roof study`}
                width="600"
                height="400"
                loading="lazy"
              />
            </a>
            <div className="destination-card__body">
              <p className="eyebrow" data-country-meaning>
                {country.eyebrow.split("·")[1]?.trim()}
              </p>
              <h2 data-country-name={country.id}>{country.name}</h2>
              <p data-country-description>{country.footnote}</p>
              <a
                className="text-link"
                href={`#home/${country.id}`}
                data-i18n="dest.enter"
              >
                Enter the curtain <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <aside className="editorial-callout">
        <p className="eyebrow" data-i18n="dest.closer">
          A little closer
        </p>
        <h2 data-i18n="dest.callout">Every journey leaves a note.</h2>
        <p data-i18n="dest.calloutText">
          A place you remember. A word you learned. A detail someone else might
          miss.
        </p>
        <a className="text-link" href="#community" data-i18n="dest.read">
          Read the field notes <span aria-hidden="true">↗</span>
        </a>
      </aside>
    </section>
  );
}
