import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommenterModel from "@/models/Commenter";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the commenter record for this user
    const commenterRecord = await CommenterModel.findOne({ user: userId });

    if (!commenterRecord) {
      return NextResponse.json(
        { message: "No commenters found for this user", commenters: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: "Commenters retrieved successfully",
      commenters: commenterRecord.commenterIds,
      totalCommenters: commenterRecord.commenterIds.length,
    });
  } catch (error) {
    console.error("Error retrieving commenters:", error);
    return NextResponse.json(
      { message: "Failed to retrieve commenters", error: String(error) },
      { status: 500 }
    );
  }
}
