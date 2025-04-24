"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";

const IplRegistrationPage = () => {
  const { userData, isLoading, error } = useUserProfile();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(
    null
  );
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        setCheckingStatus(true);
        const userDetails = localStorage.getItem("user_details");
        if (!userDetails || !userData?.instaId) {
          setCheckingStatus(false);
          return;
        }

        const parsedUser = JSON.parse(userDetails);
        const response = await fetch(
          `/api/ipl-registration?userId=${parsedUser._id}`
        );
        const data = await response.json();

        if (data.registrations && data.registrations.length > 0) {
          // Get the most recent registration
          const latestRegistration = data.registrations[0];
          setRegistrationStatus(latestRegistration.status);
        } else {
          setRegistrationStatus(null);
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (userData?.instaId) {
      checkRegistrationStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [userData]);

  const handleRegister = async () => {
    if (!userData?.instaId) {
      toast.error("You must connect your Instagram account first!");
      return;
    }

    try {
      setSubmitting(true);
      // Get user details from local storage
      const userDetails = localStorage.getItem("user_details");
      if (!userDetails) {
        toast.error("User details not found");
        return;
      }

      const parsedUser = JSON.parse(userDetails);

      const response = await fetch("/api/ipl-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parsedUser._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit registration");
      }

      toast.success("Registration submitted successfully!");
      setRegistrationStatus("pending");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || checkingStatus) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
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

  if (!userData?.instaId) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>IPL Event Registration</CardTitle>
              <CardDescription>
                You need to connect your Instagram account first to register for
                the IPL event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                <p className="text-center mb-6">
                  Please connect your Instagram account in your profile before
                  registering for the IPL event.
                </p>
                <Button onClick={() => router.push("/profile")}>
                  Go to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="relative overflow-hidden flex items-center justify-center py-12 md:py-20 bg-white dark:bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Card className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                IPL Event Registration
              </CardTitle>
              <CardDescription>
                Register as an influencer for the upcoming IPL event. Your
                Instagram follower count and profile information will be used
                for evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                {registrationStatus === "approved" ? (
                  <>
                    <PartyPopper className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-green-600 mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-center mb-6">
                      Your registration for the IPL event has been approved.
                      Check your ranking on the leaderboard and compete with
                      other influencers!
                    </p>
                    <div className="flex flex-col space-y-3 w-full max-w-md">
                      <Button
                        onClick={() => router.push("/ipl-leaderboard")}
                        className="w-full"
                        size="lg"
                      >
                        View Leaderboard
                      </Button>
                      <Button
                        onClick={() =>
                          router.push("/dashboard/automation?type=post")
                        }
                        className="w-full"
                        variant="outline"
                        size="lg"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </>
                ) : registrationStatus === "pending" ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-amber-500 mb-4" />
                    <h3 className="text-xl font-bold text-amber-600 mb-2">
                      Registration Pending
                    </h3>
                    <p className="text-center mb-6">
                      Your registration for the IPL event has been submitted and
                      is pending approval. We&apos;ll notify you once it&apos;s
                      approved.
                    </p>
                    <Button
                      onClick={() =>
                        router.push("/dashboard/automation?type=post")
                      }
                      className="w-full max-w-md"
                      variant="outline"
                      size="lg"
                    >
                      Go to Dashboard
                    </Button>
                  </>
                ) : registrationStatus === "rejected" ? (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-600 mb-2">
                      Registration Rejected
                    </h3>
                    <p className="text-center mb-6">
                      Unfortunately, your registration for the IPL event has
                      been rejected. Please contact support for more
                      information.
                    </p>
                    <Button
                      onClick={() =>
                        router.push("/dashboard/automation?type=post")
                      }
                      className="w-full max-w-md"
                      variant="outline"
                      size="lg"
                    >
                      Go to Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-center mb-6">
                      Click the button below to register for the IPL event. Your
                      Instagram account information will be used for the
                      registration.
                    </p>
                    <Button
                      onClick={handleRegister}
                      className="w-full max-w-md"
                      disabled={submitting}
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Registering...
                        </>
                      ) : (
                        "Register for IPL Event"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default IplRegistrationPage;
