import { getRawDb } from "../../../db";
import {
  COUNTRY_IDS,
  NOTE_ID,
  getOwnerHash,
  isSameOrigin,
  validateNote,
} from "../../../lib/community";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;
const COOLDOWN_MS = 30_000;
type NoteRow = {
  id: string;
  owner_hash: string;
  name: string;
  country: string;
  message: string;
  created_at: number;
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const unavailable = (error: unknown) => {
  console.error("Community storage request failed", error);
  return json(
    { error: "The notebook is temporarily unavailable. Please try again." },
    503,
  );
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") || "all";
    if (country !== "all" && !COUNTRY_IDS.has(country))
      return json({ error: "Unknown place." }, 400);
    let before = Number.MAX_SAFE_INTEGER;
    let beforeId = "~";
    const cursor = url.searchParams.get("cursor");
    if (cursor) {
      const [time, id] = cursor.split(":");
      if (!/^\d+$/.test(time) || !NOTE_ID.test(id || ""))
        return json({ error: "Invalid page." }, 400);
      before = Number(time);
      beforeId = id;
    }
    const owner = await getOwnerHash(request);
    const { results } = await getRawDb()
      .prepare(
        `
      SELECT id, owner_hash, name, country, message, created_at FROM field_notes
      WHERE deleted_at IS NULL AND (? = 'all' OR country = ?)
        AND (created_at < ? OR (created_at = ? AND id < ?))
      ORDER BY created_at DESC, id DESC LIMIT ?
    `,
      )
      .bind(country, country, before, before, beforeId, PAGE_SIZE + 1)
      .all<NoteRow>();
    const rows = results.slice(0, PAGE_SIZE);
    const last = rows.at(-1);
    return json({
      notes: rows.map((row) => ({
        id: row.id,
        name: row.name,
        country: row.country,
        message: row.message,
        createdAt: row.created_at,
        canDelete: row.owner_hash === owner,
      })),
      nextCursor:
        results.length > PAGE_SIZE && last
          ? `${last.created_at}:${last.id}`
          : null,
    });
  } catch (error) {
    return unavailable(error);
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return json({ error: "Please publish from the notebook page." }, 403);
  const owner = await getOwnerHash(request);
  if (!owner)
    return json(
      { error: "Allow browser storage before publishing a note." },
      401,
    );
  let note;
  try {
    const body = await request.text();
    if (body.length > 8000)
      return json({ error: "This note is too long." }, 413);
    note = validateNote(JSON.parse(body));
  } catch (error) {
    return json(
      {
        error:
          error instanceof SyntaxError
            ? "Invalid note."
            : (error as Error).message,
      },
      400,
    );
  }
  try {
    const db = getRawDb();
    const existing = await db
      .prepare("SELECT owner_hash FROM field_notes WHERE id = ?")
      .bind(note.id)
      .first<{ owner_hash: string }>();
    if (existing)
      return existing.owner_hash === owner
        ? json({ id: note.id })
        : json({ error: "Please refresh and try again." }, 409);
    const now = Date.now();
    // The cooldown check and insertion are one statement, so concurrent retries cannot bypass it.
    const result = await db
      .prepare(
        `
      INSERT INTO field_notes (id, owner_hash, name, country, message, created_at)
      SELECT ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (
        SELECT 1 FROM field_notes WHERE owner_hash = ? AND created_at > ?
      ) ON CONFLICT(id) DO NOTHING
    `,
      )
      .bind(
        note.id,
        owner,
        note.name,
        note.country,
        note.message,
        now,
        owner,
        now - COOLDOWN_MS,
      )
      .run();
    if (!result.meta.changes)
      return json(
        { error: "Please wait 30 seconds before publishing another note." },
        429,
      );
    return json({ id: note.id }, 201);
  } catch (error) {
    return unavailable(error);
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request))
    return json({ error: "Please remove notes from the notebook page." }, 403);
  const owner = await getOwnerHash(request);
  if (!owner)
    return json({ error: "This browser does not own the note." }, 401);
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!NOTE_ID.test(id)) return json({ error: "Invalid note." }, 400);
  try {
    const result = await getRawDb()
      .prepare(
        "UPDATE field_notes SET deleted_at = ? WHERE id = ? AND owner_hash = ? AND deleted_at IS NULL",
      )
      .bind(Date.now(), id, owner)
      .run();
    if (!result.meta.changes)
      return json(
        { error: "This note is unavailable or belongs to another visitor." },
        404,
      );
    return json({ removed: true });
  } catch (error) {
    return unavailable(error);
  }
}
