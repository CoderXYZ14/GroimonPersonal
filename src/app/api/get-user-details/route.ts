import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import axios from "axios";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  await dbConnect();
  try {
    const user = await UserModel.findById(id).populate("automations");

    const instaResponse = await axios.get(`https://graph.instagram.com/me`, {
      params: {
        fields: "id,username,account_type,media_count,profile_picture_url",
        access_token: user.instagramAccessToken,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const { profile_picture_url } = instaResponse.data;
    const response = {
      numberOfAutomations: user.automations.length,
      profileImage: profile_picture_url,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server error", error }), {
      status: 500,
    });
  }
}
