// app/api/fetch-creator-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Make request to Instagram Graph API to get user info
    // Using v22.0 endpoint as specified in the documentation
    const userResponse = await axios.get(
      "https://graph.instagram.com/v22.0/me",
      {
        params: {
          fields: "id,username",
          access_token: token,
        },
      }
    );

    // Return the creator data
    return NextResponse.json(userResponse.data);
  } catch (error) {
    console.error("Error fetching Instagram data:", error);

    // Check if it's an axios error with response
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
