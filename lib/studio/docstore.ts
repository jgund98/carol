// The Studio Office keeps everything (artwork, collections, inquiries, orders,
// settings) as small JSON documents in a handful of tables. One tiny interface,
// three backends:
//   postgres  — DATABASE_URL set (Neon via the Vercel integration, or any Postgres)
//   file      — local development, .data/studio.json next to the project
//   readonly  — deployed without a database yet: reads come from the seed,
//               writes fail with a plain-English message the office shows.
// Every table is `id text primary key, created_at, updated_at, data jsonb`, so
// there is nothing to migrate when a field is added.
import fs from "node:fs";
import path from "node:path";

export type Table = "work" | "collection" | "inquiry" | "order" | "setting";
export type StoreMode = "postgres" | "file" | "readonly";

export interface DocStore {
  mode: StoreMode;
  list<T>(table: Table): Promise<T[]>;
  get<T>(table: Table, id: string): Promise<T | null>;
  put<T>(table: Table, id: string, data: T): Promise<void>;
  del(table: Table, id: string): Promise<void>;
  count(table: Table): Promise<number>;
}

export class StudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudioError";
  }
}

export const NOT_CONNECTED =
  "The studio database is not connected yet, so changes cannot be saved. Ask Jordan to connect it. Nothing you see here is lost, it is the website's current catalog.";

/* ───────────────────────────── Postgres ───────────────────────────── */

const TABLES: Record<Table, string> = {
  work: "studio_work",
  collection: "studio_collection",
  inquiry: "studio_inquiry",
  order: "studio_order",
  setting: "studio_setting",
};

type Sql = ReturnType<typeof import("postgres")>;

async function pgClient(url: string): Promise<Sql> {
  const g = globalThis as unknown as { __studioSql?: Sql; __studioSqlReady?: Promise<void> };
  if (!g.__studioSql) {
    const postgres = (await import("postgres")).default;
    g.__studioSql = postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 15, prepare: false });
    const sql = g.__studioSql;
    g.__studioSqlReady = (async () => {
      for (const t of Object.values(TABLES)) {
        await sql.unsafe(
          `CREATE TABLE IF NOT EXISTS ${t} (id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), data jsonb NOT NULL)`
        );
      }
    })();
  }
  await g.__studioSqlReady;
  return g.__studioSql;
}

function postgresStore(url: string): DocStore {
  return {
    mode: "postgres",
    async list<T>(table: Table) {
      const sql = await pgClient(url);
      const rows = (await sql.unsafe(`SELECT data FROM ${TABLES[table]} ORDER BY created_at ASC`)) as unknown as { data: T }[];
      return rows.map((r) => r.data);
    },
    async get<T>(table: Table, id: string) {
      const sql = await pgClient(url);
      const rows = (await sql.unsafe(`SELECT data FROM ${TABLES[table]} WHERE id = $1`, [id])) as unknown as { data: T }[];
      return rows[0]?.data ?? null;
    },
    async put<T>(table: Table, id: string, data: T) {
      const sql = await pgClient(url);
      await sql.unsafe(
        `INSERT INTO ${TABLES[table]} (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [id, JSON.stringify(data)]
      );
    },
    async del(table: Table, id: string) {
      const sql = await pgClient(url);
      await sql.unsafe(`DELETE FROM ${TABLES[table]} WHERE id = $1`, [id]);
    },
    async count(table: Table) {
      const sql = await pgClient(url);
      const rows = (await sql.unsafe(`SELECT count(*)::int AS n FROM ${TABLES[table]}`)) as unknown as { n: number }[];
      return rows[0]?.n ?? 0;
    },
  };
}

/* ───────────────────────────── Local file ───────────────────────────── */

type FileShape = Record<Table, Record<string, { created: string; data: unknown }>>;

/**
 * The project folder. Usually process.cwd(), but Jordan's launcher starts
 * `next dev C:/Users/Lucky/carol` from a different directory, so look for
 * next.config.ts and fall back to a sibling `carol` folder before giving up.
 */
export function projectRoot(): string {
  if (process.env.STUDIO_DATA_ROOT) return process.env.STUDIO_DATA_ROOT;
  const cwd = process.cwd();
  const isProject = (d: string) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(d, "package.json"), "utf8")).name === "carol-calicchio";
    } catch {
      return false;
    }
  };
  if (isProject(cwd)) return cwd;
  const sibling = path.resolve(cwd, "..", "carol");
  if (isProject(sibling)) return sibling;
  return cwd;
}
const FILE = path.join(projectRoot(), ".data", "studio.json");

function emptyShape(): FileShape {
  return { work: {}, collection: {}, inquiry: {}, order: {}, setting: {} };
}
function readFile(): FileShape {
  try {
    return { ...emptyShape(), ...(JSON.parse(fs.readFileSync(FILE, "utf8")) as FileShape) };
  } catch {
    return emptyShape();
  }
}
function writeFile(shape: FileShape) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  // Atomic swap via a per-process temp name; `next build` runs many workers at
  // once and Windows refuses a rename onto a file another worker is replacing,
  // so retry briefly and fall back to a direct write.
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(shape));
  for (let i = 0; i < 5; i++) {
    try {
      fs.renameSync(tmp, FILE);
      return;
    } catch {
      const until = Date.now() + 20;
      while (Date.now() < until) {/* spin */}
    }
  }
  try {
    fs.writeFileSync(FILE, JSON.stringify(shape));
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

function fileStore(): DocStore {
  return {
    mode: "file",
    async list<T>(table: Table) {
      const rows = Object.values(readFile()[table]);
      rows.sort((a, b) => a.created.localeCompare(b.created));
      return rows.map((r) => r.data as T);
    },
    async get<T>(table: Table, id: string) {
      return (readFile()[table][id]?.data as T) ?? null;
    },
    async put<T>(table: Table, id: string, data: T) {
      const shape = readFile();
      const prev = shape[table][id];
      shape[table][id] = { created: prev?.created ?? new Date().toISOString(), data };
      writeFile(shape);
    },
    async del(table: Table, id: string) {
      const shape = readFile();
      delete shape[table][id];
      writeFile(shape);
    },
    async count(table: Table) {
      return Object.keys(readFile()[table]).length;
    },
  };
}

/* ───────────────────────────── Read-only seed ───────────────────────────── */

export function readonlyStore(seed: () => Record<Table, Record<string, unknown>>): DocStore {
  const g = globalThis as unknown as { __studioSeed?: Record<Table, Record<string, unknown>> };
  const data = () => (g.__studioSeed ??= seed());
  return {
    mode: "readonly",
    async list<T>(table: Table) {
      return Object.values(data()[table]) as T[];
    },
    async get<T>(table: Table, id: string) {
      return (data()[table][id] as T) ?? null;
    },
    async put() {
      throw new StudioError(NOT_CONNECTED);
    },
    async del() {
      throw new StudioError(NOT_CONNECTED);
    },
    async count(table: Table) {
      return Object.keys(data()[table]).length;
    },
  };
}

/* ───────────────────────────── Selection ───────────────────────────── */

export function pickStore(seed: () => Record<Table, Record<string, unknown>>): DocStore {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) return postgresStore(url);
  if (process.env.VERCEL) return readonlyStore(seed);
  return fileStore();
}
