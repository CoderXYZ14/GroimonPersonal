"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Trophy, Medal, Award } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface LeaderboardItem {
  registrationId: string;
  userId: string;
  username: string;
  profilePicture: string | null;
  automationCount: number;
  hitCount: number;
  redirectCount: number;
  registrationDate: string;
  followerCount: number;
  followsCount?: number;
  mediaCount?: number;
  accountType?: string;
  biography?: string;
  website?: string;
  name?: string;
}

const IPLLeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/ipl-leaderboard");
        setLeaderboard(response.data.leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{index + 1}</span>
          </div>
        );
    }
  };

  const getRowStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500";
      case 1:
        return "bg-gray-50 dark:bg-gray-800/30 border-l-4 border-gray-400";
      case 2:
        return "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-700";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error</p>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="relative overflow-hidden flex items-center justify-center py-12 md:py-20 bg-white dark:bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-300/10 to-transparent dark:from-purple-900/30 dark:via-pink-900/20 dark:to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Card className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">IPL Event Leaderboard</CardTitle>
              <CardDescription className="text-center text-lg">
                Top performing influencers ranked by engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No participants found in the leaderboard yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Influencer</TableHead>
                        <TableHead className="text-center">Followers</TableHead>
                        <TableHead className="text-center">Following</TableHead>
                        <TableHead className="text-center">Media</TableHead>
                        <TableHead className="text-center">Automations</TableHead>
                        <TableHead className="text-center">Hit Count</TableHead>
                        <TableHead className="text-center">Redirect Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((item, index) => (
                        <TableRow key={item.registrationId} className={getRowStyle(index)}>
                          <TableCell className="font-medium">
                            <div className="flex items-center justify-center">
                              {getRankIcon(index)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {item.profilePicture ? (
                                  <Image
                                    src={item.profilePicture}
                                    alt={item.username}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-bold">
                                    {item.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{item.name || item.username}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  @{item.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Joined {new Date(item.registrationDate).toLocaleDateString()}
                                </p>
                                {item.accountType && (
                                  <span className="inline-block px-2 py-0.5 mt-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                    {item.accountType}
                                  </span>
                                )}
                                {item.biography && (
                                  <button 
                                    className="text-xs text-blue-500 hover:underline mt-1 block"
                                    onClick={() => window.alert(`Bio: ${item.biography}`)}
                                  >
                                    View Bio
                                  </button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {item.followerCount ? item.followerCount.toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.followsCount ? item.followsCount.toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.mediaCount ? item.mediaCount.toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">{item.automationCount}</TableCell>
                          <TableCell className="text-center font-bold">
                            {index < 3 ? (
                              <span className={`
                                ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}
                                ${index === 1 ? 'text-gray-600 dark:text-gray-300' : ''}
                                ${index === 2 ? 'text-amber-700 dark:text-amber-500' : ''}
                              `}>
                                {item.hitCount.toLocaleString()}
                              </span>
                            ) : (
                              item.hitCount.toLocaleString()
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.redirectCount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default IPLLeaderboardPage;
