# Database Setup & Initialization Guide

## Overview

This project uses **SQLite** for local development and **PostgreSQL** for production. The database is managed using **Drizzle ORM**.

## Database Initialization

### Prerequisites

Ensure you have Node.js 22.13.0+ installed and dependencies installed:

```bash
cd backend
npm install
```

### Step 1: Environment Configuration

The `.env` file is pre-configured with:

```dotenv
OPENROUTER_API_KEY=your-api-key
CATAI_MODEL=openrouter/deepseek-ai/DeepSeek-V3.2
DB_FILE_NAME=catai.db          # SQLite database file name
SQLITE_PATH=./local.db         # SQLite database file path (optional, defaults to ./local.db)
```

**Key Variables:**
- `DB_FILE_NAME`: Name of the database file (used by Drizzle config)
- `SQLITE_PATH`: Full path where SQLite database is stored (development only)
- `DATABASE_URL`: Used for PostgreSQL in production

### Step 2: Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create the SQLite database file at `./local.db`
- Create the `category` table with columns:
  - `id`: Auto-incrementing primary key
  - `name`: Unique category name (indexed)
  - `type`: Category type ('numeric', 'bool', 'str')
  - `numeric_min` & `numeric_max`: Min/max values for numeric types
  - `created_at` & `updated_at`: Timestamps
  
- Create the `entry` table with columns:
  - `id`: Auto-incrementing primary key
  - `category_id`: Foreign key reference to category
  - `value`: JSON-encoded value
  - `source_text`: Original text for the value
  - `created_at`: Creation timestamp

- Enable foreign key constraints

## Starting the Application

### Development Mode

```bash
npm run dev
```

This will:
1. ✓ Initialize/verify the database
2. ✓ Start the Mastra development server
3. ✓ Enable hot-reload for code changes

### Production Build

```bash
npm run build
```

Compiles TypeScript to JavaScript.

### Production Start

```bash
npm start
```

This will:
1. ✓ Initialize/verify the database
2. ✓ Start the Mastra server in production mode

## Database Schema

### Categories Table
```sql
CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('numeric', 'bool', 'str')),
    numeric_min REAL,
    numeric_max REAL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

### Entries Table
```sql
CREATE TABLE IF NOT EXISTS entry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    source_text TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
)
```

## Using the Database

The repository is accessed through `createCategoryEntryRepo()`:

```typescript
import { createCategoryEntryRepo } from './db/repo';

const repo = await createCategoryEntryRepo();

// Create a category
const category = await repo.createCategory({
    name: 'Temperature',
    type: 'numeric',
    numericMin: -50,
    numericMax: 60
});

// Write an entry
const result = await repo.writeEntry({
    categoryId: category.id,
    value: 25,
    sourceText: 'Room temperature'
});

// Find similar category
const similar = await repo.findSimilarCategory('temp');

// Get category by ID
const found = await repo.getCategoryById(category.id);
```

## Troubleshooting

### Database file not found
**Error:** `SQLITE_ERROR: unable to open database file`
- Ensure the directory exists where the database file should be created
- Check file permissions
- Verify `SQLITE_PATH` environment variable

### Foreign key constraint failed
**Error:** `SQLITE_ERROR: FOREIGN KEY constraint failed`
- Ensure you're using a valid `categoryId` when writing entries
- Foreign keys are enabled by default in this setup

### Type mismatch errors
**Error:** Invalid category type or value type
- Valid category types: `'numeric'`, `'bool'`, `'str'`
- Numeric values must be finite numbers
- Bool values accept: `true`, `false`, `'yes'`, `'no'`, `'1'`, `'0'`, etc.
- String values accept any text

### Database is locked
**Error:** `SQLITE_ERROR: database is locked`
- Close other connections to the database
- Ensure only one process is writing at a time
- Check for zombie processes: `lsof | grep local.db`

## Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `init-db` | `npm run init-db` | Initialize/verify database schema |
| `dev` | `npm run dev` | Start development server with auto init |
| `build` | `npm run build` | Build for production |
| `start` | `npm start` | Start production server with auto init |

## Production Setup

For production, switch to PostgreSQL:

1. Set `NODE_ENV=production`
2. Set `DATABASE_URL=postgresql://user:password@host:port/dbname`
3. The repository will automatically use the PostgreSQL driver
4. Run `npm start` - it will initialize the database connection

The database schema is identical for both SQLite and PostgreSQL, so data can be migrated between them.
