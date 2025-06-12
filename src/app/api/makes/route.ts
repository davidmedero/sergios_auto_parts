import { NextResponse } from 'next/server';

const API_KEY = "A0UhvpOB5J6ZJiROKUz8Ra0pRKEEkS1l60o8YRZn";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  if (!year) return NextResponse.json({ error: 'year required' }, { status: 400 });

  const resp = await fetch(
    `https://q7kyg7m2f5.execute-api.us-east-1.amazonaws.com/dev/makes?year=${year}`,
    { headers: { 'x-api-key': API_KEY } }
  );
  if (!resp.ok) return NextResponse.error();
  const data = await resp.json();
  return NextResponse.json(data);
}