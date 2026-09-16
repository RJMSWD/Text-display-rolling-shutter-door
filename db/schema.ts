import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fieldNotes = sqliteTable(
  "field_notes",
  {
    id: text("id").primaryKey(),
    ownerHash: text("owner_hash").notNull(),
    name: text("name").notNull(),
    country: text("country").notNull(),
    message: text("message").notNull(),
    createdAt: integer("created_at").notNull(),
    deletedAt: integer("deleted_at"),
  },
  (table) => [
    index("notes_timeline").on(table.createdAt, table.id),
    index("notes_country_timeline").on(
      table.country,
      table.createdAt,
      table.id,
    ),
    index("notes_owner_timeline").on(table.ownerHash, table.createdAt),
  ],
);
