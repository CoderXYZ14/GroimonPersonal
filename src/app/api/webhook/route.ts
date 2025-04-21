import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutomationModel, {
  IAutomation as AutomationType,
} from "@/models/Automation";
import StoryModel from "@/models/Story";

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

interface IAutomation extends Omit<AutomationType, keyof Document> {
  _id: { toString: () => string };
  user: IUser & {
    instagramAccessToken?: string;
  };
  enableBacktrack: boolean;
}

interface InstagramWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      postback: { payload: string; title: string; mid: string };
    }>;
  }>;
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
      payload.entry?.[0]?.messaging?.[0]?.postback
    ) {
      return handlePostback(payload);
    }

    // Handle story replies and comments
    if (
      payload.object === "instagram" &&
      payload.entry &&
      payload.entry.length > 0
    ) {
      for (const entry of payload.entry) {
        // Handle story replies
        if (entry.messaging) {
          for (const messaging of entry.messaging) {
            if (messaging.message?.reply_to?.story) {
              await processStory(messaging);
            }
          }
        }

        // Handle comments
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === "comments" && change.value) {
              console.log("Processing comment:", change.value);
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

interface StoryMessage {
  sender: {
    id: string;
  };
  message: {
    text: string;
    reply_to: {
      story: {
        id: string;
        url?: string;
      };
    };
  };
}

async function processStory(messaging: StoryMessage) {
  try {
    const {
      sender: { id: senderId },
      message: {
        text: commentText,
        reply_to: {
          story: { id: storyId },
        },
      },
    } = messaging;

    // Find matching story automation
    const stories = await StoryModel.find({
      postIds: storyId,
    }).populate<{ user: IUser }>("user");

    if (!stories || stories.length === 0) {
      console.log(
        `No matching story automation found for story ID: ${storyId}`
      );
      return;
    }

    console.log(`Found ${stories.length} matching story automations`);

    // Process each matching story
    for (const story of stories) {
      // Skip if automation is not active
      if (story.isActive === false) {
        console.log(`Story automation is disabled: ${story.name}`);
        continue;
      }

      let shouldProcess = false;

      // If respondToAll is true, process all messages regardless of keywords
      if (story.respondToAll) {
        console.log(
          `Processing story with respondToAll enabled: ${story.name}`
        );
        shouldProcess = true;
      } else {
        // Otherwise check if the message contains any of the keywords
        const keywords = story.keywords.map((k) => k.toLowerCase());
        const commentLower = commentText.toLowerCase();

        if (keywords.some((keyword) => commentLower.includes(keyword))) {
          console.log(
            `Keyword match found for story automation: ${story.name}`
          );
          shouldProcess = true;
        } else {
          console.log(
            `Comment doesn't match keywords for story automation: ${story.name}`
          );
        }
      }

      // Skip if no keyword match and respondToAll is not enabled
      if (!shouldProcess) {
        continue;
      }

      console.log(`Processing story automation: ${story.name}`);

      // Send DM response
      if (!story.user.instagramAccessToken) {
        console.error(
          `Instagram access token not found for user ${
            story.user.instagramUsername ?? "unknown"
          }`
        );
        continue; // Skip this story but check others
      }

      try {
        // Increment hit count
        await StoryModel.findByIdAndUpdate(story._id, {
          $inc: { hitCount: 1 },
        });

        const comment: InstagramComment = {
          id: `${storyId}_${senderId}`,
          from: { id: senderId, username: "unknown" },
          media: { id: storyId },
          text: commentText,
        };

        await sendStoryDM(
          comment,
          story.message,
          story.name,
          story._id.toString()
        );

        console.log(
          `Successfully sent DM to user ${senderId} for story automation: ${story.name}`
        );
      } catch (error) {
        console.error(
          `Error processing story automation ${story.name}:`,
          error
        );
        // Continue with other stories even if one fails
      }
    }
  } catch (error) {
    console.error("Error processing story:", error);
  }
}

async function fetchPreviousComments(mediaId: string, accessToken: string) {
  try {
    const url = `https://graph.instagram.com/v22.0/${mediaId}/comments?access_token=${accessToken}`;
    const response = await axios.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error(
      `Error fetching previous comments for media ${mediaId}:`,
      error
    );
    return [];
  }
}

export async function processComment(
  comment: InstagramComment,
  isBacktrackComment: boolean = false
) {
  try {
    console.log(
      `Processing ${
        isBacktrackComment ? "backtrack " : ""
      }comment on post ID: ${comment.media.id}`
    );
    console.log(`Comment from user: ${comment.from.username}`);
    console.log(`Comment text: "${comment.text}"`);

    // Find matching automations
    const automations = await AutomationModel.find({
      postIds: comment.media.id,
      isActive: true, // Only get active automations
    }).populate<{ user: IUser }>("user");

    if (!automations || automations.length === 0) {
      console.log(
        `No matching active automation found for media ID: ${comment.media.id}`
      );
      return;
    }

    console.log(`Found ${automations.length} automations for this post`);

    // If this is a new comment and there are automations with backtrack enabled,
    // fetch and process previous comments
    if (!isBacktrackComment) {
      for (const automation of automations) {
        if (
          automation.enableBacktrack &&
          "instagramAccessToken" in automation.user &&
          automation.user.instagramAccessToken
        ) {
          console.log(
            `Fetching previous comments for post ${comment.media.id} due to backtrack enabled`
          );
          const previousComments = await fetchPreviousComments(
            comment.media.id,
            automation.user.instagramAccessToken
          );

          for (const prevComment of previousComments) {
            // Skip if it's the same comment we're currently processing
            if (prevComment.id === comment.id) continue;

            await processComment(
              {
                id: prevComment.id,
                from: {
                  id: prevComment.from.id,
                  username: prevComment.from.username,
                },
                media: { id: comment.media.id },
                text: prevComment.text,
              },
              true // Mark as backtrack comment
            );
          }
        }
      }
    }

    for (const automation of automations) {
      // Skip if the comment is from the post owner (commented out in original code)
      // if (
      //   automation.user &&
      //   typeof automation.user === "object" &&
      //   "instagramId" in automation.user &&
      //   automation.user.instagramId === comment.from.id
      // ) {
      //   console.log(`Skipping automation as comment is from the post owner`);
      //   continue;
      // }

      // Check if respondToAll is enabled or if there's a keyword match
      let shouldProcess = false;

      if (automation.respondToAll) {
        console.log(
          `Automation ${automation.name} has respondToAll enabled - processing all comments`
        );
        shouldProcess = true;
      } else if (!automation.keywords || automation.keywords.length === 0) {
        console.log(`Automation ${automation.name} has no keywords, skipping`);
        continue;
      } else {
        const commentText = comment.text.toLowerCase();
        const matchedKeyword = automation.keywords.find((keyword) =>
          commentText.includes(keyword.toLowerCase())
        );

        if (matchedKeyword) {
          console.log(
            `Keyword match found: "${matchedKeyword}" in automation "${automation.name}"`
          );
          shouldProcess = true;
        }
      }

      if (shouldProcess) {
        try {
          await handleAutomationResponse(
            comment,
            automation as IAutomation,
            automation.name,
            automation._id.toString()
          );
        } catch (error) {
          console.error(
            `Error processing automation ${automation.name}:`,
            error
          );
          // Continue processing other automations even if one fails
          // This is especially important during backtracking
          if (isBacktrackComment) {
            console.log(
              `Continuing with other automations despite error during backtracking`
            );
          }
        }
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
      console.error(
        `Instagram access token not found for user ${
          user.instagramUsername ?? "unknown"
        }`
      );
      return;
    }

    // Handle comment automation with reply limit
    if (automation.enableCommentAutomation && automation.commentMessage) {
      const autoReplyLimitLeft = automation.autoReplyLimitLeft ?? -1;

      // Send comment if: unlimited (-1) OR has replies left (> 0)
      if (autoReplyLimitLeft === -1 || autoReplyLimitLeft > 0) {
        await replyToComment(
          comment,
          automation.commentMessage,
          user.instagramAccessToken
        );

        // Decrement reply limit if not unlimited
        if (autoReplyLimitLeft !== -1) {
          await AutomationModel.findByIdAndUpdate(automationId, {
            $inc: { autoReplyLimitLeft: -1 },
          });
          console.log(
            `Decremented autoReplyLimitLeft for automation ${automationId}. Remaining: ${
              autoReplyLimitLeft - 1
            }`
          );
        }
      } else {
        console.log(
          `Skipping comment reply for automation ${automationId} - no replies left`
        );
      }
    }

    // Always send DM regardless of reply limit
    const dmResult = await sendDM(
      comment,
      automation.message,
      automationName,
      automationId,
      false
    );

    // If sendDM returns null, it means it handled a known error gracefully
    // We don't need to throw an error in this case
    if (dmResult === null) {
      console.log(
        `DM was not sent for ${comment.from.username} due to a handled limitation`
      );
    }
  } catch (error) {
    console.error("Error handling automation response:", error);
    // Don't rethrow the error to prevent the entire webhook from failing
    // This allows processing to continue for other automations
  }
}

export async function replyToComment(
  comment: InstagramComment,
  message: string,
  accessToken: string
) {
  try {
    const url = `https://graph.instagram.com/v22.0/${comment.id}/replies`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const body = {
      message: message,
    };

    console.log(
      `Attempting to reply to comment from user ${comment.from.username} (${comment.from.id})`
    );

    try {
      const response = await axios.post(url, body, { headers });
      console.log(
        `Reply sent successfully to ${comment.from.username}'s comment with message: "${message}"`
      );
      return response.data;
    } catch (error) {
      console.error("Error replying to Instagram comment:", {
        username: comment.from.username,
        errorMessage: error.response?.data?.error?.message || error.message,
        errorCode: error.response?.data?.error?.code,
      });
      throw error;
    }
  } catch (error) {
    console.error("Error in replyToComment function:", error);
    throw error;
  }
}

export async function sendStoryDM(
  comment: InstagramComment,
  message: string,
  storyName: string,
  storyId: string
) {
  try {
    console.log(
      `Sending Story DM to user ${comment.from.id} for story ${storyName}`
    );

    await dbConnect();

    // Get the story to check user's access token and branding settings
    const story = await StoryModel.findById(storyId).populate<{
      user: IUser;
    }>("user");

    if (!story) {
      console.error(`Story ${storyId} not found`);
      return;
    }

    const accessToken = story.user.instagramAccessToken;
    if (!accessToken) {
      console.error(
        `No Instagram access token found for user ${story.user._id}`
      );
      return;
    }

    // Check if user follows the business account
    const isFollowing = await checkIfUserFollowsBusiness(
      comment.from.id,
      accessToken
    );

    if (!isFollowing && story.isFollowed) {
      console.log(
        `User ${comment.from.id} is not following but follow is required. Sending follow request.`
      );

      const url = `https://graph.instagram.com/v22.0/${story.user.instagramId}/messages`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      // Send follow request message with button
      const followRequestBody = {
        recipient: {
          id: comment.from.id,
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text:
                story.notFollowerMessage ||
                "Please follow our account to receive our message. Click the button below once you're following.",
              buttons: [
                {
                  type: "postback",
                  title: story.followButtonTitle || "I'm following now",
                  payload: JSON.stringify({
                    action: "followConfirmed",
                    storyId: storyId,
                    commentId: comment.id,
                    userId: comment.from.id,
                    username: comment.from.username,
                    mediaId: comment.media.id,
                    originalMessage: message,
                    notFollowerMessage: story.notFollowerMessage,
                    followButtonTitle: story.followButtonTitle,
                    followUpMessage: story.followUpMessage,
                  }),
                },
              ],
            },
          },
        },
      };

      await axios.post(url, followRequestBody, { headers });
      console.log(`Follow request sent to user ${comment.from.id}`);
      return;
    }

    // User is following or follow not required, send the message
    // Prepare the message with branding if needed
    let messageWithBranding = message;
    if (!story.removeBranding) {
      messageWithBranding += "\n\nPowered by Groimon";
    }

    // Prepare the message body based on message type and buttons
    const url = `https://graph.instagram.com/v22.0/${story.user.instagramId}/messages`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    let messageBody;

    // Check if the story has buttons
    if (story.buttons && story.buttons.length > 0) {
      messageBody = {
        recipient: {
          id: comment.from.id,
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: messageWithBranding,
              buttons: story.buttons.map((button) => ({
                type: "web_url",
                url: `${
                  process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
                  "https://www.groimon.com"
                }/redirect?url=${encodeURIComponent(
                  button.url
                )}&type=story&id=${storyId}`,
                title: button.buttonText,
              })),
            },
          },
        },
      };
    } else {
      // Simple text message
      messageBody = {
        recipient: {
          id: comment.from.id,
        },
        message: {
          text: messageWithBranding,
        },
      };
    }

    // Send the message
    const response = await axios.post(url, messageBody, { headers });
    console.log(`Message sent successfully to user ${comment.from.id}`);

    return response.data;
  } catch (error) {
    console.error("Error sending Story DM:", error);
    throw error;
  }
}

async function sendDM(
  comment: InstagramComment,
  message: string,
  automationName: string,
  automationId: string,
  isBacktrack: boolean = false
) {
  try {
    await dbConnect();

    const automation = await AutomationModel.findById(automationId).populate(
      "user"
    );

    // Store the original message for later use after follow check
    const originalMessage = message;

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
        `Instagram access token not found for user ${
          user.instagramUsername ?? "unknown"
        } (${user._id})`
      );
      return;
    }

    const ownerId = user.instagramId;
    if (!ownerId) {
      console.error(
        `Instagram ID not found for user ${
          user.instagramUsername ?? "unknown"
        } (${user._id})`
      );
      return;
    }

    const url = `https://graph.instagram.com/v22.0/${ownerId}/messages`;

    const headers = {
      Authorization: `Bearer ${user.instagramAccessToken}`,
      "Content-Type": "application/json",
    };

    const messageWithBranding = automation.removeBranding
      ? originalMessage
      : `${originalMessage}\n\nThis automation is sent by Groimon.`;

    let body;

    // For backtrack, always use comment_id
    const recipient = { comment_id: comment.id };

    // Skip follow check for backtracked comments to avoid API errors with old comments
    // For backtracked comments, we'll assume the user is following
    if (!isBacktrack && automation.isFollowed) {
      try {
        const isFollowing = await checkIfUserFollowsBusiness(
          comment.from.id,
          user.instagramAccessToken
        );

        if (!isFollowing) {
          body = {
            recipient,
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text:
                    automation.notFollowerMessage ||
                    "Please follow our account to receive the information you requested. Once you've followed, click the button below.",
                  buttons: [
                    {
                      type: "postback",
                      title:
                        automation.followButtonTitle || "I'm following now",
                      payload: JSON.stringify({
                        action: "followConfirmed",
                        automationId,
                        commentId: comment.id,
                        userId: comment.from.id,
                        username: comment.from.username,
                        mediaId: comment.media.id,
                        originalMessage: originalMessage,
                        notFollowerMessage: automation.notFollowerMessage,
                        followButtonTitle: automation.followButtonTitle,
                        followUpMessage: automation.followUpMessage,
                      }),
                    },
                  ],
                },
              },
            },
          };
        }
      } catch (error) {
        console.log(
          `Error checking follow status, assuming user is following: ${error.message}`,
          {
            username: comment.from.username,
            userId: comment.from.id,
            errorStatus: error.response?.status,
            errorData: error.response?.data,
          }
        );
        // Continue without follow check if it fails
      }
    }

    // If no follow check needed or user is following
    if (!body) {
      if (
        (automation.messageType === "ButtonText" ||
          automation.messageType === "ButtonImage") &&
        automation.buttons &&
        automation.buttons.length > 0
      ) {
        if (automation.messageType === "ButtonImage" && automation.imageUrl) {
          // Use generic template for ButtonImage type
          body = {
            recipient,
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [
                    {
                      title: messageWithBranding,
                      image_url: automation.imageUrl,
                      buttons: automation.buttons.map((button) => ({
                        type: "web_url",
                        url:
                          `${
                            process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
                            "https://www.groimon.com"
                          }/redirect?url=${encodeURIComponent(
                            button.url
                          )}&type=automation&id=${automationId}` || button.url,
                        title: button.buttonText,
                      })),
                    },
                  ],
                },
              },
            },
          };
        } else {
          // Use button template for ButtonText type
          body = {
            recipient,
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: messageWithBranding,
                  buttons: automation.buttons.map((button) => ({
                    type: "web_url",
                    url:
                      `${
                        process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
                        "https://www.groimon.com"
                      }/redirect?url=${encodeURIComponent(button.url)}` ||
                      button.url,
                    title: button.buttonText,
                  })),
                },
              },
            },
          };
        }
      } else {
        body = {
          recipient,
          message: {
            text: messageWithBranding,
          },
        };
      }
    }

    console.log(
      `Attempting to send DM to user ${comment.from.username} (${comment.from.id}) for automation "${automationName}"`
    );

    try {
      const response = await axios.post(url, body, { headers });
      console.log(`DM sent successfully to ${comment.from.username}`);

      // Increment hitCount for the automation
      await AutomationModel.findByIdAndUpdate(automationId, {
        $inc: { hitCount: 1 },
      });
      console.log(`Incremented hitCount for automation ${automationName}`);

      return response.data;
    } catch (error) {
      // Handle 24-hour messaging window limit
      if (
        error.response?.data?.error?.code === 10 &&
        error.response?.data?.error?.error_subcode === 2534022
      ) {
        console.log(
          `Cannot send DM to ${comment.from.username}: Outside 24-hour messaging window`
        );
        return null;
      }

      // Handle "comment is too old" error (common during backtracking)
      if (
        error.response?.data?.error?.error_subcode === 2534024 ||
        error.response?.data?.error?.message?.includes("comment is too old")
      ) {
        console.log(
          `Cannot send DM to ${comment.from.username}: Comment is too old to get a reply`
        );
        return null;
      }

      console.error("Error sending Instagram DM:", {
        username: comment.from.username,
        errorMessage: error.response?.data?.error?.message || error.message,
        errorCode: error.response?.data?.error?.code,
        errorSubcode: error.response?.data?.error?.error_subcode,
      });

      // For backtracking, we want to continue processing other comments even if one fails
      if (isBacktrack) {
        console.log(
          `Skipping error for backtracked comment from ${comment.from.username}`
        );
        return null;
      }

      throw error;
    }
  } catch (error) {
    console.error("Error in sendDM function:", error);
    throw error;
  }
}

// Updated function to check if user follows the business using the proper Instagram API endpoint
export async function checkIfUserFollowsBusiness(
  instagramScopedId: string,
  accessToken: string
): Promise<boolean> {
  try {
    // The correct endpoint to check if a user follows a business is:
    // /{page-id}/subscribed_apps where page-id is the business's Instagram account ID
    // We need to use the business ID (extracted from the access token) as the endpoint

    // First, get the business ID from the /me endpoint
    const meResponse = await axios.get("https://graph.facebook.com/v22.0/me", {
      params: {
        access_token: accessToken,
        fields: "id,instagram_business_account",
      },
    });

    if (!meResponse.data?.instagram_business_account?.id) {
      console.log("Could not retrieve Instagram business account ID");
      return true; // Assume following to avoid disrupting flow
    }

    const businessId = meResponse.data.instagram_business_account.id;

    // Now check if the user follows the business using the correct endpoint
    const url = `https://graph.facebook.com/v22.0/${businessId}/followers`;

    const params = {
      access_token: accessToken,
      user_id: instagramScopedId,
    };

    const response = await axios.get(url, { params });

    // If we get a successful response with data, the user is following
    return (
      response.data &&
      response.data.data &&
      response.data.data.length > 0 &&
      response.data.data.some((follower) => follower.id === instagramScopedId)
    );
  } catch (error) {
    // For certain error types, we can make assumptions
    if (error.response?.status === 400) {
      console.log(
        `User ${instagramScopedId} follow status check failed with 400 error - assuming user is following`
      );
      return true;
    }

    // Handle 500 errors and other server errors
    if (error.response?.status >= 500) {
      console.log(
        `User ${instagramScopedId} follow status check failed with ${error.response.status} server error - assuming user is following`
      );
      return true;
    }

    // Handle permission errors (common when the app doesn't have proper permissions)
    if (error.response?.data?.error?.type === "OAuthException") {
      console.log(
        `Permission error checking if user follows business: ${error.response.data.error.message} - assuming user is following`
      );
      return true;
    }

    // Log the full error details for debugging
    console.error("Error checking if user follows business:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      userId: instagramScopedId,
    });

    // Default to assuming the user follows the business to avoid blocking the flow
    return true;
  }
}

async function handlePostback(payload: InstagramWebhookPayload) {
  try {
    console.log("Postback payload received:", JSON.stringify(payload, null, 2));

    if (
      payload.object === "instagram" &&
      payload.entry &&
      payload.entry.length > 0
    ) {
      for (const entry of payload.entry) {
        if (entry.messaging && entry.messaging.length > 0) {
          for (const messaging of entry.messaging) {
            if (messaging.postback && messaging.postback.payload) {
              try {
                const postbackData = JSON.parse(messaging.postback.payload);
                const senderId = messaging.sender?.id;

                if (postbackData.action === "followConfirmed") {
                  // Check if this is a story or automation follow request
                  let user: IUser | null = null;
                  let messageContent = postbackData.originalMessage;
                  let isStory = false;

                  if (postbackData.automationId) {
                    // Handle automation follow request
                    const automation = await AutomationModel.findById(
                      postbackData.automationId
                    ).populate("user");

                    if (!automation || !automation.user) {
                      continue;
                    }

                    user = automation.user as IUser;
                    messageContent =
                      automation.message || postbackData.originalMessage;
                  } else if (postbackData.storyId) {
                    // Handle story follow request
                    isStory = true;
                    const story = await StoryModel.findById(
                      postbackData.storyId
                    ).populate("user");

                    if (!story || !story.user) {
                      continue;
                    }

                    user = story.user as IUser;
                    messageContent =
                      story.message || postbackData.originalMessage;
                  } else {
                    continue;
                  }

                  if (!user.instagramAccessToken) {
                    continue;
                  }

                  const isNowFollowing = await checkIfUserFollowsBusiness(
                    senderId,
                    user.instagramAccessToken
                  );

                  const ownerId = user.instagramId;
                  const url = `https://graph.instagram.com/v22.0/${ownerId}/messages`;
                  const headers = {
                    Authorization: `Bearer ${user.instagramAccessToken}`,
                    "Content-Type": "application/json",
                  };

                  if (isNowFollowing) {
                    // When user is following, send the actual message
                    const actualMessage = messageContent;

                    // Add branding based on the type (story or automation)
                    const messageWithBranding = isStory
                      ? (await StoryModel.findById(postbackData.storyId))
                          ?.removeBranding
                        ? actualMessage
                        : `${actualMessage}\n\nPowered by Groimon`
                      : (
                          await AutomationModel.findById(
                            postbackData.automationId
                          )
                        )?.removeBranding
                      ? actualMessage
                      : `${actualMessage}\n\nThis automation is sent by Groimon`;

                    let messageBody;

                    // Handle different message types based on whether it's a story or automation
                    if (isStory) {
                      // For story, we just send a simple text message
                      messageBody = {
                        recipient: {
                          id: senderId,
                        },
                        message: {
                          text: messageWithBranding,
                        },
                      };
                    } else if (
                      // For automation, check if it has buttons
                      postbackData.automationId &&
                      (
                        await AutomationModel.findById(
                          postbackData.automationId
                        )
                      )?.messageType === "ButtonText" &&
                      (
                        await AutomationModel.findById(
                          postbackData.automationId
                        )
                      )?.buttons &&
                      (
                        await AutomationModel.findById(
                          postbackData.automationId
                        )
                      )?.buttons.length > 0
                    ) {
                      const automation = await AutomationModel.findById(
                        postbackData.automationId
                      );
                      messageBody = {
                        recipient: {
                          id: senderId,
                        },
                        message: {
                          attachment: {
                            type: "template",
                            payload: {
                              template_type: "button",
                              text: messageWithBranding,
                              buttons: automation.buttons.map((button) => ({
                                type: "web_url",
                                url: `${
                                  process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
                                  "https://www.groimon.com"
                                }/redirect?url=${encodeURIComponent(
                                  button.url
                                )}&type=automation&id=${
                                  postbackData.automationId
                                }`,
                                title: button.buttonText,
                              })),
                            },
                          },
                        },
                      };
                    } else {
                      messageBody = {
                        recipient: {
                          id: senderId,
                        },
                        message: {
                          text: messageWithBranding,
                        },
                      };
                    }

                    await axios.post(url, messageBody, { headers });
                  } else {
                    const followRequestBody = {
                      recipient: {
                        id: senderId,
                      },
                      message: {
                        attachment: {
                          type: "template",
                          payload: {
                            template_type: "button",
                            text:
                              postbackData.followUpMessage ||
                              "It seems you haven't followed us yet. Please follow our account and click the button below when you're done.",
                            buttons: [
                              {
                                type: "postback",
                                title:
                                  postbackData.followButtonTitle ||
                                  "I'm following now",
                                payload: JSON.stringify({
                                  action: "followConfirmed",
                                  automationId: postbackData.automationId,
                                  commentId: postbackData.commentId,
                                  userId: senderId,
                                  username: postbackData.username,
                                  mediaId: postbackData.mediaId,
                                  originalMessage: postbackData.originalMessage,
                                  notFollowerMessage:
                                    postbackData.notFollowerMessage,
                                  followButtonTitle:
                                    postbackData.followButtonTitle,
                                  followUpMessage: postbackData.followUpMessage,
                                }),
                              },
                            ],
                          },
                        },
                      },
                    };

                    await axios.post(url, followRequestBody, { headers });
                  }
                }
              } catch (error) {
                console.error("Error processing postback data:", error);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing postback webhook:", error);
    return NextResponse.json(
      { message: "Failed to process postback webhook", error: String(error) },
      { status: 500 }
    );
  }
}
