import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'soccer-savings.db');

export async function openDb() {
  console.log(`データベースのパス: ${dbPath}`);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team TEXT NOT NULL,
      competition TEXT NOT NULL,
      match_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team TEXT NOT NULL,
      competition TEXT NOT NULL,
      match_name TEXT NOT NULL UNIQUE,
      is_overtime_or_pk INTEGER DEFAULT 0,
      is_final INTEGER DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS awards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team TEXT NOT NULL,
      competition TEXT NOT NULL,
      rank INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      UNIQUE(team, competition)
    );
  `);

  return db;
}