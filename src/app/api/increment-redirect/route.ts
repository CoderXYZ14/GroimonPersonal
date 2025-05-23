import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutomationModel from "@/models/Automation";
import StoryModel from "@/models/Story";

export async function POST(request: Request) {
  try {
    const { type, id } = await request.json();
    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing type or id" },
        { status: 400 }
      );
    }

    await dbConnect();

    let model;
    if (type === "automation") model = AutomationModel;
    else if (type === "story") model = StoryModel;
    else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const doc = await model.findById(id);
    if (!doc) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });
    }

    doc.redirectCount = (doc.redirectCount || 0) + 1;
    await doc.save();

    return NextResponse.json({
      success: true,
      currentCount: doc.redirectCount,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
