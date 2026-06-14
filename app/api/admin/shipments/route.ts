import { NextRequest, NextResponse } from 'next/server';
import { query, saveDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
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

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const tracking_number = body.tracking_number || ('FX-' + Math.floor(1000000000 + Math.random() * 9000000000));
    const customer_name = body.customer_name || body.recipient_name || 'Recipient';
    const customer_email = body.customer_email || 'customer@example.com';
    const customer_phone = body.customer_phone || body.recipient_phone || body.sender_phone || '';
    const pickup_address = body.pickup_address || body.origin || 'Origin';
    const delivery_address = body.delivery_address || body.destination || 'Destination';
    const status = 'BOOKED';

    await query(
      `INSERT INTO parcels (
        tracking_number, customer_name, customer_email, customer_phone,
        pickup_address, delivery_address, status, current_location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tracking_number, customer_name, customer_email, customer_phone,
        pickup_address, delivery_address, status, pickup_address
      ]
    );

    await query(
      `INSERT INTO tracking_history (tracking_number, status, location) VALUES (?, ?, ?)`,
      [tracking_number, status, pickup_address]
    );

    saveDB();

    return NextResponse.json({
      success: true,
      tracking_number
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
