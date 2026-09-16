import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

// Run the built Worker against an isolated, disposable D1 database.
test("built views and shared notebook work with real Worker and D1 semantics", async () => {
  const runtime = new Miniflare({
    modules: true,
    scriptPath: fileURLToPath(
      new URL("../dist/server/index.js", import.meta.url),
    ),
    modulesRoot: fileURLToPath(new URL("../dist/server/", import.meta.url)),
    modulesRules: [{ type: "ESModule", include: ["**/*.js", "**/*.mjs"] }],
    compatibilityDate: "2026-05-15",
    compatibilityFlags: ["nodejs_compat"],
    d1Databases: ["DB"],
  });
  try {
    const db = await runtime.getD1Database("DB");
    const migration = await readFile(
      new URL(
        "../dist/.openai/drizzle/0000_slim_snowbird.sql",
        import.meta.url,
      ),
      "utf8",
    );
    for (const sql of migration
      .split("--> statement-breakpoint")
      .filter((s) => s.trim()))
      await db.prepare(sql).run();
    const response = await runtime.dispatchFetch("http://localhost/");
    assert.equal(response.status, 200);
    const html = await response.text();
    for (const id of [
      "homePage",
      "destinationsPage",
      "communityPage",
      "communityForm",
      "notesList",
      "clothCanvas",
    ])
      assert.ok(html.includes(`id="${id}"`), `${id} exists`);
    assert.doesNotMatch(html, /Your site is taking shape|Codex is working/);

    const owner = "a".repeat(32);
    const other = "b".repeat(32);
    const note = {
      id: crypto.randomUUID(),
      name: "Test traveler",
      country: "japan",
      message: "A local test note.",
    };
    const call = (
      method,
      token,
      body,
      query = "",
      origin = "http://localhost",
    ) =>
      runtime.dispatchFetch(`http://localhost/api/community${query}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Note-Owner": token,
          Origin: origin,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    assert.equal((await call("POST", "", note)).status, 401);
    assert.equal(
      (await call("POST", owner, { ...note, message: "x" })).status,
      400,
    );
    assert.equal(
      (await call("POST", owner, note, "", "https://other.example")).status,
      403,
    );
    assert.equal((await call("POST", owner, note)).status, 201);
    assert.equal(
      (await call("POST", owner, note)).status,
      200,
      "retry is idempotent",
    );
    assert.equal(
      (await call("POST", owner, { ...note, id: crypto.randomUUID() })).status,
      429,
    );
    const publicNotes = await (await call("GET", "", null)).json();
    assert.equal(publicNotes.notes.length, 1);
    assert.equal(publicNotes.notes[0].canDelete, false);
    assert.equal(publicNotes.notes[0].owner_hash, undefined);
    const mine = await (await call("GET", owner, null)).json();
    assert.equal(mine.notes[0].canDelete, true);
    assert.equal(
      (await call("DELETE", other, null, `?id=${note.id}`)).status,
      404,
    );
    assert.equal(
      (await call("DELETE", owner, null, `?id=${note.id}`)).status,
      200,
    );
    assert.equal((await (await call("GET", "", null)).json()).notes.length, 0);
  } finally {
    await runtime.dispose();
  }
});
