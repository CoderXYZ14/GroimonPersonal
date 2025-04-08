import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/dbConnect";
import AutomationModel, { IAutomation, Button } from "@/models/Automation";
import { IUser } from "@/models/User";
import { replyToComment, sendDM } from "../webhook/route";

interface IAutomationWithUser {
  user: IUser & {
    instagramAccessToken?: string;
    instagramId?: string;
  };
  messageType?: "message" | "buttonImage";
  buttons?: Button[];
  removeBranding: boolean;
  _id: { toString: () => string };
}

interface Comment {
  id: string;
  text: string;
  media_id?: string;
}

async function fetchAllComments(
  mediaId: string,
  accessToken: string
): Promise<Comment[]> {
  try {
    // Add fields parameter to get text, timestamp, and id
    const url = `https://graph.instagram.com/v22.0/${mediaId}/comments?fields=text,timestamp,id&access_token=${accessToken}`;
    const response = await axios.get(url);

    if (!response.data.data) {
      console.log("No comments found or invalid response:", response.data);
      return [];
    }

    // Validate each comment has required fields
    const validComments = response.data.data.filter((comment) => {
      if (!comment.text || !comment.id) {
        console.log("Invalid comment structure:", comment);
        return false;
      }
      return true;
    });

    return validComments;
  } catch (error) {
    console.error(`Error fetching comments for media ${mediaId}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Process Backtrack route is running");
    const payload = await request.json();
    const {
      mediaIds,
      accessToken,
      automationId,
      automationName,
      keywords,
      commentMessage,
      message,
    } = payload;

    let processedCount = 0;

    for (const mediaId of mediaIds) {
      console.log(`Fetching comments for media ${mediaId}`);
      const comments = await fetchAllComments(mediaId, accessToken);
      console.log(`Found ${comments.length} comments for media ${mediaId}`);

      for (const comment of comments) {
        try {
          if (!comment || typeof comment.text !== "string") {
            console.log("Invalid comment structure:", comment);
            continue;
          }

          const commentText = comment.text.toLowerCase();
          console.log(`Processing comment: "${commentText}"`);

          // Check if any keywords match
          const matchingKeywords = keywords.filter((keyword) =>
            commentText.includes(keyword.toLowerCase())
          );

          if (matchingKeywords.length > 0) {
            console.log(`Found matching keyword: ${matchingKeywords[0]}`);
            console.log(
              `Processing automation: ${automationName} (${automationId})`
            ); // Debug log

            // Reply to the comment if comment automation is enabled
            if (commentMessage) {
              // Create a mock InstagramComment with required fields
              const instagramComment: any = {
                id: comment.id,
                text: comment.text,
                media: { id: mediaId },
                from: {
                  id: "placeholder",
                  username: "placeholder",
                },
              };

              await replyToComment(
                instagramComment,
                commentMessage,
                accessToken
              );
            }

            // Send DM if message is provided
            if (message) {
              try {
                // Create a mock InstagramComment object with the data we have
                const instagramComment: any = {
                  id: comment.id,
                  text: comment.text,
                  media: { id: mediaId },
                  from: {
                    id: "placeholder", // Not needed for backtrack since we use comment_id
                    username: "placeholder",
                  },
                };

                // Make sure we have a valid automationId
                if (!automationId) {
                  console.error("Missing automationId for DM");
                  continue;
                }

                // Use the updated sendDM function with isBacktrack=true
                await sendDM(
                  instagramComment,
                  message,
                  automationName || "Backtrack Automation", // Provide default name if missing
                  automationId.toString(), // Ensure it's a string
                  true // This indicates it's a backtrack request
                );

                console.log(`Sent DM for comment ${comment.id}`);
                processedCount++;
              } catch (error) {
                console.error(
                  `Error sending DM for comment ${comment.id}:`,
                  error.response?.data?.error || error
                );
              }
            }
          }
        } catch (error) {
          console.error(`Error processing comment ${comment.id}:`, error);
          continue;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} comments across ${mediaIds.length} posts`,
    });
  } catch (error) {
    console.error("Error processing backtrack:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process backtrack",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
