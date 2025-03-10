import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutomationModel from "@/models/Automation";
import axios from "axios";

// Instagram comment webhook data type
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hub_challenge = searchParams.get("hub.challenge");
  const hub_verify_token = searchParams.get("hub.verify_token");

  // Hardcoded verification token
  const VERIFY_TOKEN = "12345";

  if (hub_challenge && hub_verify_token === VERIFY_TOKEN) {
    return new NextResponse(hub_challenge);
  }

  return new NextResponse("<p>This is GET Request, Hello Webhook!</p>");
}

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const payload = await request.json();
    console.log("Webhook payload received:", JSON.stringify(payload, null, 2));

    // Connect to database
    await dbConnect();

    // Extract comment data from the webhook
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
              // Process the comment and check if we need to send a DM
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

    // Find automations that match this post ID
    const automations = await AutomationModel.find({
      postIds: comment.media.id,
    });

    if (!automations || automations.length === 0) {
      console.log(`No automations found for post ID: ${comment.media.id}`);
      return;
    }

    console.log(`Found ${automations.length} automations for this post`);

    // Check each automation for keyword matches
    for (const automation of automations) {
      // Skip if no keywords are defined
      if (!automation.keywords || automation.keywords.length === 0) {
        console.log(`Automation ${automation.name} has no keywords, skipping`);
        continue;
      }

      // Check if comment text contains any of the keywords (case insensitive)
      const commentText = comment.text.toLowerCase();
      const matchedKeyword = automation.keywords.find((keyword) =>
        commentText.includes(keyword.toLowerCase())
      );

      if (matchedKeyword) {
        console.log(
          `Keyword match found: "${matchedKeyword}" in automation "${automation.name}"`
        );

        // Send the DM with the message from the automation
        await sendDM(comment, automation.message, automation.name);
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

async function sendDM(
  comment: InstagramComment,
  message: string,
  automationName: string
) {
  try {
    // Hardcoded token as requested
    const INSTAGRAM_TOKEN =
      "IGAAlRTybzBRdBZAE1HMm1RUGdBU2ZAWc25nZAG52SFotS2NNejhSaG9aaVB4QTctWFRrdlhCU1RwRHY0VnVSZAnp2eDZAIdmZAac2psWHhuTFZApZA2oxSlg5ZAUNnZA2U1TTNBN2NjNHBIbklBdjhUTlVxRXA1dnJn";

    const url = "https://graph.instagram.com/v22.0/me/messages";

    const headers = {
      Authorization: `Bearer ${INSTAGRAM_TOKEN}`,
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
      `DM sent successfully to ${comment.from.username} with message: "${message}"`,
      response.data
    );

    return response.data;
  } catch (error) {
    console.error("Error sending Instagram DM:", error);
    console.error(
      "Error details:",
      error.response ? error.response.data : "No response data"
    );
  }
}
