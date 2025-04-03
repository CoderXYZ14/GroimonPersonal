"use client";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import handleInstagramLogin from "./handleInstagramLogin";

export const usePostAutomation = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  return async () => {
    if (user?.instagramAccessToken) {
      router.push("/dashboard/automation/create");
    } else {
      handleInstagramLogin();
    }
  };
};
