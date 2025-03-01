export default async function getUserInfo(userId: string, accessToken: string) {
  const url = `https://graph.instagram.com/v21.0/${userId}`;
  const params = {
    fields:
      "id,name,profile_pic,username,follower_count,is_business_follow_user,is_user_follow_business,is_verified_user",
    access_token: accessToken,
  };

  try {
    const response = await fetch(`${url}?${new URLSearchParams(params)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("User Info:", JSON.stringify(data, null, 4));
    return data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}
