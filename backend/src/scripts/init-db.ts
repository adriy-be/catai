import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.sqlite';

async function initDb() {
    const dbPath = process.env.SQLITE_PATH ?? './local.db';

    console.log(`Initializing database at: ${dbPath}`);

    try {
        // Import and create database
        const DatabaseModule = await import('better-sqlite3');
        // @ts-ignore - better-sqlite3 default export typing issue
        const DatabaseConstructor = DatabaseModule.default;
        const sqlite = new DatabaseConstructor(dbPath);

        // Enable foreign keys
        sqlite.pragma('foreign_keys = ON');

        // Create Drizzle instance
        const db = drizzle({ client: sqlite, schema });

        // Create tables using raw SQL to ensure schema is initialized
        const createCategoriesTable = `
            CREATE TABLE IF NOT EXISTS category (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                type TEXT NOT NULL CHECK(type IN ('numeric', 'bool', 'str')),
                numeric_min REAL,
                numeric_max REAL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createEntriesTable = `
            CREATE TABLE IF NOT EXISTS entry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                value TEXT NOT NULL,
                source_text TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
            )
        `;

        sqlite.exec(createCategoriesTable);
        sqlite.exec(createEntriesTable);

        console.log('✓ Database initialized successfully');
        console.log('✓ Tables created: category, entry');
        console.log('✓ Foreign keys enabled');

        sqlite.close();
        process.exit(0);
    } catch (error) {
        console.error('✗ Failed to initialize database:', error);
        process.exit(1);
    }
}

initDb();
