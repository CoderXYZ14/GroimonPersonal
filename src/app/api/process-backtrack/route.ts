import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { processComment } from "../webhook/route";

interface InstagramComment {
  id: string;
  text: string;
  timestamp?: string;
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
      return [];
    }

    // For each comment, get detailed info
    const commentPromises = response.data.data.map(async (comment) => {
      try {
        // Get detailed comment info including user data
        const commentUrl = `https://graph.instagram.com/v22.0/${comment.id}?fields=id,text,username,timestamp,from&access_token=${accessToken}`;
        const commentResponse = await axios.get(commentUrl);
        const commentData = commentResponse.data;

        return {
          id: commentData.id,
          text: commentData.text,
          timestamp: commentData.timestamp || comment.timestamp,
          media: {
            id: mediaId,
            media_product_type: "FEED",
          },
          from: {
            id: commentData.from?.id || comment.id,
            username: commentData.username || commentData.from?.username || "unknown",
          },
        };
      } catch (error) {
        console.error(
          `Error fetching details for comment ${comment.id}:`,
          error
        );
        // Return a basic comment object with available data
        return {
          id: comment.id,
          text: comment.text || "",
          timestamp: comment.timestamp,
          media: {
            id: mediaId,
            media_product_type: "FEED",
          },
          from: {
            id: comment.from?.id || comment.id,
            username: comment.username || comment.from?.username || "unknown",
          },
        };
      }
    });

    const comments = await Promise.all(commentPromises);
    return comments.filter(
      (comment): comment is InstagramComment => comment !== null
    );
  } catch (error) {
    console.error(`Error fetching comments for media ${mediaId}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("Received backtrack payload:", payload);
    const { mediaId, mediaIds, accessToken, respondToAll, automationId } = payload;

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
    if (mediaIdsToProcess.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No media IDs provided for backtracking",
      }, { status: 400 });
    }

    let processedCount = 0;
    let errorCount = 0;
    
    console.log(`Processing backtrack with respondToAll: ${respondToAll}, automationId: ${automationId}`);

    for (const mediaId of mediaIdsToProcess) {
      try {
        const comments = await fetchAllComments(mediaId, accessToken);
        console.log(`Found ${comments.length} comments for media ${mediaId}`);

        // Process comments in reverse chronological order (newest first)
        // This helps with Instagram's time-based limitations
        const sortedComments = comments.sort((a, b) => {
          // If we have timestamp info, use it
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return 0; // Keep original order if no timestamp
        });

        for (const comment of sortedComments) {
          try {
            // Process each comment using the webhook's processComment function
            // The second parameter (true) indicates it's a backtrack comment
            await processComment(comment, true);
            processedCount++;
            
            // Add a small delay between processing comments to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error processing comment ${comment.id}:`, error);
            errorCount++;
            // Continue with next comment even if this one fails
            continue;
          }
        }
      } catch (error) {
        console.error(`Error fetching comments for media ${mediaId}:`, error);
        errorCount++;
        // Continue with next media ID even if this one fails
        continue;
      }
    }

    // Return a detailed response with success and error counts
    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} comments across ${mediaIdsToProcess.length} posts`,
      processedCount,
      errorCount,
      totalMediaIds: mediaIdsToProcess.length
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
