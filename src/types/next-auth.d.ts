import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      provider: string;
    };
  }

  interface JWT {
    id: string;
    name: string;
    email: string;
    provider: string;
  }
}
