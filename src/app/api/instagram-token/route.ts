import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    console.log("Received Code:", code); // Debugging log

    const payload = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID || "1009455214362205",
      client_secret:
        process.env.INSTAGRAM_CLIENT_SECRET ||
        "c332ac6d0d6a8fe1b39a68382760492b",
      grant_type: "authorization_code",
      redirect_uri:
        "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/your_insta_token",
      code,
    });

    console.log("Request Payload:", payload.toString()); // Debugging log

    const response = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Instagram API Error:",
      error.response?.data || error.message
    ); // Debugging log
    return NextResponse.json(
      { error: error.response?.data || "Something went wrong" },
      { status: error.response?.status || 500 }
    );
  }
}
