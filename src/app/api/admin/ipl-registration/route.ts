import { NextRequest, NextResponse } from "next/server";
import IplRegistrationModel from "@/models/IplRegistration";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { registrationId, registrationIds, action } = await req.json();

    // Handle both single ID and array of IDs
    const ids = registrationIds
      ? Array.isArray(registrationIds)
        ? registrationIds
        : [registrationIds]
      : registrationId
      ? [registrationId]
      : [];

    if (ids.length === 0 || !action) {
      return NextResponse.json(
        { message: "Registration ID(s) and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // For bulk operations, use updateMany
    if (ids.length > 1) {
      const result = await IplRegistrationModel.updateMany(
        { _id: { $in: ids } },
        { $set: { status: action === "approve" ? "approved" : "rejected" } }
      );

      return NextResponse.json(
        {
          message: `${result.modifiedCount} registrations ${
            action === "approve" ? "approved" : "rejected"
          } successfully`,
          modifiedCount: result.modifiedCount,
        },
        { status: 200 }
      );
    } else {
      // For single operation, maintain backward compatibility
      const registration = await IplRegistrationModel.findById(ids[0]);

      if (!registration) {
        return NextResponse.json(
          { message: "Registration not found" },
          { status: 404 }
        );
      }

      // Update registration status
      registration.status = action === "approve" ? "approved" : "rejected";

      // Remove rejection reason field usage
      await registration.save();

      return NextResponse.json(
        {
          message: `Registration ${
            action === "approve" ? "approved" : "rejected"
          } successfully`,
          registration,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating IPL registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    let query = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query = { status };
    }

    const registrations = await IplRegistrationModel.find(query)
      .populate(
        "user",
        "instagramId instagramUsername instaProfilePic instagramAccessToken"
      )
      .sort({ createdAt: -1 });

    // For each user, fetch their follower count and other data from Instagram API
    const registrationsWithInstaData = await Promise.all(
      registrations.map(async (registration) => {
        try {
          // Type assertion to handle populated user object
          const user = registration.user as {
            instagramAccessToken?: string;
            instagramUsername?: string;
          };
          if (user && typeof user === "object" && user.instagramAccessToken) {
            const instaResponse = await axios.get(
              `https://graph.instagram.com/me`,
              {
                params: {
                  fields:
                    "id,username,account_type,media_count,profile_picture_url,followers_count,follows_count",
                  access_token: user.instagramAccessToken,
                },
              }
            );

            let followerCount = instaResponse.data.followers_count || 0;
            let followsCount = instaResponse.data.follows_count || 0;
            let mediaCount = instaResponse.data.media_count || 0;
            const accountType = instaResponse.data.account_type || "Unknown";
            let biography = "";
            let website = "";
            let name = "";
            let profilePictureUrl =
              instaResponse.data.profile_picture_url || null;

            // If direct follower count not available, try business discovery
            if (
              (!followerCount || !profilePictureUrl) &&
              user.instagramUsername
            ) {
              try {
                const businessResponse = await axios.get(
                  `https://graph.instagram.com/v18.0/me`,
                  {
                    params: {
                      fields: `business_discovery.username(${user.instagramUsername}){followers_count,follows_count,media_count,biography,website,name,profile_picture_url}`,
                      access_token: user.instagramAccessToken,
                    },
                  }
                );

                const businessData = businessResponse.data?.business_discovery;
                if (businessData) {
                  followerCount = businessData.followers_count || followerCount;
                  followsCount = businessData.follows_count || followsCount;
                  mediaCount = businessData.media_count || mediaCount;
                  biography = businessData.biography || biography;
                  website = businessData.website || website;
                  name = businessData.name || name;
                  profilePictureUrl =
                    businessData.profile_picture_url || profilePictureUrl;
                }
              } catch (businessError) {
                console.error(
                  "Error fetching business discovery data:",
                  businessError
                );

                if (!followerCount) {
                  followerCount = mediaCount * 10; // Rough estimate
                }
              }
            }

            return {
              ...registration.toObject(),
              followerCount: followerCount,
              followsCount: followsCount,
              mediaCount: mediaCount,
              accountType: accountType,
              biography: biography,
              website: website,
              name: name,
              profilePictureUrl: profilePictureUrl,
              instaData: instaResponse.data,
            };
          }
          return registration.toObject();
        } catch (error) {
          console.error("Error fetching Instagram data:", error);
          return registration.toObject();
        }
      })
    );

    return NextResponse.json({ registrations: registrationsWithInstaData });
  } catch (error) {
    console.error("Error fetching IPL registrations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
