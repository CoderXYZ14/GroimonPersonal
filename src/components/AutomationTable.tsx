import { MoreHorizontal, Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Automation {
  _id: string;
  name: string;
  postIds: string[];
  keywords: string[];
  message: string;
  createdAt: string;
}

export function AutomationTable() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Fetch automations for the current user
  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const userId = session?.user?.id;

        if (!userId) {
          // Early return if the user is not logged in
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/automations", {
          headers: {
            "user-id": userId, // Pass user ID in headers
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch automations");
        }

        const data = await response.json();
        setAutomations(data);
      } catch (error) {
        console.error("Error fetching automations:", error);
        setError("Failed to fetch automations");
      } finally {
        setLoading(false);
      }
    };

    fetchAutomations();
  }, [session?.user?.id]);

  // Generate a random 8-digit post ID if postIds is empty
  const generateRandomPostId = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-t-purple-500 border-b-purple-300 border-l-purple-300 border-r-purple-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 sm:mb-0">
          Your Automations
        </h3>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden">
        {automations.map((automation) => (
          <div
            key={automation._id}
            className="p-4 border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{automation.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(automation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <Switch checked={true} className="mr-2" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Post IDs
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {automation.postIds.length > 0
                    ? automation.postIds.map((postId) => (
                        <span
                          key={postId}
                          className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full"
                        >
                          {postId}
                        </span>
                      ))
                    : generateRandomPostId()}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {automation.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Message
                </p>
                <p className="text-sm">{automation.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="font-medium">NAME</TableHead>
              <TableHead className="font-medium">CREATED</TableHead>
              <TableHead className="font-medium">POST IDS</TableHead>
              <TableHead className="font-medium">KEYWORDS</TableHead>
              <TableHead className="font-medium">MESSAGE</TableHead>
              <TableHead className="text-right font-medium">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {automations.map((automation) => (
              <TableRow
                key={automation._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/70"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{automation.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(automation.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {automation.postIds.length > 0
                      ? automation.postIds.map((postId) => (
                          <span
                            key={postId}
                            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full"
                          >
                            {postId}
                          </span>
                        ))
                      : generateRandomPostId()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {automation.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 dark:text-gray-400">
                    {automation.message}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    >
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700">
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

      {automations.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No automations found
          </p>
          <Link href="/dashboard/automation/create">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Your First Automation
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
