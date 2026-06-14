import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let result;
    if (decoded.role === 'admin') {
      result = await query('SELECT * FROM parcels ORDER BY created_at DESC');
    } else {
      result = await query('SELECT * FROM parcels WHERE customer_email = ? ORDER BY created_at DESC', [decoded.email]);
    }

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch parcels error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
