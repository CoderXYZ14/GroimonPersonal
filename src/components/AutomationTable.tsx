"use client";
import { MoreHorizontal, Plus, Loader2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { usePostAutomation } from "@/hooks/usePostAutomation";
import axios from "axios";

interface Automation {
  _id: string;
  name: string;
  postIds: string[];
  keywords: string[];
  message: string;
  enableCommentAutomation: boolean;
  commentMessage: string;
  isFollowed: boolean;
  createdAt: string;
}

export function AutomationTable() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePostAutomation = usePostAutomation();

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const userDetails = JSON.parse(
          localStorage.getItem("user_details") || "{}"
        );
        if (!userDetails?._id) {
          console.error("User ID not found");
          return;
        }

        const { data } = await axios.get(`/api/automations`, {
          params: { userId: userDetails._id },
        });
        setAutomations(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomations();
  }, [setAutomations]);

  const filteredAutomations = automations.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) {
      return;
    }

    try {
      await axios.delete(`/api/automations`, {
        params: { id },
      });

      setAutomations((prev) => prev.filter((auto) => auto._id !== id));
    } catch (error) {
      console.error("Error deleting automation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center ">
        <div className="flex flex-col items-center gap-1.5">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Loading automations...
          </p>
        </div>
      </div>
    );
  }

  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center  px-4">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-lg opacity-75" />
          <div className="relative bg-white dark:bg-gray-800 rounded-full p-3">
            <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h3 className="mt-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Your First Automation
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Start automating your Instagram posts
        </p>

        <Button
          size="sm"
          onClick={handlePostAutomation}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Automation
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 py-1.5 text-sm bg-white dark:bg-gray-800 h-8"
          />
        </div>

        <Button
          size="sm"
          onClick={handlePostAutomation}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white h-8"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New
        </Button>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-2 px-3">
        {filteredAutomations.map((automation) => (
          <div
            key={automation._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {automation.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(automation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[120px]">
                  <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs text-red-600"
                    onClick={() => handleDelete(automation._id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Post IDs
                </p>
                <div className="flex flex-wrap gap-1">
                  {automation.postIds.map((id) => (
                    <span
                      key={id}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {automation.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Comment Automation
                </p>
                <div className="flex flex-col gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center w-fit ${
                      automation.enableCommentAutomation
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {automation.enableCommentAutomation
                      ? "Comments On"
                      : "Comments Off"}
                  </span>
                  {automation.enableCommentAutomation &&
                    automation.commentMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Comment: {automation.commentMessage}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block px-3">
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                <TableHead className="font-medium text-xs py-3">Name</TableHead>
                <TableHead className="font-medium text-xs py-3">
                  Created
                </TableHead>
                <TableHead className="font-medium text-xs py-3">
                  Post IDs
                </TableHead>
                <TableHead className="font-medium text-xs py-3">
                  Keywords
                </TableHead>
                <TableHead className="font-medium text-xs py-3">
                  Message
                </TableHead>
                <TableHead className="font-medium text-xs py-3">
                  Comment Status
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutomations.map((automation) => (
                <TableRow
                  key={automation._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <TableCell className="py-2 text-sm">
                    {automation.name}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-gray-600 dark:text-gray-300">
                    {new Date(automation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {automation.postIds.map((id) => (
                        <span
                          key={id}
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {automation.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 max-w-[150px] truncate text-xs">
                    {automation.message}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center w-fit ${
                          automation.enableCommentAutomation
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {automation.enableCommentAutomation
                          ? "Comments On"
                          : "Comments Off"}
                      </span>
                      {automation.enableCommentAutomation &&
                        automation.commentMessage && (
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                            {automation.commentMessage}
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[120px]">
                        <DropdownMenuItem className="text-xs">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs text-red-600"
                          onClick={() => handleDelete(automation._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
