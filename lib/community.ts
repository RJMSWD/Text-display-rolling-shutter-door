/** Shared server validation. No visitor-controlled values are interpolated into SQL. */
export const COUNTRY_IDS = new Set(["vietnam", "china", "japan", "kazakhstan"]);
export const NOTE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateNote(payload: unknown) {
  if (!payload || typeof payload !== "object")
    throw new Error("Please fill in the note.");
  const input = payload as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const country = typeof input.country === "string" ? input.country : "";
  const id = typeof input.id === "string" ? input.id : "";
  if (!name || name.length > 40)
    throw new Error("Use a name between 1 and 40 characters.");
  if (message.length < 3 || message.length > 500)
    throw new Error("Write a note between 3 and 500 characters.");
  if (!COUNTRY_IDS.has(country))
    throw new Error("Choose one of the four places.");
  if (!NOTE_ID.test(id))
    throw new Error("Please refresh the page before publishing.");
  return { id, name, message, country };
}

export async function getOwnerHash(request: Request) {
  const token = request.headers.get("X-Note-Owner") || "";
  if (!/^[a-f0-9]{32}$/i.test(token)) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}
