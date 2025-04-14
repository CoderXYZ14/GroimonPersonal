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

    // Handle story replies
    if (
      payload.object === "instagram" &&
      payload.entry &&
      payload.entry.length > 0
    ) {
      for (const entry of payload.entry) {
        for (const messaging of entry.messaging || []) {
          // Check if this is a story reply
          if (messaging.message?.reply_to?.story) {
            await processStory(messaging);
          }
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              if (change.field === "comments" && change.value) {
                await processComment(change.value);
              }
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

    console.log(`Processing story reply from user ID: ${senderId}`);
    console.log(`Story ID: ${storyId}`);
    console.log(`Comment text: "${commentText}"`);

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

    // Check if the comment matches any keywords and process each matching story
    for (const story of stories) {
      const keywords = story.keywords.map((k) => k.toLowerCase());
      const commentLower = commentText.toLowerCase();

      if (!keywords.some((keyword) => commentLower.includes(keyword))) {
        console.log(
          `Comment doesn't match keywords for story automation: ${story.name}`
        );
        continue; // Skip this story but check others
      }

      console.log(`Matched keywords for story automation: ${story.name}`);

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
          story._id.toString(),
          false
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

    const automations = await AutomationModel.find({
      postIds: comment.media.id,
    }).populate("user");

    if (!automations || automations.length === 0) {
      console.log(`No automations found for post ID: ${comment.media.id}`);
      return;
    }

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

    console.log(`Found ${automations.length} automations for this post`);

    for (const automation of automations) {
      // if (
      //   automation.user &&
      //   typeof automation.user === "object" &&
      //   "instagramId" in automation.user &&
      //   automation.user.instagramId === comment.from.id
      // ) {
      //   console.log(`Skipping automation as comment is from the post owner`);
      //   continue;
      // }

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
      console.error(
        `Instagram access token not found for user ${
          user.instagramUsername ?? "unknown"
        }`
      );
      return;
    }

    if (automation.enableCommentAutomation && automation.commentMessage) {
      await replyToComment(
        comment,
        automation.commentMessage,
        user.instagramAccessToken
      );
    }

    await sendDM(comment, automation.message, automationName, automationId);
  } catch (error) {
    console.error("Error handling automation response:", error);
    throw error;
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
  storyId: string,
  isBacktrack: boolean = false
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
              text: "Please follow our account to receive our message. Click the button below once you're following.",
              buttons: [
                {
                  type: "postback",
                  title: "I'm following now",
                  payload: JSON.stringify({
                    action: "followConfirmed",
                    storyId: storyId,
                    commentId: comment.id,
                    userId: comment.from.id,
                    username: comment.from.username,
                    mediaId: comment.media.id,
                    originalMessage: message,
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

    let messageBody: any;

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
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://www.groimon.vercel.app"
                }/redirect?url=${encodeURIComponent(button.url)}`,
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
    const recipient = isBacktrack
      ? { comment_id: comment.id }
      : { id: comment.from.id };

    // If follow check is required and this isn't a backtrack request
    if (!isBacktrack && automation.isFollowed) {
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
                text: "Please follow our account to receive the information you requested. Once you've followed, click the button below.",
                buttons: [
                  {
                    type: "postback",
                    title: "I'm following now",
                    payload: JSON.stringify({
                      action: "followConfirmed",
                      automationId,
                      commentId: comment.id,
                      userId: comment.from.id,
                      username: comment.from.username,
                      mediaId: comment.media.id,
                      originalMessage: originalMessage,
                    }),
                  },
                ],
              },
            },
          },
        };
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
                            process.env.NEXT_PUBLIC_APP_URL ||
                            "https://www.groimon.vercel.app"
                          }/redirect?url=${encodeURIComponent(button.url)}` ||
                          button.url,
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
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "https://www.groimon.vercel.app"
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
      if (
        error.response?.data?.error?.code === 10 &&
        error.response?.data?.error?.error_subcode === 2534022
      ) {
        console.log(
          `Cannot send DM to ${comment.from.username}: Outside 24-hour messaging window`
        );
        return null;
      }

      console.error("Error sending Instagram DM:", {
        username: comment.from.username,
        errorMessage: error.response?.data?.error?.message || error.message,
        errorCode: error.response?.data?.error?.code,
        errorSubcode: error.response?.data?.error?.error_subcode,
      });
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
    const url = `https://graph.instagram.com/v22.0/${instagramScopedId}`;

    const params = {
      fields: "is_user_follow_business",
      access_token: accessToken,
    };

    const response = await axios.get(url, { params });

    console.log(
      `Follow check response for user ${instagramScopedId}:`,
      response.data
    );

    // Return true if the user follows the business, false otherwise
    return response.data && response.data.is_user_follow_business === true;
  } catch (error) {
    console.error("Error checking if user follows business:", error);
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
                  const automation = await AutomationModel.findById(
                    postbackData.automationId
                  ).populate("user");

                  if (!automation || !automation.user) {
                    console.log("Automation or user not found for postback");
                    continue;
                  }

                  const user = automation.user as IUser;

                  if (!user.instagramAccessToken) {
                    console.log("Instagram access token not found for user");
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
                    console.log(
                      `User ${senderId} (${postbackData.username}) is now following, sending automated message`
                    );

                    const messageWithBranding = automation.removeBranding
                      ? postbackData.originalMessage
                      : `${postbackData.originalMessage}\n\nThis automation is sent by Groimon.`;

                    let messageBody;

                    if (
                      automation.messageType === "ButtonText" &&
                      automation.buttons &&
                      automation.buttons.length > 0
                    ) {
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
                                url:
                                  `${
                                    process.env.NEXT_PUBLIC_APP_URL ||
                                    "https://www.groimon.vercel.app"
                                  }/redirect?url=${encodeURIComponent(
                                    button.url
                                  )}` || button.url,
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
                    console.log(`Automation message sent to user ${senderId}`);
                  } else {
                    console.log(
                      `User ${senderId} (${postbackData.username}) is not following yet, sending follow button again`
                    );

                    const followRequestBody = {
                      recipient: {
                        id: senderId,
                      },
                      message: {
                        attachment: {
                          type: "template",
                          payload: {
                            template_type: "button",
                            text: "It seems you haven't followed us yet. Please follow our account and click the button below when you're done.",
                            buttons: [
                              {
                                type: "postback",
                                title: "I'm following now",
                                payload: JSON.stringify({
                                  action: "followConfirmed",
                                  automationId: postbackData.automationId,
                                  commentId: postbackData.commentId,
                                  userId: senderId,
                                  username: postbackData.username,
                                  mediaId: postbackData.mediaId,
                                  originalMessage: postbackData.originalMessage,
                                }),
                              },
                            ],
                          },
                        },
                      },
                    };

                    await axios.post(url, followRequestBody, { headers });
                    console.log(
                      `Follow request button sent again to user ${senderId}`
                    );
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
