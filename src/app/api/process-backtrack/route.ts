import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { processComment } from "../webhook/route";

interface InstagramComment {
  id: string;
  text: string;
  media: {
    id: string;
    media_product_type?: string;
  };
  from: {
    id: string;
    username: string;
  };
}

async function fetchAllComments(
  mediaId: string,
  accessToken: string
): Promise<InstagramComment[]> {
  try {
    // First get the comment IDs
    const url = `https://graph.instagram.com/v22.0/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${accessToken}`;
    const response = await axios.get(url);

    if (!response.data.data) {
      console.log("No comments found or invalid response:", response.data);
      return [];
    }

    // For each comment, get detailed info
    const commentPromises = response.data.data.map(async (comment: any) => {
      try {
        // Get detailed comment info including user data
        const commentUrl = `https://graph.instagram.com/v22.0/${comment.id}?fields=id,text,username,timestamp,from&access_token=${accessToken}`;
        const commentResponse = await axios.get(commentUrl);
        const commentData = commentResponse.data;

        return {
          id: commentData.id,
          text: commentData.text,
          media: {
            id: mediaId,
            media_product_type: "FEED",
          },
          from: {
            id: commentData.from?.id || comment.id,
            username: commentData.username || commentData.from?.username,
          },
        };
      } catch (error) {
        console.error(`Error fetching details for comment ${comment.id}:`, error);
        return null;
      }
    });

    const comments = await Promise.all(commentPromises);
    return comments.filter((comment): comment is InstagramComment => comment !== null);
  } catch (error) {
    console.error(`Error fetching comments for media ${mediaId}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Process Backtrack route is running");
    const payload = await request.json();
    console.log("Received payload:", payload);
    const { mediaId, mediaIds, accessToken } = payload;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing access token",
        },
        { status: 400 }
      );
    }

    // Support both single mediaId and array of mediaIds
    const mediaIdsToProcess = mediaIds || (mediaId ? [mediaId] : []);
    console.log("Processing media IDs:", mediaIdsToProcess);

    let processedCount = 0;

    for (const mediaId of mediaIdsToProcess) {
      console.log(`Fetching comments for media ${mediaId}`);
      const comments = await fetchAllComments(mediaId, accessToken);
      console.log(`Found ${comments.length} comments for media ${mediaId}`);

      for (const comment of comments) {
        try {
          // Process each comment using the webhook's processComment function
          await processComment(comment, true); // true indicates it's a backtrack comment
          processedCount++;
        } catch (error) {
          console.error(`Error processing comment ${comment.id}:`, error);
          continue;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} comments across ${mediaIdsToProcess.length} posts`,
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
