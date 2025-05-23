import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");

  if (!vin) {
    return NextResponse.json({ error: "vin is required" }, { status: 400 });
  }

  const apiUrl = `https://api.vehicledatabases.com/vin-decode/${encodeURIComponent(vin)}`;
  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/json",
      "x-AuthKey": process.env.VEHDB_API_KEY!,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `VehicleDatabases error (${res.status})` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}