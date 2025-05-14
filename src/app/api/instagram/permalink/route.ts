import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaId = searchParams.get("mediaId");
    const accessToken = searchParams.get("accessToken");

    if (!mediaId || !accessToken) {
      return NextResponse.json(
        { error: "Media ID and access token are required" },
        { status: 400 }
      );
    }

    // Fetch the permalink from Instagram Graph API
    const response = await axios.get(
      `https://graph.instagram.com/v22.0/${mediaId}?fields=permalink&access_token=${accessToken}`
    );

    return NextResponse.json({ permalink: response.data.permalink });
  } catch (error: any) {
    console.error("Error fetching Instagram permalink:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch permalink" },
      { status: 500 }
    );
  }
}
