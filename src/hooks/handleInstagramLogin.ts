import { scope } from "@/constants/constants";

const handleInstagramLogin = (redirectAfterAuth?: string) => {
  const appId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const baseRedirectUri = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`;

  // Add the redirect path as a query parameter
  console.log("redirect url", redirectAfterAuth);
  const finalRedirectUri = redirectAfterAuth
    ? `${baseRedirectUri}?redirect=${encodeURIComponent(redirectAfterAuth)}`
    : baseRedirectUri;

  const redirectUri = encodeURIComponent(finalRedirectUri);
  const instaScope = scope.join(",").replace(/,/g, "%2C");

  const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${instaScope}`;

  window.location.href = authUrl;
};

export default handleInstagramLogin;
