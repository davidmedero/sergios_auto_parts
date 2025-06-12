import { NextResponse } from 'next/server';

const API_KEY = "A0UhvpOB5J6ZJiROKUz8Ra0pRKEEkS1l60o8YRZn";

export async function GET() {
  const resp = await fetch(
    'https://q7kyg7m2f5.execute-api.us-east-1.amazonaws.com/dev/years',
    { headers: { 'x-api-key': API_KEY } }
  );
  if (!resp.ok) return NextResponse.error();
  const data = await resp.json();
  return NextResponse.json(data);
}