import Script from "next/script";
import { AtlasView } from "./components/AtlasView";
import { DestinationsView } from "./components/DestinationsView";
import { CommunityView } from "./components/CommunityView";

export default function Home() {
  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      <a className="skip-link" href="#mainContent" data-i18n="nav.skip">
        Skip to content
      </a>
      <header className="masthead">
        <a
          className="wordmark"
          href="#home"
          aria-label="Budarina home"
          data-i18n-aria-label="nav.brand"
        >
          Budarina
        </a>
        <nav aria-label="Primary navigation" data-i18n-aria-label="nav.label">
          <a
            href="#home"
            data-nav="home"
            className="is-active"
            aria-current="page"
            data-i18n="nav.home"
          >
            Home
          </a>
          <a
            href="#destinations"
            data-nav="destinations"
            data-i18n="nav.destinations"
          >
            Destinations
          </a>
          <a href="#community" data-nav="community" data-i18n="nav.community">
            Community
          </a>
        </nav>
        <div className="header-actions">
          <label className="language-picker">
            <span className="sr-only" data-i18n="nav.language">
              Language
            </span>
            <select id="languageSelect" defaultValue="en">
              <option value="en" lang="en">
                English
              </option>
              <option value="zh" lang="zh-CN">
                中文
              </option>
              <option value="ja" lang="ja">
                日本語
              </option>
            </select>
          </label>
          <button
            className="configure-button"
            id="configureButton"
            type="button"
            aria-pressed="false"
          >
            All four
          </button>
        </div>
      </header>
      <main id="mainContent" tabIndex={-1}>
        <AtlasView />
        <DestinationsView />
        <CommunityView />
      </main>
      <footer className="page-footer">
        <span id="sceneCounter">02 / 04</span>
        <a href="#destinations" data-i18n="footer.notes">
          Silk Road field notes
        </a>
        <span id="footerHint">
          Move through the text · Arrow keys to travel
        </span>
      </footer>
      <noscript>
        <p className="noscript-note">
          Enable JavaScript to explore the moving atlas and shared field notes.
        </p>
      </noscript>
      <Script src="/app.js" type="module" strategy="afterInteractive" />
    </>
  );
}
