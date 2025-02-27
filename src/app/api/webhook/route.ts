import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hubMode = searchParams.get("hub.mode");
  const hubChallenge = searchParams.get("hub.challenge");
  const hubVerifyToken = searchParams.get("hub.verify_token");

  if (hubChallenge) {
    return new NextResponse(hubChallenge);
  } else {
    return NextResponse.json({
      message: "This is GET Request, Hello Webbook!",
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log(JSON.stringify(data, null, 4));
    return NextResponse.json({
      message: "This is POST Request, Hello Webbook!",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
