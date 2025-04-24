"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, AlertCircle, Hash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";

const ProfilePage = () => {
  const { userData, isLoading, error, handleDelinkAccount } = useUserProfile();

  const onDelinkAccount = () => {
    const success = handleDelinkAccount();
    if (success) {
      toast.success("Instagram delinked successfully!!");
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error loading profile</p>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="relative overflow-hidden flex items-center justify-center py-12 md:py-20 bg-white dark:bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent rounded-full blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4">
          <Card className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg max-w-3xl mx-auto overflow-hidden">
            <div className="h-36 bg-gradient-to-r from-purple-600 to-pink-500 relative">
              <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-md">
                {userData.profileImage ? (
                  <Image
                    src={userData.profileImage}
                    alt={"Profile pic"}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                    {userData.instaId ? userData.instaId[0].toUpperCase() : "?"}
                  </div>
                )}
              </div>
            </div>

            <CardContent className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row items-start justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData.instaId}
                  </h1>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                  <Button
                    onClick={onDelinkAccount}
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
                      <Instagram className="h-4 w-4 mr-2" />
                      <span>Instagram ID</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                      {userData.instaId || "Not connected"}
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
