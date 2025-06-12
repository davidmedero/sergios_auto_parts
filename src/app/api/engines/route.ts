import { NextResponse } from 'next/server';

const API_KEY = "A0UhvpOB5J6ZJiROKUz8Ra0pRKEEkS1l60o8YRZn";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year      = searchParams.get('year');
  const make_name = searchParams.get('make_name');
  const model_name = searchParams.get('model_name');
  if (!year || !make_name || !model_name) {
    return NextResponse.json({ error: 'year & make_name & model_name required' }, { status: 400 });
  }

  const resp = await fetch(
    `https://q7kyg7m2f5.execute-api.us-east-1.amazonaws.com/dev/engines?year=${year}&make_name=${encodeURIComponent(make_name)}&model_name=${encodeURIComponent(model_name)}`,
    { headers: { 'x-api-key': API_KEY } }
  );
  if (!resp.ok) return NextResponse.error();
  const data = await resp.json();
  return NextResponse.json(data);
}