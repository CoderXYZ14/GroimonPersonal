import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import AutomationModel, { IAutomation } from "@/models/Automation";
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
      enableCommentAutomation,
      commentMessage,
      autoReplyLimit,
      isFollowed,
      notFollowerMessage,
      followButtonTitle,
      removeBranding,
      autoReplyLimitLeft,
      respondToAll,
    } = body;
    let { followUpMessage, followUpButtonTitle } = body;

    if (
      !name ||
      (!respondToAll && (!keywords || keywords.length === 0)) ||
      !messageType ||
      (messageType === "message" && !message) ||
      !user ||
      (enableCommentAutomation &&
        (!commentMessage || commentMessage.length === 0)) ||
      (enableCommentAutomation && autoReplyLimit === undefined) ||
      (enableCommentAutomation && autoReplyLimitLeft === undefined) ||
      (messageType === "ButtonImage" && !imageUrl) ||
      ((messageType === "ButtonText" || messageType === "ButtonImage") &&
        (!buttons || buttons.length === 0)) ||
      ((messageType === "ButtonText" || messageType === "ButtonImage") &&
        !buttonTitle)
    ) {
      console.log("Validation failed. Missing required fields.");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
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
      }

      if (!followUpButtonTitle) {
        followUpButtonTitle = followButtonTitle;
      }
    }

    // Log the respondToAll value from the request
    console.log("Request respondToAll value:", respondToAll);
    console.log("Request buttons value:", buttons);
    console.log("Request buttonTitle value:", buttonTitle);

    // Create automation object explicitly setting all fields
    const automation = new AutomationModel({
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
      // Pass buttons without title field
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
      followUpButtonTitle: isFollowed ? followUpButtonTitle : undefined,
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

    // Cache the new automation
    await setCache(`automation:${automation._id}`, automation);
    // Invalidate user automations cache
    await delCache(`automations:user:${user}`);

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if ("errors" in error) {
        console.error(
          "Validation errors:",
          JSON.stringify(error.errors, null, 2)
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to create automation",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    if (id) {
      const cacheKey = `automation:${id}`;
      const cached = await getCache(cacheKey);
      if (cached) return NextResponse.json(cached);

      await dbConnect();
      const automation = await AutomationModel.findById(id);
      if (!automation)
        return NextResponse.json(
          { message: "Automation not found" },
          { status: 404 }
        );

      await setCache(cacheKey, automation);
      return NextResponse.json(automation);
    }

    if (!userId)
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    const cacheKey = `automations:user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    await dbConnect();
    const user = await UserModel.findById(userId).populate("automations");
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const automations = await Promise.all(
      (user.automations as unknown as IAutomation[]).map(async (automation) => {
        const permalinks: Record<string, string> = {};

        if (automation.postIds?.length) {
          await Promise.all(
            automation.postIds.map(async (postId: string) => {
              const cacheKey = `instagram:permalink:${postId}`;
              const cached = await getCache<string>(cacheKey);
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
                  await setCache(cacheKey, data.permalink, 604800);
                }
              } catch (error) {
                console.error(`Error fetching permalink for ${postId}:`, error);
              }
            })
          );
        }

        return {
          ...(automation.toObject?.() || automation),
          permalinks,
        };
      })
    );

    await setCache(cacheKey, automations);
    return NextResponse.json(automations);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
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
    // Also ensure all buttons have the same title if messageType is ButtonText or ButtonImage
    const updateData = {
      ...body,
      keywords,
      user: user.id,
      // Use postIds from the request if provided, otherwise keep the original
      postIds: body.postIds || automation.postIds,
      // Explicitly set respondToAll as a boolean
      respondToAll: body.respondToAll === true,
      // Set the same title for all buttons if messageType is ButtonText or ButtonImage
      // Pass buttons without title field
      buttons:
        (body.messageType === "ButtonText" ||
          body.messageType === "ButtonImage") &&
        body.buttons
          ? body.buttons
          : body.buttons,
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json(
        { message: "Automation ID required" },
        { status: 400 }
      );

    const automation = await AutomationModel.findById(id);
    if (!automation)
      return NextResponse.json(
        { message: "Automation not found" },
        { status: 404 }
      );

    const { user: userId, postIds = [] } = automation;

    // Database operations
    await Promise.all([
      AutomationModel.findByIdAndDelete(id),
      UserModel.findByIdAndUpdate(userId, { $pull: { automations: id } }),
    ]);

    // Cache operations
    const cacheOps = [
      delCache(`automation:${id}`),
      removeItemFromCachedCollection(`automations:user:${userId}`, id),
    ];

    // Check if we need to clean up permalink cache
    const cachedAutomations = await getCache<IAutomation[]>(
      `automations:user:${userId}`
    );
    if (cachedAutomations) {
      const postsInUse = new Set<string>();
      cachedAutomations
        .filter((auto) => auto._id !== id)
        .forEach((auto) =>
          auto.postIds?.forEach((postId: string) => postsInUse.add(postId))
        );

      postIds.forEach((postId) => {
        if (!postsInUse.has(postId)) {
          cacheOps.push(delCache(`instagram:permalink:${postId}`));
        }
      });
    }

    await Promise.all(cacheOps);

    return NextResponse.json({
      message: "Automation deleted",
      deletedAutomation: { _id: id, user: userId, postIds },
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
// ... (rest of the code remains the same)
