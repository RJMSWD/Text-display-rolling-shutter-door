import { countries } from "../public-data";

export function CommunityView() {
  return (
    <section
      id="communityPage"
      className="content-page community-page"
      data-page="community"
      hidden
      aria-labelledby="communityTitle"
    >
      <div className="section-heading">
        <p className="eyebrow" data-i18n="community.eyebrow">
          The shared notebook
        </p>
        <h1 id="communityTitle" tabIndex={-1}>
          <span data-i18n="community.title1">Some places stay.</span>
          <br />
          <em>
            <span data-i18n="community.title2">Tell us why.</span>
          </em>
        </h1>
        <p className="section-description" data-i18n="community.description">
          Leave a memory, a small discovery, or a question for the next
          traveler. These field notes are shared with everyone.
        </p>
      </div>
      <div className="community-layout">
        <aside className="note-composer">
          <p className="eyebrow" data-i18n="form.eyebrow">
            Add a field note
          </p>
          <h2>
            <span data-i18n="form.title1">A few words</span>
            <br />
            <span data-i18n="form.title2">from your journey.</span>
          </h2>
          <form id="communityForm" noValidate>
            <label htmlFor="noteName" data-i18n="form.name">
              Your name
            </label>
            <input
              id="noteName"
              name="name"
              maxLength={40}
              autoComplete="nickname"
              placeholder="How should we call you?"
              data-i18n-placeholder="form.namePlaceholder"
              required
            />
            <label htmlFor="noteCountry" data-i18n="form.place">
              A place
            </label>
            <select id="noteCountry" name="country" defaultValue="china">
              {countries.map((c) => (
                <option key={c.id} value={c.id} data-country-name={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label htmlFor="noteMessage" data-i18n="form.message">
              Your field note
            </label>
            <textarea
              id="noteMessage"
              name="message"
              rows={5}
              minLength={3}
              maxLength={500}
              placeholder="What stayed with you?"
              data-i18n-placeholder="form.messagePlaceholder"
              required
            />
            <div className="field-caption">
              <span data-i18n="form.public">
                Shared publicly · No email needed
              </span>
              <span id="noteCount">0 / 500</span>
            </div>
            <button
              className="solid-button"
              id="publishNote"
              type="submit"
              data-i18n="form.publish"
            >
              Publish field note <span aria-hidden="true">↗</span>
            </button>
            <p
              id="formStatus"
              className="form-status"
              role="status"
              aria-live="polite"
            />
          </form>
          <p className="composer-footnote" data-i18n="form.ownership">
            You can remove your own notes from this browser. Keep your browser
            data to retain that access.
          </p>
        </aside>
        <div className="notes-board">
          <div className="notes-toolbar">
            <h2 data-i18n="board.title">From the road</h2>
            <button
              type="button"
              id="refreshNotes"
              className="quiet-button"
              data-i18n="board.refresh"
            >
              Refresh ↻
            </button>
          </div>
          <div
            className="country-filters"
            role="group"
            aria-label="Filter field notes by place"
            data-i18n-aria-label="board.filter"
          >
            <button
              type="button"
              data-filter="all"
              aria-pressed="true"
              data-i18n="board.all"
            >
              All places
            </button>
            {countries.map((c) => (
              <button
                type="button"
                key={c.id}
                data-filter={c.id}
                data-country-name={c.id}
                aria-pressed="false"
              >
                {c.name}
              </button>
            ))}
          </div>
          <p
            className="board-status"
            id="boardStatus"
            role="status"
            aria-live="polite"
            data-i18n="status.loading"
          >
            Loading field notes…
          </p>
          <div id="notesList" className="notes-list" />
          <button
            type="button"
            id="loadMoreNotes"
            className="outline-button"
            hidden
            data-i18n="board.more"
          >
            More field notes
          </button>
        </div>
      </div>
    </section>
  );
}
