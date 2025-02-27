import { cookies } from "next/headers";

// Function to get the current session (access token)
export async function getSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  return { accessToken };
}

// Function to set the session (access token)
export async function setSession(accessToken: string, userId: string) {
  const cookieStore = cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  cookieStore.set("user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

// Function to clear the session (logout)
export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("user_id");
}
