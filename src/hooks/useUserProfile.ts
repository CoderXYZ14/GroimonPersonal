import { useState, useEffect } from "react";
import axios from "axios";
import { useAppSelector } from "@/redux/hooks";

interface UserProfileData {
  instaId: string;
  automationsCreated: number;
  profileImage: string;
}

export function useUserProfile() {
  const [userData, setUserData] = useState<UserProfileData>({
    instaId: "",
    automationsCreated: 0,
    profileImage: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!user?.isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [stats, instaDetails] = await Promise.all([
          axios.get(`/api/stats`, {
            params: { userId: user._id, type: "count" },
          }),
          axios.get(`/api/insta_details`, {
            params: {
              userId: user.instagramId,
              accessToken: user.instagramAccessToken,
            },
          }),
        ]);

        setUserData({
          instaId: user.instagramUsername || "",
          automationsCreated: stats.data.totalAutomations,
          profileImage: instaDetails.data.profilePic,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelinkAccount = () => {
    if (!window.confirm("Delink your Instagram account?")) return false;

    setUserData((prev) => ({
      ...prev,
      instaId: "",
      automationsCreated: 0,
    }));
    return true;
  };

  return { userData, isLoading, error, handleDelinkAccount };
}
