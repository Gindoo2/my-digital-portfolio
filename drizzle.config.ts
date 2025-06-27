import type { Config } from "drizzle-kit"
import "dotenv/config"

console.log("Loading database configuration...")

function parseDatabaseUrl(url: string) {
  try {
    const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):?(\d*)\/([^?]+)(\?.*)?/;
    const match = url.match(regex);

    if (!match) {
      throw new Error("Invalid PostgreSQL connection string format");
    }

    const [, user, password, host, , database, queryString] = match;

    const sslRequired = queryString?.includes("sslmode=require");

    return {
      host,
      user,
      password,
      database,
      ssl: sslRequired ? "require" : true as true | "require",
    };
  } catch (error) {
    console.error("Error parsing DATABASE_URL:", error);
    return null;
  }
}

console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);

const dbConfig = process.env.DATABASE_URL 
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : null;

if (!dbConfig && !(process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE && process.env.PGPASSWORD)) {
  throw new Error("No database credentials found in environment variables. Please add them to your .env file.");
}

export default {
  schema: "./lib/db.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: dbConfig || {
    host: process.env.PGHOST!,
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
    ssl: "require",
  },
  verbose: true,
} satisfies Config;