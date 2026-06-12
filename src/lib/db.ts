import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  // Use postgres driver — better for serverless (Supabase pooler compatible)
  // For Supabase: use the Transaction pooler URL (port 6543) to avoid IPv6/TCP issues on Vercel
  const client = postgres(url, {
    prepare: false,   // required for PgBouncer/Supabase pooler in transaction mode
    ssl: "require",
    max: 1,           // serverless: 1 connection per function instance
    idle_timeout: 20,
    connect_timeout: 10,
  });
  _db = drizzle(client, { schema });
  return _db;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDb() as any)[prop];
  },
});
