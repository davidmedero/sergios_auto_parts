import { NextResponse } from "next/server";

const API_URL =
  "https://q7kyg7m2f5.execute-api.us-east-1.amazonaws.com/dev/parts_search";
const API_KEY = "A0UhvpOB5J6ZJiROKUz8Ra0pRKEEkS1l60o8YRZn";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const makeName = searchParams.get("make_name");
  const modelName = searchParams.get("model_name");
  const year = searchParams.get("year");
  // const engineBase = searchParams.get("engine_base_name");

  if (!makeName || !modelName || !year) {
    return NextResponse.json(
      { error: "make_name, model_name, year, engine_base_name are all required" },
      { status: 400 }
    );
  }

  const remoteUrl = new URL(API_URL);
  remoteUrl.searchParams.set("make_name", makeName);
  remoteUrl.searchParams.set("model_name", modelName);
  remoteUrl.searchParams.set("year", year);
  // remoteUrl.searchParams.set("engine_base_name", engineBase);

  try {
    const res = await fetch(remoteUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `External API returned ${res.status}` },
        { status: res.status }
      );
    }

    const payload = await res.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error fetching fitments:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}