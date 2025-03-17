import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutomationModel from "@/models/Automation";

import axios from "axios";
import { IUser } from "@/models/User";
import "../../../models/User";

interface InstagramComment {
  id: string;
  from: {
    id: string;
    username: string;
  };
  media: {
    id: string;
  };
  text: string;
}

interface IAutomation {
  _id: { toString: () => string };
  name: string;
  keywords: string[];
  message: string;
  postIds: string[];
  user: IUser;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hub_challenge = searchParams.get("hub.challenge");
  const hub_verify_token = searchParams.get("hub.verify_token");

  const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (hub_challenge && hub_verify_token === VERIFY_TOKEN) {
    return new NextResponse(hub_challenge);
  }

  return new NextResponse("<p>This is GET Request, Hello Webhook!</p>");
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("Webhook payload received:", JSON.stringify(payload, null, 2));

    await dbConnect();

    if (
      payload.object === "instagram" &&
      payload.entry &&
      payload.entry.length > 0
    ) {
      for (const entry of payload.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            if (change.field === "comments" && change.value) {
              await processComment(change.value);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Failed to process webhook", error: String(error) },
      { status: 500 }
    );
  }
}

async function processComment(comment: InstagramComment) {
  try {
    console.log(`Processing comment on post ID: ${comment.media.id}`);
    console.log(`Comment from user: ${comment.from.username}`);
    console.log(`Comment text: "${comment.text}"`);

    const automations = await AutomationModel.find({
      postIds: comment.media.id,
    }).populate("user");

    if (!automations || automations.length === 0) {
      console.log(`No automations found for post ID: ${comment.media.id}`);
      return;
    }

    console.log(`Found ${automations.length} automations for this post`);

    for (const automation of automations) {
      if (
        typeof automation.user === "object" &&
        "instagramId" in automation.user
      ) {
        if (automation.user.instagramId === comment.from.id) {
          console.log(`Skipping automation as comment is from the post owner`);
          continue;
        }
      }

      if (!automation.keywords || automation.keywords.length === 0) {
        console.log(`Automation ${automation.name} has no keywords, skipping`);
        continue;
      }

      const commentText = comment.text.toLowerCase();
      const matchedKeyword = automation.keywords.find((keyword) =>
        commentText.includes(keyword.toLowerCase())
      );

      if (matchedKeyword) {
        console.log(
          `Keyword match found: "${matchedKeyword}" in automation "${automation.name}"`
        );

        await handleAutomationResponse(
          comment,
          automation as IAutomation,
          automation.name,
          automation._id.toString()
        );
      } else {
        console.log(
          `No keyword matches found for automation "${automation.name}"`
        );
      }
    }
  } catch (error) {
    console.error("Error processing comment:", error);
  }
}

async function handleAutomationResponse(
  comment: InstagramComment,
  automation: IAutomation,
  automationName: string,
  automationId: string
) {
  try {
    const user = automation.user as IUser;

    if (!user.instagramAccessToken) {
      console.error(`Instagram access token not found for user ${user.name}`);
      return;
    }

    await sendDM(comment, automation.message, automationName, automationId);
  } catch (error) {
    console.error("Error handling automation response:", error);
    throw error;
  }
}

async function sendDM(
  comment: InstagramComment,
  message: string,
  automationName: string,
  automationId: string
) {
  try {
    await dbConnect();

    const automation = await AutomationModel.findById(automationId).populate(
      "user"
    );

    if (!automation) {
      console.error(`Automation with ID ${automationId} not found`);
      return;
    }

    if (!automation.user) {
      console.error(
        `User not found for automation ${automationName} (${automationId})`
      );
      return;
    }

    const user = automation.user as IUser;

    if (!user.instagramAccessToken) {
      console.error(
        `Instagram access token not found for user ${user.name} (${user._id})`
      );
      return;
    }

    const url = "https://graph.instagram.com/v22.0/me/messages";

    const headers = {
      Authorization: `Bearer ${user.instagramAccessToken}`,
      "Content-Type": "application/json",
    };

    const body = {
      recipient: {
        id: comment.from.id,
      },
      message: {
        text: message,
      },
    };

    console.log(
      `Attempting to send DM to user ${comment.from.username} (${comment.from.id}) for automation "${automationName}"`
    );

    const response = await axios.post(url, body, { headers });

    console.log(
      `DM sent successfully to ${comment.from.username} with message: "${message}"`
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Error sending Instagram DM:");

    if (error.response) {
      console.error("Error response:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }

    throw error;
  }
}
