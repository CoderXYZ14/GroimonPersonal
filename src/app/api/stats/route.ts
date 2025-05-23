import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/redis";
import AutomationModel from "@/models/Automation";
import StoryModel from "@/models/Story";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

//GET request to get total hits, redirect hits and total automations created
export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const statsType = url.searchParams.get("type") || "all";

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid User ID format" },
        { status: 400 }
      );
    }

    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    switch (statsType) {
      case "hits": {
        const [totalHitsPost, totalHitsStory] = await Promise.all([
          AutomationModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$hitCount" } } },
          ]),
          StoryModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$hitCount" } } },
          ]),
        ]);

        const totalHits =
          (totalHitsPost[0]?.total || 0) + (totalHitsStory[0]?.total || 0);

        return NextResponse.json({ totalHits }, { status: 200 });
      }

      case "redirects": {
        const [redirectHitsPost, redirectHitsStory] = await Promise.all([
          AutomationModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$redirectCount" } } },
          ]),
          StoryModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$redirectCount" } } },
          ]),
        ]);

        const totalRedirectHits =
          (redirectHitsPost[0]?.total || 0) +
          (redirectHitsStory[0]?.total || 0);

        return NextResponse.json({ totalRedirectHits }, { status: 200 });
      }

      case "count": {
        const [postCount, storyCount] = await Promise.all([
          AutomationModel.countDocuments({ user: objectId }),
          StoryModel.countDocuments({ user: objectId }),
        ]);

        const totalAutomations = postCount + storyCount;

        return NextResponse.json({ totalAutomations }, { status: 200 });
      }

      case "all":
      default: {
        const cacheKey = `stats:${userId}:all`;
        const cached = await getCache(cacheKey);
        if (cached) {
          return NextResponse.json(cached, { status: 200 });
        }

        const [
          totalHitsPost,
          totalHitsStory,
          redirectHitsPost,
          redirectHitsStory,
          postCount,
          storyCount,
        ] = await Promise.all([
          AutomationModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$hitCount" } } },
          ]),
          StoryModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$hitCount" } } },
          ]),
          AutomationModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$redirectCount" } } },
          ]),
          StoryModel.aggregate([
            { $match: { user: objectId } },
            { $group: { _id: null, total: { $sum: "$redirectCount" } } },
          ]),
          AutomationModel.countDocuments({ user: objectId }),
          StoryModel.countDocuments({ user: objectId }),
        ]);

        const totalHits =
          (totalHitsPost[0]?.total || 0) + (totalHitsStory[0]?.total || 0);

        const totalRedirectHits =
          (redirectHitsPost[0]?.total || 0) +
          (redirectHitsStory[0]?.total || 0);

        const totalAutomations = postCount + storyCount;

        const stats = { totalHits, totalRedirectHits, totalAutomations };

        await setCache(cacheKey, stats);

        return NextResponse.json(stats, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch stats",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
