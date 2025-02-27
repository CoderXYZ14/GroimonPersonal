// app/api/fetch-creator-data/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import the cookies function
import axios from "axios";

export async function GET(request: Request) {
  // Use the cookies function asynchronously
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token not found" },
      { status: 401 }
    );
  }

  try {
    const response = await axios.get(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    // Ensure the response matches the expected structure
    const creatorData = {
      id: response.data.id,
      username: response.data.username,
    };

    return NextResponse.json(creatorData);
  } catch (error) {
    console.error("Error fetching creator data:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator data" },
      { status: 500 }
    );
  }
}
