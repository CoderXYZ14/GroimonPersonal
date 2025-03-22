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
    provider: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    email: "",
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

          const userData = {
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            instaId: parsedUser.instagramUsername,
            automationsCreated: response.data.numberOfAutomations,
            profileImage: response.data.image,
            provider: parsedUser.provider,
          };
          setUserData(userData);
          setEditedData({
            name: userData.name,
            email: userData.email,
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent rounded-full blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4">
          <Card className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg max-w-3xl mx-auto overflow-hidden">
            <div className="h-36 bg-gradient-to-r from-purple-600 to-pink-500 relative">
              <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-md">
                {userData.profileImage ? (
                  <Image
                    src={userData.profileImage}
                    alt={userData.name}
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
                  {isEditing && (
                    <>
                      <Button
                        onClick={async () => {
                          try {
                            const userDetails =
                              localStorage.getItem("user_details");
                            if (!userDetails) return;

                            const parsedUser = JSON.parse(userDetails);
                            await axios.post(`/api/update-profile`, {
                              userId: parsedUser._id,
                              ...editedData,
                            });

                            setUserData((prev) => ({
                              ...prev,
                              name: editedData.name,
                              email: editedData.email,
                            }));

                            setIsEditing(false);
                            toast.success("Profile updated successfully!");
                          } catch (error) {
                            console.error("Error updating profile:", error);
                            toast.error("Failed to update profile");
                          }
                        }}
                        className="bg-purple-500 text-white hover:bg-purple-600"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedData({
                            name: userData.name,
                            email: userData.email,
                          });
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
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
                    {userData.provider === "instagram" ? (
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData.name}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-full bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                            {userData.name || "Set your name"}
                          </div>
                        )}
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                        {userData.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Email</span>
                    </div>
                    {userData.provider === "instagram" ? (
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedData.email}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                            {userData.email || "Add your email"}
                          </div>
                        )}
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 h-8">
                        {userData.email}
                      </div>
                    )}
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
