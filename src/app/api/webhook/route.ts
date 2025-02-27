import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(JSON.stringify(body, null, 4));
    return NextResponse.json({
      message: "This is POST Request, Hello Webhook!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hubMode = searchParams.get("hub.mode");
  const hubChallenge = searchParams.get("hub.challenge");
  const hubVerifyToken = searchParams.get("hub.verify_token");

  if (hubChallenge) {
    return new Response(hubChallenge);
  } else {
    return NextResponse.json({
      message: "This is GET Request, Hello Webhook!",
    });
  }
}
