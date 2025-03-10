import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutomationModel from "@/models/Automation";
import axios from "axios";

// Define types for Instagram webhook data
interface InstagramComment {
  id: string;
  from: {
    id: string;
    username: string;
  };
  media: {
    id: string;
    media_product_type: string;
  };
  text: string;
  parent_id?: string;
}

interface InstagramChange {
  field: string;
  value: InstagramComment;
}

interface InstagramEntry {
  id: string;
  time: number;
  changes: InstagramChange[];
}

interface WebhookPayload {
  object: string;
  entry: InstagramEntry[];
}

export async function GET(request: NextRequest) {
  // Handle Instagram webhook verification
  const searchParams = request.nextUrl.searchParams;
  //const hub_mode = searchParams.get("hub.mode");
  const hub_challenge = searchParams.get("hub.challenge");
  const hub_verify_token = searchParams.get("hub.verify_token");

  // Verify token (should match your configured webhook verify token)
  const VERIFY_TOKEN = "12345";

  if (hub_challenge && hub_verify_token === VERIFY_TOKEN) {
    return new NextResponse(hub_challenge);
  }

  return new NextResponse("<p>This is GET Request, Hello Webhook!</p>");
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 4));

    await dbConnect();

    // Check if this is a comment notification from Instagram
    if (
      payload.object === "instagram" &&
      payload.entry &&
      payload.entry.length > 0
    ) {
      for (const entry of payload.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            // Check if this is a comment change
            if (change.field === "comments" && change.value) {
              await handleCommentNotification(change.value);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Failed to process webhook", error: error.message },
      { status: 500 }
    );
  }
}

async function handleCommentNotification(comment: InstagramComment) {
  try {
    const automations = await AutomationModel.find({
      postIds: comment.media.id,
    }).populate("user");

    if (!automations || automations.length === 0) {
      console.log(`No automations found for post ID: ${comment.media.id}`);
      return;
    }

    for (const automation of automations) {
      if (!automation.keywords || automation.keywords.length === 0) continue;

      // Check if comment text contains any of the keywords (case insensitive)
      const commentText = comment.text.toLowerCase();
      const keywordMatch = automation.keywords.some((keyword) =>
        commentText.includes(keyword.toLowerCase())
      );

      // If keywords match or no keywords specified, send DM
      if (keywordMatch) {
        await sendInstagramDM(
          comment.from.id,
          automation.message,
          comment.from.username
        );

        // Log this interaction (optional)
        console.log(
          `Sent DM to ${comment.from.username} for automation: ${automation.name}`
        );
      }
    }
  } catch (error) {
    console.error("Error handling comment notification:", error);
  }
}

async function sendInstagramDM(
  userId: string,
  message: string,
  username: string
) {
  try {
    const INSTAGRAM_LONG_LIVED_TOKEN =
      "IGAAlRTybzBRdBZAE1HMm1RUGdBU2ZAWc25nZAG52SFotS2NNejhSaG9aaVB4QTctWFRrdlhCU1RwRHY0VnVSZAnp2eDZAIdmZAac2psWHhuTFZApZA2oxSlg5ZAUNnZA2U1TTNBN2NjNHBIbklBdjhUTlVxRXA1dnJn";
    const url = `https://graph.instagram.com/v22.0/me/messages`;

    const headers = {
      Authorization: `Bearer ${INSTAGRAM_LONG_LIVED_TOKEN}`,
      "Content-Type": "application/json",
    };

    const body = {
      recipient: {
        id: userId,
      },
      message: {
        text: message,
      },
    };

    const response = await axios.post(url, body, { headers });
    console.log(`DM sent to ${username} (${userId}):`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending Instagram DM:", error);
    throw error;
  }
}
