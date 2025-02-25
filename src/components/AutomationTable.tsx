"use client";

import { Globe, MoreHorizontal } from "lucide-react";
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
    keywords: ["send", "dm me", "dbk"],
    dmMessage: "Please ch...",
    autoReplyMessage: "Thank you for...",
    status: true,
  },
];

export function AutomationTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NAME</TableHead>
            <TableHead>CREATED</TableHead>
            <TableHead>HITS</TableHead>
            <TableHead>KEYWORDS</TableHead>
            <TableHead>DM MESSAGE</TableHead>
            <TableHead>AUTO REPLY MESSAGE</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {automations.map((automation) => (
            <TableRow key={automation.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {automation.name}
                </div>
              </TableCell>
              <TableCell>{automation.created}</TableCell>
              <TableCell>{automation.hits}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {automation.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-secondary px-2 py-1 text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>{automation.dmMessage}</TableCell>
              <TableCell>{automation.autoReplyMessage}</TableCell>
              <TableCell>
                <Switch checked={automation.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
