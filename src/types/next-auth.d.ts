import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      provider: string;
      instagramId?: string; // Optional Instagram ID
      instagramUsername?: string; // Optional Instagram username
      accessToken?: string; // Optional Instagram access token
    };
  }

  interface JWT {
    id: string;
    name: string;
    email: string;
    provider: string;
    instagramId?: string; // Optional Instagram ID
    instagramUsername?: string; // Optional Instagram username
    accessToken?: string; // Optional Instagram access token
  }
}
