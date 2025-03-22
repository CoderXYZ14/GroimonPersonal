import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(`https://graph.instagram.com/v22.0/me`, {
      params: {
        fields: "user_id,username,profile_picture_url",
        access_token: accessToken,
      },
    });

    console.log("Instagram details:", response.data);
    const { user_id, username, profile_picture_url } = response.data;

    return NextResponse.json({ user_id, username, profile_picture_url });
  } catch (error) {
    console.error("Error fetching Instagram details:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram details" },
      { status: 500 }
    );
  }
}
