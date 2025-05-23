import { NextResponse } from "next/server";
import { fetchInstagramUserDetails } from "@/utils/instagramApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const accessToken = searchParams.get("accessToken");
  const type = searchParams.get("type") || "post";

  try {
    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: "userId and accessToken are required" },
        { status: 400 }
      );
    }

    const userData = await fetchInstagramUserDetails(
      accessToken,
      "id,username,account_type,media_count,profile_picture_url"
    );

    const { id, username, profile_picture_url } = userData;

    return NextResponse.json({
      id,
      username,
      profilePic: profile_picture_url,

      type,
    });
  } catch (error) {
    console.error("Error fetching Instagram details:", {
      error,
      message: error.message,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch Instagram details",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
