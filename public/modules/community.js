import {
  countryName,
  getLocale,
  t,
  setTranslatedText,
  errorKey,
} from "./i18n.js";

const TOKEN_KEY = "budarina-note-owner";
function ownerToken(create = false) {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token && create) {
      token = crypto.randomUUID().replaceAll("-", "");
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token || "";
  } catch {
    if (create)
      throw new Error(
        "Allow browser storage so you can manage your notes later.",
      );
    return "";
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Note-Owner": ownerToken(),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error || "The notebook is unavailable. Please try again.",
    );
  return data;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createCommunity() {
  const form = document.querySelector("#communityForm");
  const list = document.querySelector("#notesList");
  const status = document.querySelector("#boardStatus");
  const formStatus = document.querySelector("#formStatus");
  const message = document.querySelector("#noteMessage");
  const counter = document.querySelector("#noteCount");
  const more = document.querySelector("#loadMoreNotes");
  const filters = [...document.querySelectorAll("[data-filter]")];
  let country = "all";
  let cursor = "";
  let loadId = 0;
  let sending = false;
  let submissionId = "";
  let loadedNotes = [];
  const removingIds = new Set();

  function card(note) {
    const article = element("article", "note-card");
    const meta = element("div", "note-card__meta");
    meta.append(element("span", "note-card__place", countryName(note.country)));
    const date = element(
      "time",
      "",
      new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium" }).format(
        note.createdAt,
      ),
    );
    date.dateTime = new Date(note.createdAt).toISOString();
    meta.append(date);
    const footer = element("div", "note-card__footer");
    footer.append(element("span", "note-card__name", `— ${note.name}`));
    if (note.canDelete) {
      const remove = element("button", "quiet-button", t("board.remove"));
      remove.type = "button";
      remove.disabled = removingIds.has(note.id);
      remove.addEventListener("click", async () => {
        removingIds.add(note.id);
        remove.disabled = true;
        try {
          await request(`/api/community?id=${encodeURIComponent(note.id)}`, {
            method: "DELETE",
          });
          loadedNotes = loadedNotes.filter((item) => item.id !== note.id);
          list.replaceChildren(...loadedNotes.map(card));
          if (!list.children.length) await load();
          setTranslatedText(formStatus, "status.removed");
        } catch (error) {
          setTranslatedText(formStatus, errorKey(error));
          formStatus.dataset.error = "true";
          remove.disabled = false;
        } finally {
          removingIds.delete(note.id);
          list.replaceChildren(...loadedNotes.map(card));
        }
      });
      footer.append(remove);
    }
    // Visitor content is text, never HTML.
    article.append(
      meta,
      element("p", "note-card__message", note.message),
      footer,
    );
    return article;
  }

  async function load(append = false) {
    const id = ++loadId;
    setTranslatedText(status, "status.loading");
    more.disabled = true;
    if (!append) {
      list.replaceChildren();
      loadedNotes = [];
      cursor = "";
      more.hidden = true;
    }
    const params = new URLSearchParams({ country });
    if (append && cursor) params.set("cursor", cursor);
    try {
      const data = await request(`/api/community?${params}`);
      if (id !== loadId) return;
      loadedNotes.push(...data.notes);
      list.append(...data.notes.map(card));
      cursor = data.nextCursor || "";
      more.hidden = !cursor;
      setTranslatedText(status, list.children.length ? "" : "status.empty");
    } catch {
      if (id === loadId) setTranslatedText(status, "error.load");
    } finally {
      if (id === loadId) more.disabled = false;
    }
  }

  filters.forEach((button) =>
    button.addEventListener("click", () => {
      country = button.dataset.filter;
      filters.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      load();
    }),
  );
  document
    .querySelector("#refreshNotes")
    .addEventListener("click", () => load());
  more.addEventListener("click", () => load(true));
  message.addEventListener("input", () => {
    counter.textContent = `${message.value.length} / 500`;
  });
  form.addEventListener("input", (event) => {
    event.target.setCustomValidity?.("");
    if (!sending) submissionId = "";
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    const nameField = document.querySelector("#noteName");
    nameField.setCustomValidity(nameField.value.trim() ? "" : t("error.name"));
    message.setCustomValidity(
      message.value.trim().length >= 3 ? "" : t("error.message"),
    );
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    sending = true;
    for (const field of form.elements) field.disabled = true;
    formStatus.dataset.error = "false";
    setTranslatedText(formStatus, "status.sending");
    try {
      const token = ownerToken(true);
      submissionId ||= crypto.randomUUID();
      await request("/api/community", {
        method: "POST",
        headers: { "X-Note-Owner": token },
        body: JSON.stringify({
          id: submissionId,
          name: fields.get("name"),
          country: fields.get("country"),
          message: fields.get("message"),
        }),
      });
      // Keep the author's name and selected country for their next note.
      message.value = "";
      counter.textContent = "0 / 500";
      submissionId = "";
      setTranslatedText(formStatus, "status.published");
      country = "all";
      filters.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === "all"),
        ),
      );
      await load();
    } catch (error) {
      formStatus.dataset.error = "true";
      setTranslatedText(formStatus, errorKey(error));
    } finally {
      sending = false;
      for (const field of form.elements) field.disabled = false;
    }
  });
  return {
    load,
    translate() {
      list.replaceChildren(...loadedNotes.map(card));
      // Values, filters, pagination and the pending submission stay untouched.
      for (const field of form.elements) field.setCustomValidity?.("");
    },
  };
}
