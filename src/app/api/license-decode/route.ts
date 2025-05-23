import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const licensePlate = searchParams.get("license_plate");
  const state        = searchParams.get("state");

  if (!licensePlate || !state) {
    return NextResponse.json(
      { error: "license_plate and state are required" },
      { status: 400 }
    );
  }

  const apiUrl = `https://api.vehicledatabases.com/license-decode/${encodeURIComponent(licensePlate)}/${encodeURIComponent(state)}`;
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