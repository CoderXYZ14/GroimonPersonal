import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import AutomationModel from "@/models/Automation";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

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
      buttons,
      user,
      enableCommentAutomation,
      commentMessage,
      isFollowed,
      removeBranding,
    } = body;

    if (
      !name ||
      !keywords ||
      !messageType ||
      !message ||
      !user ||
      !enableCommentAutomation ||
      !commentMessage ||
      (messageType === "buttonImage" && (!buttons || buttons.length === 0))
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const automation = new AutomationModel({
      name,
      postIds,
      keywords,
      messageType,
      message,
      buttons,
      user,
      enableCommentAutomation,
      commentMessage,
      isFollowed,
      removeBranding,
    });

    await automation.save();

    const updatedUser = await UserModel.findByIdAndUpdate(
      user,
      { $push: { automations: automation._id } },
      { new: true }
    );

    if (!updatedUser) {
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
    const cookieStore = await cookies();
    const userDetails = cookieStore.get("user_details");

    if (id) {
      // if (!userDetails?.value) {
      //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      // }

      const user = JSON.parse(userDetails.value);
      const automation = await AutomationModel.findById(id);

      if (!automation) {
        return NextResponse.json(
          { message: "Automation not found" },
          { status: 404 }
        );
      }

      // if (automation.user.toString() !== user.id) {
      //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      // }

      return NextResponse.json(automation, { status: 200 });
    }

    // Otherwise, fetch all automations for user
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

    // Validate required fields
    if (!body.name || !body.keywords || !body.messageType || !body.message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate messageType
    if (!["message", "buttonImage"].includes(body.messageType)) {
      return NextResponse.json(
        { message: "Invalid message type" },
        { status: 400 }
      );
    }

    // If messageType is buttonImage, validate buttons
    if (
      body.messageType === "buttonImage" &&
      (!body.buttons || !Array.isArray(body.buttons))
    ) {
      return NextResponse.json(
        { message: "Buttons are required for button template" },
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

    // Ensure keywords is an array
    const keywords = Array.isArray(body.keywords)
      ? body.keywords
      : body.keywords.split(",").map((k: string) => k.trim());

    // Update the automation
    const updatedAutomation = await AutomationModel.findByIdAndUpdate(
      id,
      {
        ...body,
        keywords,
        user: user.id,
        // Keep the original postIds
        postIds: automation.postIds,
      },
      { new: true, runValidators: true }
    );

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
