"use client";

import { Globe, MoreHorizontal, Plus } from "lucide-react";
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

const automations = [
  {
    id: 1,
    name: "Untitled",
    created: "25 Feb 25 4:35 PM",
    hits: 0,
    keywords: ["send", "dm me", ""],
    dmMessage: "Please ch...",
    autoReplyMessage: "Thank you for...",
    status: true,
  },
];

export function AutomationTable() {
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
            key={automation.id}
            className="p-4 border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{automation.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {automation.created}
                </p>
              </div>
              <div className="flex items-center">
                <Switch checked={automation.status} className="mr-2" />
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Hits</p>
                <p className="font-medium">{automation.hits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {automation.keywords.map(
                    (keyword) =>
                      keyword && (
                        <span
                          key={keyword}
                          className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full"
                        >
                          {keyword}
                        </span>
                      )
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  DM Message
                </p>
                <p className="text-sm">{automation.dmMessage}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto Reply
                </p>
                <p className="text-sm">{automation.autoReplyMessage}</p>
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
              <TableHead className="font-medium">HITS</TableHead>
              <TableHead className="font-medium">KEYWORDS</TableHead>
              <TableHead className="font-medium">DM MESSAGE</TableHead>
              <TableHead className="font-medium">AUTO REPLY MESSAGE</TableHead>
              <TableHead className="font-medium">STATUS</TableHead>
              <TableHead className="text-right font-medium">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {automations.map((automation) => (
              <TableRow
                key={automation.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/70"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{automation.name}</span>
                  </div>
                </TableCell>
                <TableCell>{automation.created}</TableCell>
                <TableCell>{automation.hits}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {automation.keywords.map(
                      (keyword) =>
                        keyword && (
                          <span
                            key={keyword}
                            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        )
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 dark:text-gray-400">
                    {automation.dmMessage}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 dark:text-gray-400">
                    {automation.autoReplyMessage}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch checked={automation.status} />
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
          <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white">
            <Plus className="h-4 w-4 mr-2" /> Create Your First Automation
          </Button>
        </div>
      )}
    </div>
  );
}
