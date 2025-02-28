import dbConnect from "@/lib/dbConnect";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import InstagramProvider from "next-auth/providers/instagram";
import User from "@/models/User"; // Import the updated User model

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // InstagramProvider({
    //   clientId: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID as string,
    //   clientSecret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET as string,
    //   authorization: {
    //     url: "https://api.instagram.com/oauth/authorize",
    //     params: {
    //       client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID as string,
    //       redirect_uri:
    //         process.env.NEXT_PUBLIC_NEXTAUTH_URLL + "/api/auth/callback/instagram",
    //       response_type: "code",
    //       scope:
    //         "instagram_basic,instagram_manage_messages,instagram_manage_comments,instagram_content_publish,business_management",
    //     },
    //   },
    //   token: {
    //     url: "https://api.instagram.com/oauth/access_token",
    //     async request({ client, params }) {
    //       const response = await client.post(
    //         "https://api.instagram.com/oauth/access_token",
    //         {
    //           form: {
    //             client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID,
    //             client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET,
    //             grant_type: "authorization_code",
    //             redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URLL}/api/auth/callback/instagram`,
    //             code: params.code,
    //           },
    //         }
    //       );
    //       return { tokens: response.data };
    //     },
    //   },
    //   userinfo: {
    //     url: "https://graph.instagram.com/me?fields=id,username",
    //     async request({ client, tokens }) {
    //       const response = await client.get("https://graph.instagram.com/me", {
    //         params: {
    //           access_token: tokens.access_token,
    //         },
    //       });
    //       return response.data;
    //     },
    //   },
    //   profile(profile) {
    //     return {
    //       id: profile.id,
    //       name: profile.username,
    //       image: `https://instagram.com/${profile.username}/profile_pic`,
    //     };
    //   },
    // }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        throw new Error("No email found in Instagram profile");
      }

      await dbConnect();

      let instagramData = {};
      if (account?.provider === "instagram" && account?.access_token) {
        try {
          const response = await fetch(
            `https://graph.instagram.com/me?fields=id,username&access_token=${account.access_token}`
          );
          const data = await response.json();

          if (data.error) {
            throw new Error(data.error.message);
          }

          instagramData = {
            instagramId: data.id,
            instagramUsername: data.username,
          };
        } catch (error) {
          console.error("Instagram API Error:", error);
          throw new Error("Failed to fetch Instagram data");
        }
      }

      // Save or update user in MongoDB
      await User.findOneAndUpdate(
        { email: user.email },
        {
          name: user.name,
          image: user.image || "",
          provider: account?.provider || "google",
          ...instagramData, // Store Instagram data
          accessToken: account?.access_token || null, // Store Instagram access token
        },
        { upsert: true, new: true }
      );

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          throw new Error("User not found in database");
        }

        token.id = dbUser?._id?.toString() || "";
        token.name = dbUser?.name || "";
        token.email = dbUser?.email || "";
        token.provider = dbUser?.provider || "unknown";
        token.instagramId = dbUser?.instagramId || null;
        token.instagramUsername = dbUser?.instagramUsername || null;
        token.accessToken = dbUser?.accessToken || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.provider = token.provider as string;
        session.user.instagramId = token.instagramId as string;
        session.user.instagramUsername = token.instagramUsername as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
