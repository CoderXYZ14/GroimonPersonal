import { useState, useEffect } from "react";
import axios from "axios";

interface UserProfileData {
  instaId: string;
  automationsCreated: number;
  profileImage: string;
  provider: string;
}

export function useUserProfile() {
  const [userData, setUserData] = useState<UserProfileData>({
    instaId: "",
    automationsCreated: 0,
    profileImage: "",
    provider: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(null);

      const userDetails = localStorage.getItem("user_details");
      if (!userDetails) {
        setIsLoading(false);
        setError("User details not found");
        return;
      }

      try {
        const parsedUser = JSON.parse(userDetails);
        const response = await axios.get(`/api/get-user-details`, {
          params: { id: parsedUser._id },
        });

        const userData = {
          instaId: parsedUser.instagramUsername,
          automationsCreated: response.data.numberOfAutomations,
          profileImage: response.data.profileImage,
          provider: parsedUser.provider,
        };

        setUserData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleDelinkAccount = () => {
    if (
      window.confirm("Are you sure you want to delink your Instagram account?")
    ) {
      setUserData((prev) => ({
        ...prev,
        instaId: "",
        automationsCreated: 0,
      }));
      return true;
    }
    return false;
  };

  return {
    userData,
    isLoading,
    error,
    handleDelinkAccount,
  };
}
