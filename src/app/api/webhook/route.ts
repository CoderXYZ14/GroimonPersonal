import { NextRequest, NextResponse } from "next/server";
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
              // Send DM to commenter
              await sendDM(change.value);
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

async function sendDM(comment: InstagramComment) {
  try {
    // Hardcoded token as requested
    const INSTAGRAM_TOKEN =
      "IGAAlRTybzBRdBZAE1HMm1RUGdBU2ZAWc25nZAG52SFotS2NNejhSaG9aaVB4QTctWFRrdlhCU1RwRHY0VnVSZAnp2eDZAIdmZAac2psWHhuTFZApZA2oxSlg5ZAUNnZA2U1TTNBN2NjNHBIbklBdjhUTlVxRXA1dnJn";

    const url = "https://graph.instagram.com/v22.0/me/messages";

    const headers = {
      Authorization: `Bearer ${INSTAGRAM_TOKEN}`,
      "Content-Type": "application/json",
    };

    // Simple message to send
    const message = "Good morning! Thanks for your comment.";

    const body = {
      recipient: {
        id: comment.from.id,
      },
      message: {
        text: message,
      },
    };

    console.log(
      `Attempting to send DM to user ${comment.from.username} (${comment.from.id})`
    );
    const response = await axios.post(url, body, { headers });

    console.log(
      `DM sent successfully to ${comment.from.username}:`,
      response.data
    );

    // Log details for debugging
    console.log(`Comment was on post ID: ${comment.media.id}`);
    console.log(`Comment text was: "${comment.text}"`);

    return response.data;
  } catch (error) {
    console.error("Error sending Instagram DM:", error);
    console.error(
      "Error details:",
      error.response ? error.response.data : "No response data"
    );
  }
}
