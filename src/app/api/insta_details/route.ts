// app/api/automations/route.ts
import { NextResponse } from "next/server";
import IAutomationModel from "@/models/IAutomation";
import dbConnect from "@/lib/dbConnect";

await dbConnect();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, postIds, keywords, message, user } = body;

    if (!name || !keywords || !message || !user) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const automation = new IAutomationModel({
      name,
      postIds,
      keywords,
      message,
      user,
    });

    await automation.save();

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json(
      { message: "Failed to create automation" },
      { status: 500 }
    );
  }
}
