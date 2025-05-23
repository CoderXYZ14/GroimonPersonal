import { NextResponse } from "next/server";
import StoryModel, { IStory } from "@/models/Story";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import {
  getCache,
  setCache,
  delCache,
  removeItemFromCachedCollection,
} from "@/lib/redis";
import axios from "axios";
import { IAutomation } from "@/models/Automation";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      name,
      postIds,
      keywords,
      messageType,
      message,
      imageUrl,
      buttonTitle,
      buttons,
      user,
      isFollowed,
      notFollowerMessage,
      followButtonTitle,
      removeBranding,
      respondToAll,
    } = body;

    let { followUpMessage, followUpButtonTitle } = body;

    // Validation checks
    if (
      !name ||
      (!respondToAll && (!keywords || keywords.length === 0)) ||
      !messageType ||
      (messageType === "message" && !message) ||
      !user ||
      (messageType === "ButtonImage" && !imageUrl) ||
      ((messageType === "ButtonText" || messageType === "ButtonImage") &&
        (!buttons || buttons.length === 0))
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    // Log the incoming values for debugging
    console.log("Incoming values:", {
      isFollowed,
      notFollowerMessage,
      followButtonTitle,
      followUpMessage,
      followUpButtonTitle,
    });

    // Additional check for isFollowed
    if (isFollowed) {
      if (!notFollowerMessage || !followButtonTitle) {
        return NextResponse.json(
          {
            message:
              "When isFollowed is true, notFollowerMessage and followButtonTitle are required.",
          },
          { status: 400 }
        );
      }

      // Apply fallback logic if followUpMessage or followUpButtonTitle are missing
      if (!followUpMessage) {
        followUpMessage = notFollowerMessage;
        console.log("Applied fallback for followUpMessage:", followUpMessage);
      }

      // If followUpButtonTitle is empty/null/undefined, use followButtonTitle as fallback
      if (!followUpButtonTitle && followButtonTitle) {
        followUpButtonTitle = followButtonTitle;
        console.log(
          "Applied fallback for followUpButtonTitle from followButtonTitle:",
          followUpButtonTitle
        );
      } else if (!followUpButtonTitle) {
        // If both are empty, use a default value
        followUpButtonTitle = "Continue";
        console.log(
          "Applied default value for followUpButtonTitle:",
          followUpButtonTitle
        );
      }
    }

    // Log the final values after fallback logic
    console.log("Final values after fallback:", {
      followUpMessage,
      followUpButtonTitle,
    });

    const story = new StoryModel({
      name,
      postIds: postIds || [],
      keywords,
      messageType,
      message,
      imageUrl: messageType === "ButtonImage" ? imageUrl : undefined,
      buttonTitle:
        messageType === "ButtonText" || messageType === "ButtonImage"
          ? buttonTitle
          : undefined,
      buttons:
        messageType === "ButtonText" || messageType === "ButtonImage"
          ? buttons
          : undefined,
      user,
      isFollowed: isFollowed || false,
      notFollowerMessage: isFollowed ? notFollowerMessage : undefined,
      followButtonTitle: isFollowed ? followButtonTitle : undefined,
      followUpMessage: isFollowed ? followUpMessage : undefined,
      followUpButtonTitle: isFollowed ? followUpButtonTitle : undefined,
      removeBranding: removeBranding || false,
      respondToAll: respondToAll || false,
      isActive: true,
      hitCount: 0,
    });

    await story.save();

    // Update cache
    const cacheKey = `story:${story._id}`;
    await setCache(cacheKey, story);
    // Invalidate user stories cache
    await delCache(`stories:user:${user}`);
    // Invalidate total hits cache
    await delCache(`story:totalHits:${user}`);

    // Update user's stories array
    const updatedUser = await UserModel.findByIdAndUpdate(
      user,
      { $push: { stories: story._id } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { message: "Failed to create story", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");
    const getTotalHits = searchParams.get("getTotalHits");

    if (getTotalHits === "true" && userId) {
      const cacheKey = `story:totalHits:${userId}`;
      const cachedTotalHits = await getCache(cacheKey);
      if (cachedTotalHits !== null)
        return NextResponse.json({ totalHits: cachedTotalHits });

      await dbConnect();
      const [result] = await StoryModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$hitCount" } } },
      ]);

      const hitCount = result?.total || 0;
      await setCache(cacheKey, hitCount, 300); // 5 min TTL
      return NextResponse.json({ totalHits: hitCount });
    }

    if (id) {
      const cacheKey = `story:${id}`;
      const cachedStory = await getCache(cacheKey);
      if (cachedStory) return NextResponse.json(cachedStory);

      await dbConnect();
      const story = await StoryModel.findById(id);
      if (!story)
        return NextResponse.json(
          { message: "Story not found" },
          { status: 404 }
        );

      await setCache(cacheKey, story);
      return NextResponse.json(story);
    }

    if (!userId)
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      );
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    const cacheKey = `stories:user:${userId}`;
    const cachedStories = await getCache(cacheKey);
    if (cachedStories) return NextResponse.json(cachedStories);

    await dbConnect();
    const user = await UserModel.findById(userId).populate("stories");
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const stories = await Promise.all(
      (user.stories as unknown as IStory[]).map(async (story) => {
        const permalinks: Record<string, string> = {};

        if (story.postIds?.length) {
          await Promise.all(
            story.postIds.map(async (postId: string) => {
              const permalinkKey = `instagram:permalink:${postId}`;
              const cached = await getCache<string>(permalinkKey);
              if (cached) return (permalinks[postId] = cached);

              try {
                const userWithToken = await UserModel.findById(userId).select(
                  "instagramAccessToken"
                );
                if (!userWithToken?.instagramAccessToken) return;

                const { data } = await axios.get(
                  `https://graph.instagram.com/v18.0/${postId}?fields=permalink&access_token=${userWithToken.instagramAccessToken}`
                );
                if (data?.permalink) {
                  permalinks[postId] = data.permalink;
                  await setCache(permalinkKey, data.permalink, 604800); // 1 week
                }
              } catch (error) {
                console.error(`Permalink error for ${postId}:`, error);
              }
            })
          );
        }

        return {
          ...(story.toObject?.() || story),
          permalinks,
        };
      })
    );

    await setCache(cacheKey, stories);
    return NextResponse.json(stories);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Story ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Special case for toggling isActive status only
    if (body.isActive !== undefined && Object.keys(body).length === 1) {
      const story = await StoryModel.findById(id);

      if (!story) {
        return NextResponse.json(
          { message: "Story not found" },
          { status: 404 }
        );
      }

      const updatedStory = await StoryModel.findByIdAndUpdate(
        id,
        { isActive: body.isActive },
        { new: true }
      );

      return NextResponse.json(updatedStory, { status: 200 });
    }

    // Regular update with validation
    if (
      !body.name ||
      !body.keywords ||
      !body.messageType ||
      (body.messageType === "message" && !body.message)
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate messageType
    if (!["message", "ButtonText", "ButtonImage"].includes(body.messageType)) {
      return NextResponse.json(
        { message: "Invalid message type" },
        { status: 400 }
      );
    }

    // If messageType is ButtonText or ButtonImage, validate buttons
    if (
      (body.messageType === "ButtonText" ||
        body.messageType === "ButtonImage") &&
      (!body.buttons || !Array.isArray(body.buttons))
    ) {
      return NextResponse.json(
        { message: "Buttons are required for button template" },
        { status: 400 }
      );
    }

    // Additional check for isFollowed
    if (body.isFollowed) {
      if (!body.notFollowerMessage || !body.followButtonTitle) {
        return NextResponse.json(
          {
            message:
              "When isFollowed is true, notFollowerMessage and followButtonTitle are required.",
          },
          { status: 400 }
        );
      }
    }

    const story = await StoryModel.findById(id);

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    // Ensure keywords is an array
    const keywords = Array.isArray(body.keywords)
      ? body.keywords
      : body.keywords.split(",").map((k: string) => k.trim());

    // Update the story
    const updatedStory = await StoryModel.findByIdAndUpdate(
      id,
      {
        ...body,
        keywords,
        // Keep the original user and postIds
        user: story.user,
        postIds: story.postIds,
      },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      return NextResponse.json(
        { message: "Failed to update story" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedStory, { status: 200 });
  } catch (error) {
    console.error("Error updating story:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { message: "Story ID required" },
        { status: 400 }
      );

    // Get story and prepare data
    const story = await StoryModel.findById(id);
    if (!story)
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    const { user: userId, postIds = [] } = story;

    // Parallel database operations
    await Promise.all([
      StoryModel.findByIdAndDelete(id),
      UserModel.findByIdAndUpdate(userId, { $pull: { stories: id } }),
    ]);

    // Cache operations
    const cacheTasks = [
      delCache(`story:${id}`),
      removeItemFromCachedCollection(`stories:user:${userId}`, id),
      delCache(`story:totalHits:${userId}`),
    ];

    // Check for unused permalinks
    const [storiesCache, automationsCache] = await Promise.all([
      getCache<IStory[]>(`stories:user:${userId}`),
      getCache<IAutomation[]>(`automations:user:${userId}`),
    ]);

    const usedPosts = new Set<string>();
    [...(storiesCache || []), ...(automationsCache || [])]
      .filter((item) => item._id !== id)
      .forEach((item) =>
        item.postIds?.forEach((pid: string) => usedPosts.add(pid))
      );

    postIds.forEach((pid) => {
      if (!usedPosts.has(pid)) {
        cacheTasks.push(delCache(`instagram:permalink:${pid}`));
      }
    });

    // Execute all cache operations
    await Promise.all(cacheTasks);

    return NextResponse.json({
      message: "Story deleted successfully",
      deletedStory: { _id: id, user: userId, postIds },
    });
  } catch (error) {
    console.error("Story deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
