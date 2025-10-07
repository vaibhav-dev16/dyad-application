// db.ts (browser)
import initSqlJs, { Database as SqlJsDB } from "sql.js";
import { drizzle, type SqlJsDatabase } from "drizzle-orm/sql-js";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/sql-js/migrator";

const DB_STORAGE_KEY = "dyad_sqlite_db";

let _db: SqlJsDatabase<typeof schema> | null = null;
let _sqlitePromise: Promise<SqlJsDB> | null = null;

async function loadPersistedDbBytes(): Promise<Uint8Array | null> {
  try {
    const b64 = localStorage.getItem(DB_STORAGE_KEY);
    if (!b64) return null;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function persistDbBytes(db: SqlJsDB): void {
  try {
    const bytes = db.export();
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    localStorage.setItem(DB_STORAGE_KEY, b64);
  } catch {
    // best-effort
  }
}

export async function initializeDatabase(): Promise<SqlJsDatabase<typeof schema>> {
  if (_db) return _db;

  if (!_sqlitePromise) {
    _sqlitePromise = initSqlJs({ locateFile: (f) => `/${f}` }).then(async (SQL) => {
      const persisted = await loadPersistedDbBytes();
      const sqlite = new SQL.Database(persisted || undefined);
      // Foreign keys on by default in sql.js
      return sqlite;
    });
  }

  const sqlite = await _sqlitePromise;
  const db = drizzle(sqlite, { schema });

  try {
    // Run SQL migrations shipped in /drizzle as .sql files is not available in browser at runtime.
    // Prefer Drizzle schema sync or pre-bundled SQL migrations converted to JS if needed.
    migrate(db, { migrations: {} as any });
  } catch {
    // Ignore if no JS migrations are provided
  }

  // Persist after any transaction commit - simplistic: persist on init
  persistDbBytes(sqlite);

  _db = db;
  return _db;
}

export function getDb(): SqlJsDatabase<typeof schema> {
  if (!_db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return _db;
}

export const db = new Proxy({} as any, {
  get(target, prop) {
    const database = getDb();
    return (database as any)[prop];
  },
}) as SqlJsDatabase<typeof schema> & { $client: SqlJsDB };
