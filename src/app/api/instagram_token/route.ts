import { NextResponse } from "next/server";
import axios from "axios";
import UserModel, { IUser } from "@/models/User";

import dbConnect from "@/lib/dbConnect";
interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { code } = await req.json();

    const payload = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`,
      code,
    });

    const tokenResponse = await axios.post<InstagramTokenResponse>(
      "https://api.instagram.com/oauth/access_token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const shortLivedAccessToken = tokenResponse?.data.access_token;

    const longLivedTokenResponse = await axios.get<InstagramTokenResponse>(
      `https://graph.instagram.com/access_token`,
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
          access_token: shortLivedAccessToken,
        },
      }
    );
    const longLivedAccessToken = longLivedTokenResponse?.data.access_token;

    const userDetailsResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/insta_details`,
      {
        accessToken: longLivedAccessToken,
      }
    );

    const { user_id, username } = userDetailsResponse.data;

    console.log("access token:", longLivedAccessToken);
    let user = await UserModel.findOne({
      instagramId: user_id,
    });

    if (user) {
      user = await UserModel.findByIdAndUpdate(
        user._id,
        {
          instagramAccessToken: longLivedAccessToken,
          instagramUsername: username,
          instagramId: user_id,
        },
        { new: true }
      );
    } else {
      user = await UserModel.create({
        instagramAccessToken: longLivedAccessToken,
        instagramId: user_id,
        instagramUsername: username,
        automations: [],
      });
    }

    const userData: Partial<IUser> & { _id: string } = {
      _id: user._id.toString(),
      instagramUsername: username,
      instagramId: user_id,
      instagramAccessToken: longLivedAccessToken,
      automations: user.automations || [],
    };

    const response = NextResponse.json({
      user: userData,
      tokenData: {
        access_token: longLivedAccessToken,
        user_id,
      },
    });

    response.cookies.set({
      name: "user_details",
      value: JSON.stringify(userData),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Detailed error:", error);

    return NextResponse.json(error, { status: 500 });
  }
}
