
/**
 * Repository for category and entry operations, supporting both SQLite and PostgreSQL.
 */
import { eq, ilike, like } from "drizzle-orm";

export type CategoryType = "numeric" | "bool" | "str";

export type CategoryInput = {
    name: string;
    type: CategoryType;
    numericMin?: number | null;
    numericMax?: number | null;
};

export type EntryValue =
    | { type: "numeric"; value: number }
    | { type: "bool"; value: boolean }
    | { type: "str"; value: string };

export type WriteEntryInput = {
    categoryId: number;
    value: unknown;
    sourceText?: string;
};

function normalizeName(name: string): string {
    return name.trim().toLowerCase();
}

function validateCategoryType(type: string): CategoryType {
    if (type === "numeric" || type === "bool" || type === "str") {
        return type;
    }

    throw new Error(`Invalid category type: ${type}`);
}

type Category = {
    id: number;
    name: string;
    type: CategoryType;
    numericMin?: number | null;
    numericMax?: number | null;
};

function validateValue(category: Category, rawValue: unknown): EntryValue {
    const categoryType = validateCategoryType(category.type);

    if (categoryType === "numeric") {
        const value = Number(rawValue);
        if (!Number.isFinite(value)) {
            throw new Error(`Invalid numeric value: ${String(rawValue)}`);
        }
        if (category.numericMin != null && value < category.numericMin) {
            throw new Error(`Value ${value} is below min ${category.numericMin}`);
        }
        if (category.numericMax != null && value > category.numericMax) {
            throw new Error(`Value ${value} is above max ${category.numericMax}`);
        }
        return { type: "numeric", value };
    }

    if (categoryType === "bool") {
        if (typeof rawValue === "boolean") {
            return { type: "bool", value: rawValue };
        }
        if (typeof rawValue === "string") {
            const clean = rawValue.trim().toLowerCase();
            if (["true", "yes", "y", "1", "oui", "vrai", "done", "taken"].includes(clean)) {
                return { type: "bool", value: true };
            }
            if (["false", "no", "n", "0", "non", "faux", "not done", "not taken"].includes(clean)) {
                return { type: "bool", value: false };
            }
        }
        throw new Error(`Invalid bool value: ${String(rawValue)}`);
    }

    return {
        type: "str",
        value: String(rawValue),
    };
}

export async function createCategoryEntryRepo() {
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
        const { drizzle } = await import("drizzle-orm/node-postgres");
        const { Pool } = await import("pg");
        const schema = await import("./schema.pg");

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL!,
        });

        const db = drizzle({ client: pool, schema });

        return buildRepo({
            db,
            schema,
            dialect: "pg",
        });
    }

    const BetterSqlite3Module = await import("better-sqlite3");

    // @ts-ignore - better-sqlite3 default export typing issue
    const Database = BetterSqlite3Module.default;

    const sqlite = new Database(process.env.SQLITE_PATH ?? "./local.db");


    const { drizzle } = await import("drizzle-orm/better-sqlite3");
    const schema = await import("./schema.sqlite");


    const db = drizzle({ client: sqlite, schema });

    return buildRepo({
        db,
        schema,
        dialect: "sqlite",
    });
}

interface RepoArgs {
    db: any;
    schema: { categories: any; entries: any };
    dialect: "sqlite" | "pg";
}

function buildRepo(args: RepoArgs) {
    const { db, schema, dialect } = args;
    const { categories, entries } = schema;

    return {
        async findSimilarCategory(name: string): Promise<Category | null> {
            const normalized = normalizeName(name);
            const rows =
                dialect === "pg"
                    ? await db
                        .select()
                        .from(categories)
                        .where(ilike(categories.name, `%${normalized}%`))
                        .limit(1)
                    : await db
                        .select()
                        .from(categories)
                        .where(like(categories.name, `%${normalized}%`))
                        .limit(1);
            return rows[0] ?? null;
        },

        async getCategoryById(categoryId: number): Promise<Category | null> {
            const rows = await db
                .select()
                .from(categories)
                .where(eq(categories.id, categoryId))
                .limit(1);
            return rows[0] ?? null;
        },

        async createCategory(input: CategoryInput): Promise<Category> {
            const rows = await db
                .insert(categories)
                .values({
                    name: normalizeName(input.name),
                    type: input.type,
                    numericMin: input.numericMin ?? null,
                    numericMax: input.numericMax ?? null,
                })
                .returning();
            return rows[0];
        },

        async resolveCategory(input: CategoryInput): Promise<{ category: Category; created: boolean }> {
            const existing = await this.findSimilarCategory(input.name);
            if (existing) {
                return {
                    category: existing,
                    created: false,
                };
            }
            const created = await this.createCategory(input);
            return {
                category: created,
                created: true,
            };
        },

        async writeEntry(input: WriteEntryInput): Promise<{ category: Category; entry: any; typedValue: EntryValue }> {
            const category = await this.getCategoryById(input.categoryId);
            if (!category) {
                throw new Error(`Category not found: ${input.categoryId}`);
            }
            const typedValue = validateValue(category, input.value);
            const dbValue =
                dialect === "sqlite" ? JSON.stringify(typedValue) : typedValue;
            const rows = await db
                .insert(entries)
                .values({
                    categoryId: category.id,
                    value: dbValue,
                    sourceText: input.sourceText ?? null,
                })
                .returning();
            return {
                category,
                entry: rows[0],
                typedValue,
            };
        },
    };
}