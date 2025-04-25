import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import AutomationModel from "@/models/Automation";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import StoryModel from "@/models/Story";

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
      buttons,
      user,
      enableCommentAutomation,
      commentMessage,
      autoReplyLimit,
      isFollowed,
      notFollowerMessage,
      followButtonTitle,
      followUpMessage,
      removeBranding,
      autoReplyLimitLeft,
      respondToAll,
    } = body;

    // Validation checks
    if (
      !name ||
      (!respondToAll && (!keywords || keywords.length === 0)) ||
      !messageType ||
      !message ||
      !user ||
      (enableCommentAutomation && !commentMessage) ||
      (enableCommentAutomation && autoReplyLimit === undefined) ||
      (enableCommentAutomation && autoReplyLimitLeft === undefined) ||
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
    // Additional check for isFollowed
    if (isFollowed) {
      if (!notFollowerMessage || !followButtonTitle || !followUpMessage) {
        return NextResponse.json(
          {
            message:
              "When isFollowed is true, notFollowerMessage, followButtonTitle, and followUpMessage are required.",
          },
          { status: 400 }
        );
      }
    }

    // Log the respondToAll value from the request
    console.log("Request respondToAll value:", respondToAll);

    // Create automation object explicitly setting all fields
    const automation = new AutomationModel({
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
      enableCommentAutomation,
      commentMessage,
      autoReplyLimit: autoReplyLimit || 100,
      autoReplyLimitLeft: autoReplyLimit || 100,
      isFollowed: isFollowed || false,
      notFollowerMessage: isFollowed ? notFollowerMessage : undefined,
      followButtonTitle: isFollowed ? followButtonTitle : undefined,
      followUpMessage: isFollowed ? followUpMessage : undefined,
      removeBranding: removeBranding || false,
      respondToAll: respondToAll === true, // Explicitly convert to boolean
      isActive: true,
      hitCount: 0,
    });

    // Log before saving to see if all fields are present
    console.log("Before saving, automation object:", {
      ...automation.toObject(),
      isActive: automation.isActive,
      respondToAll: automation.respondToAll, // Explicitly log respondToAll
    });

    await automation.save();

    // Retrieve the saved automation to verify all fields were saved
    const savedAutomation = await AutomationModel.findById(automation._id);
    console.log(
      "After saving, retrieved automation:",
      JSON.stringify(savedAutomation?.toObject(), null, 2)
    );

    const updatedUser = await UserModel.findByIdAndUpdate(
      user,
      { $push: { automations: automation._id } },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found:", user);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json(
      { message: "Failed to create automation", error: error.message },
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
    const redirectCount = url.searchParams.get("redirectCount");

    if (getTotalHits === "true" && userId) {
      const totalHitsPost = await AutomationModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$hitCount" } } },
      ]);

      const totalHitsStory = await StoryModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$hitCount" } } },
      ]);

      const totalHits =
        (totalHitsPost.length > 0 ? totalHitsPost[0].total : 0) +
        (totalHitsStory.length > 0 ? totalHitsStory[0].total : 0);
      return NextResponse.json(
        {
          totalHits,
        },
        { status: 200 }
      );
    }

    if (redirectCount === "true" && userId) {
      const redirectHitsPost = await AutomationModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$redirectCount" } } },
      ]);

      const redirectHitsStory = await StoryModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$redirectCount" } } },
      ]);

      const totalRedirectHits =
        (redirectHitsPost.length > 0 ? redirectHitsPost[0].total : 0) +
        (redirectHitsStory.length > 0 ? redirectHitsStory[0].total : 0);

      //total dm count
      const totalHitsPost = await AutomationModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$hitCount" } } },
      ]);

      const totalHitsStory = await StoryModel.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$hitCount" } } },
      ]);

      const totalHits =
        (totalHitsPost.length > 0 ? totalHitsPost[0].total : 0) +
        (totalHitsStory.length > 0 ? totalHitsStory[0].total : 0);
      return NextResponse.json(
        {
          totalRedirectHits,
          totalHits,
        },
        { status: 200 }
      );
    }
    if (id) {
      const automation = await AutomationModel.findById(id);

      if (!automation) {
        return NextResponse.json(
          { message: "Automation not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(automation, { status: 200 });
    }

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

    const user = await UserModel.findById(userId).populate("automations");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.automations, { status: 200 });
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json(
      { message: "Failed to fetch automations" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const cookieStore = await cookies();
    const userDetails = cookieStore.get("user_details");

    if (!id) {
      return NextResponse.json(
        { message: "Automation ID is required" },
        { status: 400 }
      );
    }

    const user = JSON.parse(userDetails.value);
    const body = await request.json();

    // Special case for toggling isActive status only
    if (body.isActive !== undefined && Object.keys(body).length === 1) {
      const automation = await AutomationModel.findById(id);

      if (!automation) {
        return NextResponse.json(
          { message: "Automation not found" },
          { status: 404 }
        );
      }

      const updatedAutomation = await AutomationModel.findByIdAndUpdate(
        id,
        { isActive: body.isActive },
        { new: true }
      );

      return NextResponse.json(updatedAutomation, { status: 200 });
    }

    // Regular update with validation
    if (!body.name || !body.keywords || !body.messageType || !body.message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["message", "ButtonText", "ButtonImage"].includes(body.messageType)) {
      return NextResponse.json(
        { message: "Invalid message type" },
        { status: 400 }
      );
    }

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
      if (
        !body.notFollowerMessage ||
        !body.followButtonTitle ||
        !body.followUpMessage
      ) {
        return NextResponse.json(
          {
            message:
              "When isFollowed is true, notFollowerMessage, followButtonTitle, and followUpMessage are required.",
          },
          { status: 400 }
        );
      }
    }

    const automation = await AutomationModel.findById(id);

    if (!automation) {
      return NextResponse.json(
        { message: "Automation not found" },
        { status: 404 }
      );
    }

    const keywords = Array.isArray(body.keywords)
      ? body.keywords
      : body.keywords.split(",").map((k: string) => k.trim());

    // Log the body to see what's being sent in the update
    console.log("Update request body:", body);
    console.log("respondToAll value in update:", body.respondToAll);

    // Create update object with explicit handling of respondToAll
    const updateData = {
      ...body,
      keywords,
      user: user.id,
      postIds: automation.postIds,
      // Explicitly set respondToAll as a boolean
      respondToAll: body.respondToAll === true,
    };

    console.log("Update data being sent to MongoDB:", updateData);

    const updatedAutomation = await AutomationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log the updated automation to verify respondToAll was saved
    console.log("Updated automation:", updatedAutomation);

    if (!updatedAutomation) {
      return NextResponse.json(
        { message: "Failed to update automation" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAutomation, { status: 200 });
  } catch (error) {
    console.error("Error updating automation:", error);
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
        { message: "Automation ID is required" },
        { status: 400 }
      );
    }

    const automation = await AutomationModel.findById(id);
    if (!automation) {
      return NextResponse.json(
        { message: "Automation not found" },
        { status: 404 }
      );
    }

    await UserModel.findByIdAndUpdate(automation.user, {
      $pull: { automations: id },
    });

    await automation.deleteOne();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting automation:", error);
    return NextResponse.json(
      { error: "Failed to delete automation" },
      { status: 500 }
    );
  }
}
