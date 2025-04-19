import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutomationModel from "@/models/Automation";
import StoryModel from "@/models/Story";

export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json();

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required parameters: type and id" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Increment redirect count based on type
    if (type === "automation") {
      const automation = await AutomationModel.findById(id);
      if (!automation) {
        return NextResponse.json(
          { error: `Automation with ID ${id} not found` },
          { status: 404 }
        );
      }

      // Increment redirectCount
      automation.redirectCount = (automation.redirectCount || 0) + 1;
      await automation.save();

      return NextResponse.json({
        success: true,
        message: `Redirect count incremented for automation ${id}`,
        currentCount: automation.redirectCount,
      });
    } else if (type === "story") {
      const story = await StoryModel.findById(id);
      if (!story) {
        return NextResponse.json(
          { error: `Story with ID ${id} not found` },
          { status: 404 }
        );
      }

      // Increment redirectCount
      story.redirectCount = (story.redirectCount || 0) + 1;
      await story.save();

      return NextResponse.json({
        success: true,
        message: `Redirect count incremented for story ${id}`,
        currentCount: story.redirectCount,
      });
    } else {
      return NextResponse.json(
        { error: `Invalid type: ${type}. Must be 'automation' or 'story'` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error incrementing redirect count:", error);
    return NextResponse.json(
      { error: "Failed to increment redirect count", details: String(error) },
      { status: 500 }
    );
  }
}
