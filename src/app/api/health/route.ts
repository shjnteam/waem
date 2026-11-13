import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'ok', app: 'WAEM MVP', version: '0.1.0', environment: 'starter' });
}
