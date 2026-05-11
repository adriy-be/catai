
/**
 * drizzle-orm configuration for the project.
 */
import 'dotenv/config';

export default {
    out: './drizzle',
    schema: './src/db/schema.sqlite.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB_FILE_NAME!,
    },
};
