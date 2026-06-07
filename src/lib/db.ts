import mysql from "mysql2/promise";

// Reuse a single pool across hot reloads (dev) and the whole server process
// (prod). Without this, Next.js re-evaluates the module on every hot reload and
// opens a brand-new pool each time, quickly exhausting Hostinger's
// `max_connections_per_hour` limit.
const globalForDb = globalThis as unknown as { _scPool?: mysql.Pool };

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5, // small pool — connections are reused, not recreated
    maxIdle: 5,
    idleTimeout: 60_000,
    queueLimit: 0,
    enableKeepAlive: true, // keep sockets alive so they get reused
    keepAliveInitialDelay: 10_000,
  });
}

const pool = globalForDb._scPool ?? createPool();
globalForDb._scPool = pool;

export default pool;
