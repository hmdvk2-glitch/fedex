import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tracking_number: string }> }
) {
  try {
    const { tracking_number } = await params;

    if (!tracking_number) {
      return NextResponse.json({ error: 'Missing tracking number' }, { status: 400 });
    }

    const parcelResult = await query('SELECT * FROM parcels WHERE tracking_number = ?', [tracking_number]);
    if (parcelResult.rows.length === 0) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    const historyResult = await query(
      'SELECT * FROM tracking_history WHERE tracking_number = ? ORDER BY timestamp DESC',
      [tracking_number]
    );

    return NextResponse.json({
      parcel: parcelResult.rows[0],
      history: historyResult.rows
    });
  } catch (error) {
    console.error('Fetch tracking error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
