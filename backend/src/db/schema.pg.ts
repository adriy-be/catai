import {
    pgTable,
    serial,
    text,
    real,
    timestamp,
    jsonb,
    integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("category", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),

    // "numeric" | "bool" | "str"
    type: text("type").notNull(),

    // Used only when type = "numeric"
    numericMin: real("numeric_min"),
    numericMax: real("numeric_max"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const entries = pgTable("entry", {
    id: serial("id").primaryKey(),

    categoryId: integer("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),

    // JSONB:
    // { type: "numeric", value: 12.5 }
    // { type: "bool", value: true }
    // { type: "str", value: "hello" }
    value: jsonb("value").notNull(),

    sourceText: text("source_text"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
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