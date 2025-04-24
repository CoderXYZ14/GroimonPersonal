import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import IplRegistrationModel from "@/models/IplRegistration";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user already has a pending or approved registration
    const existingRegistration = await IplRegistrationModel.findOne({
      user: user._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          message:
            "You already have a registration that is pending or approved",
          status: existingRegistration.status,
        },
        { status: 400 }
      );
    }

    // Create new registration
    const newRegistration = new IplRegistrationModel({
      user: user._id,
      registrationTime: new Date(),
      status: "pending",
    });

    await newRegistration.save();

    return NextResponse.json(
      {
        message: "Registration submitted successfully",
        registrationId: newRegistration._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in IPL registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const isAdmin = url.searchParams.get("isAdmin") === "true";

    await dbConnect();

    // If admin is requesting all registrations
    if (isAdmin) {
      const registrations = await IplRegistrationModel.find()
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
            const user = registration.user as { instagramAccessToken?: string; instagramUsername?: string; instagramId?: string; };
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

              // Get follower count directly if available or from business discovery
              let followerCount = instaResponse.data.followers_count || 0;
              let followsCount = instaResponse.data.follows_count || 0;

              // If direct follower count not available, try business discovery
              if (!followerCount && user.instagramId) {
                try {
                  const businessResponse = await axios.get(
                    `https://graph.facebook.com/v17.0/me`,
                    {
                      params: {
                        fields: `business_discovery.username(${user.instagramUsername}){followers_count,follows_count,media_count,biography,website,name,profile_picture_url}`,
                        access_token: user.instagramAccessToken,
                      },
                    }
                  );

                  const businessData =
                    businessResponse.data?.business_discovery;
                  if (businessData) {
                    followerCount = businessData.followers_count || 0;
                    followsCount = businessData.follows_count || followsCount;

                    // Add additional business data if available
                    instaResponse.data.biography = businessData.biography;
                    instaResponse.data.website = businessData.website;
                    instaResponse.data.name = businessData.name;
                    if (
                      !instaResponse.data.profile_picture_url &&
                      businessData.profile_picture_url
                    ) {
                      instaResponse.data.profile_picture_url =
                        businessData.profile_picture_url;
                    }
                  }
                } catch (businessError) {
                  console.error(
                    "Error fetching business discovery data:",
                    businessError
                  );
                  // Fallback to media count as an approximation if no follower count available
                  if (!followerCount) {
                    followerCount = instaResponse.data.media_count * 10; // Rough estimate
                  }
                }
              }

              return {
                ...registration.toObject(),
                followerCount: followerCount,
                followsCount: followsCount,
                mediaCount: instaResponse.data.media_count || 0,
                accountType: instaResponse.data.account_type || "Unknown",
                biography: instaResponse.data.biography,
                website: instaResponse.data.website,
                name: instaResponse.data.name,
                profilePictureUrl: instaResponse.data.profile_picture_url,
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
    }

    // Regular user request
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get user's registrations
    const registrations = await IplRegistrationModel.find({
      user: user._id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Error fetching IPL registrations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
