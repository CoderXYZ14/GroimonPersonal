"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearUser } from "@/redux/features/userSlice";
import axios from "axios";
import Link from "next/link";

const AvatarDropdown = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (user && user.instagramId && user.instagramAccessToken) {
        try {
          const response = await axios.get(
            `/api/insta_details?userId=${user.instagramId}&accessToken=${user.instagramAccessToken}`
          );

          if (response.data && response.data.profilePic) {
            setProfileImage(response.data.profilePic);
          }
        } catch (error) {
          console.error("Error fetching Instagram profile picture:", {
            error,
            message: error.response?.data || error.message,
            userId: user.instagramId,
            hasToken: !!user.instagramAccessToken,
          });

          try {
            const fallbackResponse = await axios.get(
              `/api/get-user-details?id=${user._id}`
            );
            if (fallbackResponse.data && fallbackResponse.data.profileImage) {
              setProfileImage(fallbackResponse.data.profileImage);
            }
          } catch (fallbackError) {
            console.error(
              "Error with fallback profile picture fetch:",
              fallbackError
            );
          }
        }
      }
    };

    fetchProfilePic();
  }, [user]);

  const handleSignOut = async () => {
    // Clear localStorage items
    localStorage.removeItem("instagram_token");
    localStorage.removeItem("user_details");

    // Clear cookies
    document.cookie =
      "user_details=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "redirectTo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    dispatch(clearUser());

    // Clear Redux persist state
    if (typeof window !== "undefined") {
      localStorage.removeItem("persist:root");
    }

    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer rounded-full transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          {profileImage ? (
            <AvatarImage
              src={profileImage}
              alt={user.instagramUsername || "User"}
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold animate-in zoom-in">
              {user.instagramUsername
                ? user.instagramUsername.charAt(0).toUpperCase()
                : "I"}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 mt-2 p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 backdrop-blur-lg animate-in slide-in-from-top-2"
      >
        <div className="px-3 py-2 mb-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {user.instagramUsername || "Instagram User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Connected via Instagram
          </p>
        </div>

        <Link href="/profile">
          <DropdownMenuItem className="flex items-center gap-3 cursor-pointer text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 transition-all duration-200">
            <div className="flex-1">Profile</div>
          </DropdownMenuItem>
        </Link>

        <div className="h-px bg-gray-300 dark:bg-gray-600 my-2" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-3 cursor-pointer text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 rounded-md px-3 py-2 transition-all duration-200"
        >
          <div className="flex-1">Logout</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
