import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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
      supabase_url TEXT,
      supabase_key TEXT,
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

export async function updateUserSupabase(telegramId: string, url: string, key: string) {
  const db = await getDb();
  await db.run('UPDATE users SET supabase_url = ?, supabase_key = ? WHERE telegram_id = ?', [url, key, telegramId]);
}

export async function addMessage(user: any, role: string, content: string) {
  // If user has Supabase configured, store it there to keep developer DB clean
  if (user.supabase_url && user.supabase_key) {
    try {
      const supabase = createClient(user.supabase_url, user.supabase_key);
      await supabase.from('messages').insert([{ role, content, telegram_id: user.telegram_id }]);
      return;
    } catch (error) {
      console.error('Failed to save to user Supabase, falling back to local DB', error);
    }
  }

  // Fallback to local SQLite
  const db = await getDb();
  await db.run('INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)', [user.id, role, content]);
}

export async function getChatHistory(user: any, limit = 10) {
  // If user has Supabase configured, fetch from there
  if (user.supabase_url && user.supabase_key) {
    try {
      const supabase = createClient(user.supabase_url, user.supabase_key);
      const { data, error } = await supabase
        .from('messages')
        .select('role, content')
        .eq('telegram_id', user.telegram_id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch from user Supabase, falling back to local DB', error);
    }
  }

  // Fallback to local SQLite
  const db = await getDb();
  return await db.all('SELECT role, content FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [user.id, limit]);
}

export async function clearChatHistory(user: any) {
  if (user.supabase_url && user.supabase_key) {
    try {
      const supabase = createClient(user.supabase_url, user.supabase_key);
      await supabase.from('messages').delete().eq('telegram_id', user.telegram_id);
    } catch (error) {
      console.error('Failed to clear user Supabase', error);
    }
  }
  const db = await getDb();
  await db.run('DELETE FROM messages WHERE user_id = ?', [user.id]);
}

export async function resetDatabase(user: any) {
  await clearChatHistory(user);
  const db = await getDb();
  await db.run('DELETE FROM users WHERE id = ?', [user.id]);
}

export async function getStats() {
  const db = await getDb();
  const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
  const messagesCount = await db.get('SELECT COUNT(*) as count FROM messages');
  const supabaseUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE supabase_url IS NOT NULL');
  
  return {
    users: usersCount?.count || 0,
    messages: messagesCount?.count || 0,
    supabaseUsers: supabaseUsers?.count || 0
  };
}
