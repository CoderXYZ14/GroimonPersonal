import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import IplRegistrationModel from "@/models/IplRegistration";
import AutomationModel from "@/models/Automation";
import StoryModel from "@/models/Story";

export async function GET() {
  try {
    // Connect to the database first
    await dbConnect();

    // Get all approved IPL registrations
    const approvedRegistrations = await IplRegistrationModel.find({
      status: "approved",
    }).populate(
      "user",
      "instagramId instagramUsername instaProfilePic instagramAccessToken"
    );

    if (!approvedRegistrations.length) {
      return NextResponse.json({
        leaderboard: [],
        message: "No approved registrations found",
      });
    }

    // Get metrics for each user
    const leaderboardData = await Promise.all(
      approvedRegistrations.map(async (registration) => {
        const user = registration.user as {
          _id: string;
          instagramId?: string;
          instagramUsername?: string;
          instaProfilePic?: string;
          instagramAccessToken?: string;
        };

        if (!user || !user._id) {
          return null;
        }

        // Get all automations for this user
        const automations = await AutomationModel.find({ user: user._id });
        const stories = await StoryModel.find({ user: user._id });

        // Calculate metrics
        const totalAutomations = automations.length + stories.length;
        
        // Post automation metrics
        const totalHitCount = automations.reduce(
          (sum, automation) => sum + (automation.hitCount || 0),
          0
        );
        const totalRedirectCount = automations.reduce(
          (sum, automation) => sum + (automation.redirectCount || 0),
          0
        );

        // Story metrics if available
        const storyHitCount = stories.reduce(
          (sum, story) => sum + (story.hitCount || 0),
          0
        );
        const storyRedirectCount = stories.reduce(
          (sum, story) => sum + (story.redirectCount || 0),
          0
        );

        // Total combined metrics
        const combinedHitCount = totalHitCount + storyHitCount; // Total DM Count
        const combinedRedirectCount = totalRedirectCount + storyRedirectCount; // Total Redirect Hits

        // Get Instagram follower count and other data
        let followerCount = 0;
        let followsCount = 0;
        let mediaCount = 0;
        let accountType = "";
        let biography = "";
        const website = "";
        const userName = "";
        let profilePictureUrl = user.instaProfilePic || null;

        if (user.instagramAccessToken) {
          try {
            // Basic Instagram data
            const instaResponse = await axios.get(
              `https://graph.instagram.com/me`,
              {
                params: {
                  fields:
                    "id,username,account_type,media_count,profile_picture_url,followers_count,follows_count",
                  access_token: user.instagramAccessToken,
                },
                timeout: 5000, // Add timeout to prevent long-running requests
              }
            );

            // Get data directly from response if available
            followerCount = instaResponse.data.followers_count || 0;
            followsCount = instaResponse.data.follows_count || 0;
            mediaCount = instaResponse.data.media_count || 0;
            accountType = instaResponse.data.account_type || "Unknown";
            if (instaResponse.data.profile_picture_url) {
              profilePictureUrl = instaResponse.data.profile_picture_url;
            }

            // If direct follower count not available or we need more data, try additional API calls
            if ((!followerCount || !biography) && user.instagramUsername) {
              try {
                // Get additional account info if available
                const accountInfoResponse = await axios.get(
                  `https://graph.instagram.com/v22.0/me`,
                  {
                    params: {
                      fields: "id,username,account_type,media_count,biography",
                      access_token: user.instagramAccessToken,
                    },
                    timeout: 5000,
                  }
                );

                // Extract additional data if available
                if (accountInfoResponse.data) {
                  // If we have media count but no follower count, estimate followers
                  if (!followerCount && accountInfoResponse.data.media_count) {
                    // Rough estimate based on media count
                    followerCount = accountInfoResponse.data.media_count * 15;
                  }

                  // Get biography if available
                  if (!biography && accountInfoResponse.data.biography) {
                    biography = accountInfoResponse.data.biography;
                  }
                }

                // Log that we're using basic account info
                console.log("Using basic account info for user data");
              } catch (businessError) {
                console.error(
                  "Error fetching additional Instagram data:",
                  businessError
                );
                // Fallback to media count as an approximation if no follower count available
                if (!followerCount && mediaCount) {
                  followerCount = mediaCount * 10; // Rough estimate
                }
              }
            }
          } catch (error) {
            console.error("Error fetching Instagram data:", error);
            // Continue with default values if Instagram API fails
          }
        }

        return {
          registrationId: registration._id,
          userId: user._id,
          username: user.instagramUsername || "Unknown",
          profilePicture: profilePictureUrl || user.instaProfilePic || null,
          automationCount: totalAutomations,
          dmCount: combinedHitCount, // Total DM Count
          redirectCount: combinedRedirectCount, // Total Redirect Hits
          registrationDate: registration.registrationTime,
          followerCount,
          followsCount,
          mediaCount,
          accountType,
          biography,
          website,
          name: userName,
        };
      })
    );

    // Filter out null values and sort by engagement metrics (DM count as primary metric)
    const filteredLeaderboard = leaderboardData
      .filter((item) => item !== null)
      .sort((a, b) => {
        // First sort by DM count (primary metric)
        if (b.dmCount !== a.dmCount) {
          return b.dmCount - a.dmCount;
        }
        // Then by redirect count (secondary metric)
        if (b.redirectCount !== a.redirectCount) {
          return b.redirectCount - a.redirectCount;
        }
        // Finally by follower count (tertiary metric)
        return b.followerCount - a.followerCount;
      });

    return NextResponse.json({ leaderboard: filteredLeaderboard });
  } catch (error) {
    console.error("Error fetching IPL leaderboard:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
