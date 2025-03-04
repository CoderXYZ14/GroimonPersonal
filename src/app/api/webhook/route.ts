import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

// Configuration
const VERIFY_TOKEN = "12345";
const ACCESS_TOKEN =
  "IGAAOWGBt3ZCl1BZAE5tYTlHV2U1VEhsZADBHQVpSdlZAEVW4zMnVRSndhamE2MnZAZAajE3NTFZAS3d1cGdJaEVMRE53WjZAnVUV4Y1lNUU1qTUE2TmRQeUN3ZAVpRcmJIOV9uVnBlcWJqdk9kUm51WjJLaEloVGtR";
const IG_PRO_USER_ID = "1009455214362205";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hubChallenge = searchParams.get("hub.challenge");
  const hubVerifyToken = searchParams.get("hub.verify_token");

  if (hubVerifyToken === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(hubChallenge as string);
  } else {
    console.log("Verification failed");
    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Webhook received:", JSON.stringify(data, null, 4));

    if (
      data.entry &&
      data.entry[0]?.changes &&
      data.entry[0].changes[0]?.field === "comments"
    ) {
      const commentInfo = data.entry[0].changes[0].value;
      const commenterId = commentInfo.from.id;
      const commentId = commentInfo.id;

      console.log(`Comment from user ID: ${commenterId}`);

      // Fetch user data
      const url = `https://graph.instagram.com/v21.0/${commenterId}`;
      const params = {
        fields:
          "name,profile_pic,username,follower_count,is_business,follows_user,is_user_follow_business,is_verified_user",
        access_token: ACCESS_TOKEN,
      };

      try {
        const response = await axios.get(url, { params });
        const userData = response.data;
        console.log("User Data:", JSON.stringify(userData, null, 4));

        // Send a private reply
        const replyUrl = `https://graph.instagram.com/${IG_PRO_USER_ID}/messages`;
        const replyData = {
          recipient: {
            comment_id: commentId,
          },
          message: {
            text: "Thank you for your comment! We will get back to you soon.",
          },
        };

        const replyResponse = await axios.post(replyUrl, replyData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        });

        console.log(
          "Private Reply Response:",
          JSON.stringify(replyResponse.data, null, 4)
        );
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("Axios Error Details:", {
            message: error.message,
            response: error.response?.data || null,
            stack: error.stack,
          });
        } else {
          console.error("Unexpected Error:", error);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
