"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, AlertCircle, User, Mail, Hash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",

    instaId: "",
    automationsCreated: 0,
    profileImage: "",
  });

  useEffect(() => {
    const updateDetails = async () => {
      const userDetails = localStorage.getItem("user_details");
      if (userDetails) {
        try {
          const parsedUser = JSON.parse(userDetails);
          const response = await axios.get(`/api/get-user-details`, {
            params: { id: parsedUser._id },
          });

          setUserData({
            name: parsedUser.name,
            email: parsedUser.email,
            instaId: parsedUser.instagramUsername,
            automationsCreated: response.data.numberOfAutomations,
            profileImage: response.data.image,
          });
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };
    updateDetails();
  }, []);

  const handleDelinkAccount = () => {
    if (
      window.confirm("Are you sure you want to delink your Instagram account?")
    ) {
      toast.success("Instagram delinked successfully !!");
      setUserData((prev) => ({
        ...prev,
        instaId: "",
        automationsCreated: 0,
      }));
      console.log("Account delinked");
    }
  };

  return (
    <main className="flex-1">
      <div className="relative overflow-hidden flex items-center justify-center py-12 md:py-20 bg-white dark:bg-transparent">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent rounded-full blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4">
          <Card className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg max-w-3xl mx-auto overflow-hidden">
            <div className="h-36 bg-gradient-to-r from-purple-600 to-pink-500 relative">
              <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-md">
                <Image
                  src={userData.profileImage}
                  alt={userData.name}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </div>

            <CardContent className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row items-start justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData.instaId}
                  </h1>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button
                    onClick={handleDelinkAccount}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Delink Instagram Account
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      <span>Name</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8 ">
                      {userData.name}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Email</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                      {userData.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Instagram className="h-4 w-4 mr-2" />
                      <span>Instagram ID</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                      {userData.instaId}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Hash className="h-4 w-4 mr-2" />
                      <span>Total Automations</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 font-medium h-8">
                      {userData.automationsCreated} automations created
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
