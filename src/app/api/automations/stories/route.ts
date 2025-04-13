import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import StoryModel from "@/models/Story";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    console.log("Received body:", body);

    const {
      name,
      postIds,
      keywords,
      messageType,
      message,
      imageUrl,
      buttons,
      user,
      isFollowed,
      removeBranding,
    } = body;

    console.log("Message Type:", messageType);
    console.log("Image URL received:", imageUrl);

    // Validation checks
    if (
      !name ||
      !keywords ||
      !messageType ||
      !message ||
      !user ||
      (messageType === "ButtonImage" && !imageUrl) ||
      ((messageType === "ButtonText" || messageType === "ButtonImage") &&
        (!buttons || buttons.length === 0))
    ) {
      console.log("Validation failed. Missing required fields.");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create story object explicitly setting all fields
    const story = new StoryModel({
      name,
      postIds: postIds || [],
      keywords,
      messageType,
      message,
      imageUrl: messageType === "ButtonImage" ? imageUrl : undefined,
      buttons:
        messageType === "ButtonText" || messageType === "ButtonImage"
          ? buttons
          : undefined,
      user,
      isFollowed: isFollowed || false,
      removeBranding: removeBranding || false,
      hitCount: 0,
    });

    console.log("Story to save:", JSON.stringify(story.toObject(), null, 2));

    await story.save();

    // Verify saved data
    const savedStory = await StoryModel.findById(story._id);
    console.log("Saved story:", JSON.stringify(savedStory, null, 2));

    // Update user's stories array
    const updatedUser = await UserModel.findByIdAndUpdate(
      user,
      { $push: { stories: story._id } },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found:", user);
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
    await dbConnect();

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const id = url.searchParams.get("id");
    const getTotalHits = url.searchParams.get("getTotalHits");

    // Handle total hits request
    if (getTotalHits === "true" && userId) {
      const totalHits = await StoryModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$hitCount" } } },
      ]);

      return NextResponse.json(
        {
          totalHits: totalHits.length > 0 ? totalHits[0].total : 0,
        },
        { status: 200 }
      );
    }

    // Get specific story by ID
    if (id) {
      const story = await StoryModel.findById(id);

      if (!story) {
        return NextResponse.json(
          { message: "Story not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(story, { status: 200 });
    }

    // Get all stories for user
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

    const user = await UserModel.findById(userId).populate("stories");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.stories, { status: 200 });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { message: "Failed to fetch stories" },
      { status: 500 }
    );
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

    // Validate required fields
    if (!body.name || !body.keywords || !body.messageType || !body.message) {
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

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Story ID is required" },
        { status: 400 }
      );
    }

    const story = await StoryModel.findById(id);
    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    // Remove story reference from user
    await UserModel.findByIdAndUpdate(story.user, {
      $pull: { stories: id },
    });

    await story.deleteOne();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
