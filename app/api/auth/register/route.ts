import { NextRequest, NextResponse } from 'next/server';
import { query, saveDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user into DB
    await query(
      'INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, 'customer', 'approved']
    );

    // Persist changes to fedex.db
    saveDB();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
