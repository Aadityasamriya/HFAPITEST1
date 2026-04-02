import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'database.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      telegram_id TEXT UNIQUE NOT NULL,
      hf_api_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return dbInstance;
}

export async function getUser(telegramId: string) {
  const db = await getDb();
  let user = await db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
  if (!user) {
    const result = await db.run('INSERT INTO users (telegram_id) VALUES (?)', [telegramId]);
    user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
  }
  return user;
}

export async function updateUserApiKey(telegramId: string, apiKey: string) {
  const db = await getDb();
  await db.run('UPDATE users SET hf_api_key = ? WHERE telegram_id = ?', [apiKey, telegramId]);
}

export async function addMessage(userId: number, role: string, content: string) {
  const db = await getDb();
  await db.run('INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)', [userId, role, content]);
}

export async function getChatHistory(userId: number, limit = 10) {
  const db = await getDb();
  return await db.all('SELECT role, content FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
}

export async function clearChatHistory(userId: number) {
  const db = await getDb();
  await db.run('DELETE FROM messages WHERE user_id = ?', [userId]);
}

export async function resetDatabase(userId: number) {
  const db = await getDb();
  await db.run('DELETE FROM messages WHERE user_id = ?', [userId]);
  await db.run('DELETE FROM users WHERE id = ?', [userId]);
}

export async function getStats() {
  const db = await getDb();
  const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
  const messagesCount = await db.get('SELECT COUNT(*) as count FROM messages');
  return {
    users: usersCount?.count || 0,
    messages: messagesCount?.count || 0
  };
}
