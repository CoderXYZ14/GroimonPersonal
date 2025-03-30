"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import handleInstagramLogin from "./handleInstagramLogin";

export const usePostAutomation = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  return async () => {
    // Store current path for redirect after auth
    document.cookie = `redirectTo=/dashboard/automation/create; path=/; max-age=3600`;

    if (user?.instagramAccessToken) {
      // User has Instagram connected, proceed to create automation
      router.push("/dashboard/automation/create");
    } else if (user?.provider === "google") {
      // Google user needs to connect Instagram
      router.push("/signin/insta");
    } else {
      // New user needs to authenticate with Instagram
      handleInstagramLogin();
    }
  };
};
