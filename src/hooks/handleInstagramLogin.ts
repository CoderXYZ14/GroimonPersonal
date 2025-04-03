import { scope } from "@/constants/constants";

const handleInstagramLogin = () => {
  document.cookie =
    "user_details=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  const appId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`;

  const instaScope = scope.join(",").replace(/,/g, "%2C");

  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem("instagram_auth_state", state);

  const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${instaScope}&state=${state}`;

  window.location.href = authUrl;
};

export default handleInstagramLogin;
