import dbConnect from "@/lib/dbConnect";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import User from "@/models/User";
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        throw new Error("No email found in Instagram profile");
      }

      await dbConnect();

      await User.findOneAndUpdate(
        { email: user.email },
        {
          name: user.name,
          image: user.image || "",
          provider: account?.provider || "google",
        },
        { upsert: true, new: true }
      );

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          throw new Error("User not found in database");
        }

        token.id = dbUser?._id?.toString() || "";
        token.name = dbUser?.name || "";
        token.email = dbUser?.email || "";
        token.image = dbUser?.image || "";
        token.provider = dbUser?.provider || "unknown";
        token.instagramId = dbUser?.instagramId || null;
        token.instagramUsername = dbUser?.instagramUsername || null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.provider = token.provider as string;
        session.user.image = token.image as string;
        session.user.instagramId = token.instagramId as string;
        session.user.instagramUsername = token.instagramUsername as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
