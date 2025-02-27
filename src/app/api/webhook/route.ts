import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Webhook received!"); // Debug log
    const body = await request.json();
    console.log("Instagram Webhook Data:", JSON.stringify(body, null, 2)); // Debug log

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook POST request:", error); // Debug log
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log("GET request received!"); // Debug log
  const { searchParams } = new URL(request.url);
  const hubChallenge = searchParams.get("hub.challenge");

  if (hubChallenge) {
    console.log("Instagram Verification Challenge:", hubChallenge); // Debug log
    return new Response(hubChallenge);
  }

  return NextResponse.json({
    message: "This is a GET request, Hello WebBook!",
  });
}
