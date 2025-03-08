import { scope } from "@/constants/constants";

const useHandleInstagramLogin = () => {
  const appId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/your_insta_token`
  );
  console.log("redirectUri", redirectUri);
  const instaScope = scope.join(",").replace(/,/g, "%2C");

  const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${instaScope}`;
  console.log("authUrl", authUrl);
  window.location.href = authUrl;
};

export default useHandleInstagramLogin;
