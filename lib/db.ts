import path from 'path';
import fs from 'fs';

const initSqlJs = eval("require")('sql.js/dist/sql-asm.js');

let db: any = null;

export async function initDB() {
  const SQL = await initSqlJs();
  const filePath = path.join(process.cwd(), 'fedex.db');
  
  let buffer = null;
  if (fs.existsSync(filePath)) {
    buffer = fs.readFileSync(filePath);
  }
  
  db = new SQL.Database(buffer);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      status TEXT DEFAULT 'approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      pickup_address TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      current_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS tracking_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  const admin = db.exec('SELECT * FROM users WHERE email = "admin@fedex.com"');
  if (admin.length === 0 || admin[0].values.length === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['System Admin', 'admin@fedex.com', hashedPassword, 'admin', 'approved']);
    saveDB();
  }
  
  return db;
}

export function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path.join(process.cwd(), 'fedex.db'), buffer);
  }
}

export function getDB() {
  return db;
}

export async function query(sql: string, params: any[] = []) {
  if (!db) await initDB();
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return { rows: results };
  } catch (error) {
    console.error('Query error:', error);
    return { rows: [] };
  }
}
