"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";

import axios from "axios";
import Image from "next/image";

interface Registration {
  _id: string;
  user: {
    _id: string;
    instagramUsername: string;
    instaProfilePic: string;
    instagramAccessToken?: string;
  };
  status: "pending" | "approved" | "rejected";
  registrationTime: string;
  followerCount?: number;
  followsCount?: number;
  mediaCount?: number;
  accountType?: string;
  biography?: string;
  website?: string;
  name?: string;
  profilePictureUrl?: string;
  rejectionReason?: string;
  instaData?: {
    username?: string;
    profile_picture_url?: string;
    media_count?: number;
    account_type?: string;
    followers_count?: number;
    follows_count?: number;
    biography?: string;
    website?: string;
    name?: string;
  };
}

const IplRegistrationsAdminPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingBulk, setProcessingBulk] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = filter !== "all" ? `?status=${filter}` : "";
      // Use the dedicated admin API endpoint
      const response = await axios.get(
        `/api/admin/ipl-registration${statusParam}`
      );

      // The Instagram data is now fetched directly in the admin API
      if (response.data.registrations && response.data.registrations.length > 0) {
        setRegistrations(response.data.registrations);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleBulkApprove = async () => {
    if (selectedRegistrations.length === 0) return;
    
    try {
      setProcessingBulk(true);
      const response = await axios.put("/api/admin/ipl-registration", {
        registrationIds: selectedRegistrations,
        action: "approve"
      });

      if (response.status === 200) {
        toast.success(`${selectedRegistrations.length} registrations approved successfully`);
        setSelectedRegistrations([]);
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error approving registrations:", error);
      toast.error("Failed to approve registrations");
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRegistrations.length === 0) return;
    
    try {
      setProcessingBulk(true);
      const response = await axios.put("/api/admin/ipl-registration", {
        registrationIds: selectedRegistrations,
        action: "reject"
      });

      if (response.status === 200) {
        toast.success(`${selectedRegistrations.length} registrations rejected successfully`);
        setSelectedRegistrations([]);
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error rejecting registrations:", error);
      toast.error("Failed to reject registrations");
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pendingIds = registrations
        .filter(reg => reg.status === "pending")
        .map(reg => reg._id);
      setSelectedRegistrations(pendingIds);
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const response = await axios.put("/api/admin/ipl-registration", {
        registrationId: id,
        action: "approve",
      });

      if (response.status === 200) {
        toast.success("Registration approved successfully");
        // Refresh the data to get updated information
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error approving registration:", error);
      toast.error("Failed to approve registration");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      
      const response = await axios.put("/api/admin/ipl-registration", {
        registrationId: id,
        action: "reject"
      });

      if (response.status === 200) {
        toast.success("Registration rejected successfully");
        // Refresh the data to get updated information
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error rejecting registration:", error);
      toast.error("Failed to reject registration");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && registrations.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading registrations...
          </p>
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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              IPL Event Registrations
            </CardTitle>
            <CardDescription>
              Manage influencer registrations for the IPL event
            </CardDescription>
            <div className="flex space-x-2 mt-4">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
              >
                Approved
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
              >
                Rejected
              </Button>
            </div>
            {selectedRegistrations.length > 0 && (
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                  onClick={handleBulkApprove}
                  disabled={processingBulk || selectedRegistrations.length === 0}
                >
                  <Check className="h-4 w-4" />
                  Approve Selected ({selectedRegistrations.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleBulkReject}
                  disabled={processingBulk || selectedRegistrations.length === 0}
                >
                  <X className="h-4 w-4" />
                  Reject Selected ({selectedRegistrations.length})
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No registrations found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedRegistrations.length > 0 &&
                            selectedRegistrations.length ===
                              registrations.filter((r) => r.status === "pending").length
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Instagram Username</TableHead>
                      <TableHead className="text-center">Followers</TableHead>
                      <TableHead className="text-center">Following</TableHead>
                      <TableHead className="text-center">Media Count</TableHead>
                      <TableHead className="text-center">
                        Account Type
                      </TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration._id}>
                        <TableCell className="w-12">
                          {registration.status === "pending" && (
                            <input
                              type="checkbox"
                              checked={selectedRegistrations.includes(registration._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRegistrations([...selectedRegistrations, registration._id]);
                                } else {
                                  setSelectedRegistrations(
                                    selectedRegistrations.filter((id) => id !== registration._id)
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {registration.profilePictureUrl ||
                            registration.user.instaProfilePic ? (
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <Image
                                  src={
                                    registration.profilePictureUrl ||
                                    registration.user.instaProfilePic
                                  }
                                  alt={
                                    registration.name ||
                                    registration.user.instagramUsername
                                  }
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-bold">
                                  {registration.user.instagramUsername
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">
                                {registration.user.instagramUsername}
                              </span>
                              {registration.name &&
                                registration.name !==
                                  registration.user.instagramUsername && (
                                  <p className="text-xs text-gray-500">
                                    {registration.name}
                                  </p>
                                )}
                              {registration.biography && (
                                <button
                                  className="text-xs text-blue-500 hover:underline"
                                  onClick={() =>
                                    window.alert(
                                      `Bio: ${registration.biography}`
                                    )
                                  }
                                >
                                  View Bio
                                </button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {registration.followerCount
                            ? registration.followerCount.toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {registration.followsCount
                            ? registration.followsCount.toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {registration.mediaCount || "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {registration.accountType ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {registration.accountType}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            registration.registrationTime
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              registration.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : registration.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {registration.status.charAt(0).toUpperCase() +
                              registration.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {registration.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleApprove(registration._id)}
                                disabled={processingId === registration._id}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleReject(registration._id)}
                                disabled={processingId === registration._id}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}

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
    </main>
  );
};

export default IplRegistrationsAdminPage;
