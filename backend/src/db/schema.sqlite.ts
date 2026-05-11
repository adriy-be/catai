import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const categories = sqliteTable("category", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),

    // "numeric" | "bool" | "str"
    type: text("type", { enum: ["numeric", "bool", "str"] }).notNull(),

    // Used only when type = "numeric"
    numericMin: real("numeric_min"),
    numericMax: real("numeric_max"),

    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const entries = sqliteTable("entry", {
    id: integer("id").primaryKey({ autoIncrement: true }),

    categoryId: integer("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),

    // JSON string:
    // { "type": "numeric", "value": 12.5 }
    // { "type": "bool", "value": true }
    // { "type": "str", "value": "hello" }
    value: text("value").notNull(),

    sourceText: text("source_text"),
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const categoryRelations = relations(categories, ({ many }) => ({
    entries: many(entries),
}));

export const entryRelations = relations(entries, ({ one }) => ({
    category: one(categories, {
        fields: [entries.categoryId],
        references: [categories.id],
    }),
}));