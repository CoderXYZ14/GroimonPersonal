import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      provider: string;
      image: string;
      instagramId?: string; // Optional Instagram ID
      instagramUsername?: string; // Optional Instagram username
    };
  }

  interface JWT {
    id: string;
    name: string;
    email: string;
    provider: string;
    image: string;
    instagramId?: string; // Optional Instagram ID
    instagramUsername?: string; // Optional Instagram username
  }
}
