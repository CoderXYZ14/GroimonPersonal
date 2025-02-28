import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = process.env.;

  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post<InstagramTokenResponse>(
      `https://api.instagram.com/oauth/access_token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      }
    );

    const { access_token, user_id } = tokenResponse.data;

    // Store the access token in the session or database
    // For simplicity, we'll just return it here
    res.redirect(`/dashboard?access_token=${access_token}&user_id=${user_id}`);
  } catch (error) {
    console.error("Error during Instagram OAuth callback:", error);
    res.status(500).json({ error: "Failed to authenticate with Instagram" });
  }
}
