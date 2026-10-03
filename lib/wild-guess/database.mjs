import { neon } from '@neondatabase/serverless';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
let connection;
export function database() {
  if (connection) return connection;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (url) {
    const sql = neon(url);
    connection = {kind:'postgres', query:(text, values=[]) => sql.query(text,values), batch: statements => sql.transaction(statements.map(([text,values=[]]) => sql.query(text,values)))};
  } else {
    if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && !process.env.WILD_GUESS_DB_PATH)) throw new Error('Wild Guess requires a configured production database.');
    const require = createRequire(import.meta.url);
    const { DatabaseSync } = require('node:sqlite');
    const filename = process.env.WILD_GUESS_DB_PATH || path.join(process.cwd(),'.local/wild-guess.sqlite');
    mkdirSync(path.dirname(filename),{recursive:true});
    const db = new DatabaseSync(filename);
    db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    const run = (text,values=[]) => { const ordered=[]; const query=text.replace(/\$(\d+)/g,(_,n)=>{ordered.push(values[Number(n)-1]);return '?';}); return db.prepare(query).all(...ordered); };
    connection = {kind:'sqlite',query:async (...args)=>run(...args),batch:async statements=>{db.exec('BEGIN IMMEDIATE');try{const rows=statements.map(args=>run(...args));db.exec('COMMIT');return rows;}catch(error){db.exec('ROLLBACK');throw error;}}};
  }
  return connection;
}
