"use client";
import { useRouter } from "next/navigation";

import handleInstagramLogin from "./handleInstagramLogin";

export const usePostAutomation = () => {
  const router = useRouter();

  return async () => {
    const userDetail = JSON.parse(localStorage.getItem("user_details"));
    const instagramAccessToken = userDetail?.instagramAccessToken;

    if (instagramAccessToken) {
      router.push("/dashboard/automation/create");
    } else {
      handleInstagramLogin();
    }
  };
};
