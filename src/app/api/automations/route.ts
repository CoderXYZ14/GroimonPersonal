import { NextResponse } from "next/server";
import AutomationModel from "@/models/Automation";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log("Request Body:", body);

    const { name, postIds, keywords, message, user } = body;

    if (!name || !keywords || !message || !user) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const automation = new AutomationModel({
      name,
      postIds,
      keywords,
      message,
      user,
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
