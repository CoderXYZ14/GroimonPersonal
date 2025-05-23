"use client";
import {
  MoreHorizontal,
  Plus,
  Loader2,
  Search,
  User2,
  Zap,
  Star,
  Globe,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { Automation } from "@/types/type";

// Types
interface Button {
  url: string;
  buttonText: string;
}

// Badge Component
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) => {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantStyles = {
    default: "bg-[#1A69DD] text-white",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    outline:
      "border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900",
  };

  return (
    <span className={`${baseStyles} ${className} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};

// Loading Component
const LoadingState = () => (
  <div className="flex items-center justify-center h-60">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#1A69DD]/20 to-[#26A5E9]/20 blur-md animate-pulse" />
        <Loader2 className="relative h-8 w-8 animate-spin text-[#1A69DD] dark:text-[#26A5E9]" />
      </div>
      <p className="text-base text-gray-600 dark:text-gray-400">
        Loading your automations...
      </p>
    </div>
  </div>
);

// Not Authenticated Component
const NotAuthenticatedState = () => (
  <div className="flex flex-col items-center justify-center h-60 space-y-4">
    <div className="relative">
      <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#1A69DD]/20 to-[#26A5E9]/20 blur-lg opacity-75" />
      <div className="relative p-4 rounded-full bg-gradient-to-r from-[#1A69DD]/10 to-[#26A5E9]/10">
        <User2 className="w-8 h-8 text-[#1A69DD] dark:text-[#26A5E9]" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent">
        Instagram Account Required
      </h3>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
        Connect your Instagram account to create automations
      </p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({
  type,
  onCreateNew,
}: {
  type: string;
  onCreateNew: () => void;
}) => (
  <div className="flex flex-col items-center justify-center h-60 px-4 space-y-5">
    <div className="relative">
      <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#1A69DD]/20 to-[#26A5E9]/20 blur-lg opacity-75" />
      <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
        <Zap className="h-6 w-6 text-[#1A69DD] dark:text-[#26A5E9]" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent">
        No Automations Yet
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Create your first {type === "post" ? "Post" : "Story"} Automation
      </p>
    </div>
    <Button
      onClick={onCreateNew}
      className="bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white shadow-lg hover:shadow-[#1A69DD]/30 group relative overflow-hidden"
    >
      <span className="absolute -left-16 top-0 h-full w-16 bg-white opacity-10 transform -skew-x-12 transition-all duration-200 ease-out group-hover:translate-x-56" />
      <Plus className="relative z-10 stroke-[2] h-4 w-4" />
      <span className="relative z-10 font-semibold">
        {type === "post" ? "Create Post Automation" : "Create Story Automation"}
      </span>
    </Button>
  </div>
);

// Search Not Found Component
const SearchNotFound = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Search className="h-8 w-8 text-gray-400 mb-3" />
    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
      No automations found
    </h4>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      Try adjusting your search or create a new automation
    </p>
  </div>
);

// Search and Header Component
const SearchHeader = ({
  searchTerm,
  onSearchChange,
  onCreateNew,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
  type: string;
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search automations..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      />
    </div>
    <Button
      onClick={onCreateNew}
      className="w-full sm:w-auto bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] hover:from-[#166dbd] hover:to-[#1e99c7] text-white shadow-lg hover:shadow-[#1A69DD]/30"
    >
      <Plus className="h-4 w-4" /> New Automation
    </Button>
  </div>
);

// Keywords Display Component
const KeywordsDisplay = ({ automation }: { automation: Automation }) => {
  if (automation.respondToAll) {
    return (
      <Badge
        variant="outline"
        className="text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900 flex items-center gap-1"
      >
        <MessageCircle className="h-3 w-3" />
        <span>Responds to all messages</span>
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {automation.keywords.map((keyword) => (
        <Badge
          key={keyword}
          variant="outline"
          className="text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900"
        >
          {keyword}
        </Badge>
      ))}
    </div>
  );
};

// Table Keywords Display Component (with limit)
const TableKeywordsDisplay = ({ automation }: { automation: Automation }) => {
  if (automation.respondToAll) {
    return (
      <div className="flex items-center">
        <Badge
          variant="outline"
          className="text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900 flex items-center gap-1"
        >
          <MessageCircle className="h-3 w-3" />
          <span>Responds to all messages</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {automation.keywords.slice(0, 3).map((keyword) => (
        <Badge
          key={keyword}
          variant="outline"
          className="text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900"
        >
          {keyword}
        </Badge>
      ))}
      {automation.keywords.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{automation.keywords.length - 3}
        </Badge>
      )}
    </div>
  );
};

// Message Type Display Component
const MessageTypeDisplay = ({ automation }: { automation: Automation }) => {
  if (automation.messageType === "message") {
    return automation.message;
  }

  if (automation.messageType === "ButtonText") {
    if (automation.buttons && automation.buttons.length > 0) {
      return (
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-md border border-blue-200 dark:border-blue-800">
            <Star className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
              {automation.buttonTitle}
            </span>
          </div>
        </div>
      );
    }
    return (
      <span className="text-gray-400 dark:text-gray-500 italic text-xs">
        No button content
      </span>
    );
  }

  if (automation.messageType === "ButtonImage") {
    if (automation.buttons && automation.buttons.length > 0) {
      return (
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-800/30 rounded-md border border-purple-200 dark:border-indigo-800">
            <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-purple-400 to-indigo-500"></div>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">
              Image: {automation.buttonTitle}
            </span>
          </div>
        </div>
      );
    }
    return (
      <span className="text-gray-400 dark:text-gray-500 italic text-xs">
        No image button content
      </span>
    );
  }

  return automation.message;
};

// Auto Reply Status Component
const AutoReplyStatus = ({ automation }: { automation: Automation }) => (
  <div className="flex flex-col gap-1.5">
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center w-fit ${
        automation.enableCommentAutomation
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
      }`}
    >
      {automation.enableCommentAutomation ? "Enabled" : "Disabled"}
    </span>
    <div className="flex flex-wrap gap-1.5">
      {automation.enableCommentAutomation &&
        automation.commentMessage.slice(0, 2).map((comment) => (
          <Badge
            key={comment}
            variant="outline"
            className="text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900"
          >
            {comment}
          </Badge>
        ))}
      {automation.commentMessage.length > 2 && (
        <Badge variant="outline" className="text-xs">
          +{automation.commentMessage.length - 2}
        </Badge>
      )}
    </div>
  </div>
);

// Mobile Auto Reply Component
const MobileAutoReply = ({ automation }: { automation: Automation }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
      Auto Reply
    </p>
    <div className="flex items-center gap-3">
      <Switch
        checked={automation.enableCommentAutomation}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
      />
      <span className="text-sm">
        {automation.enableCommentAutomation ? "Enabled" : "Disabled"}
      </span>
    </div>
    {automation.enableCommentAutomation && (
      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
        &quot;{automation.commentMessage}&quot;
      </p>
    )}
  </div>
);

// Stats Card Component
const StatsCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
      {label}
    </p>
    <p className="font-semibold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

// Action Dropdown Component
const ActionDropdown = ({
  automation,
  onEdit,
  onDelete,
  onViewInInstagram,
}: {
  automation: Automation;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewInInstagram: (postId: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-[160px]">
      {automation.postIds && automation.postIds.length === 1 && (
        <DropdownMenuItem
          onClick={() => onViewInInstagram(automation.postIds[0])}
          className="text-blue-600 focus:text-blue-600 dark:text-blue-400"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View in Instagram
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => onEdit(automation._id)}>
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-red-600 focus:text-red-600 dark:text-red-400"
        onClick={() => onDelete(automation._id)}
      >
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Mobile Card Component
const MobileAutomationCard = ({
  automation,
  type,
  onEdit,
  onDelete,
  onViewInInstagram,
  onToggleActive,
}: {
  automation: Automation;
  type: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewInInstagram: (postId: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {automation.postIds && automation.postIds.length !== 1 && (
              <span
                className="inline-flex items-center"
                title="Applied to all posts"
              >
                <Globe className="inline-block ml-1 h-4 w-4 text-blue-500" />
              </span>
            )}
            {automation.name}
          </h4>
          <Badge
            variant={automation.isActive ? "default" : "secondary"}
            className="text-xs h-5"
          >
            {automation.isActive ? "Active" : "Paused"}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Created {new Date(automation.createdAt).toLocaleDateString()}
        </p>
      </div>
      <ActionDropdown
        automation={automation}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewInInstagram={onViewInInstagram}
      />
    </div>

    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatsCard label="DM Count" value={automation.hitCount} />
        <StatsCard label="Link Clicks" value={automation.redirectCount} />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Keywords
        </p>
        <KeywordsDisplay automation={automation} />
      </div>

      {type === "post" && <MobileAutoReply automation={automation} />}

      <div className="pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Status
          </span>
          <Switch
            checked={automation.isActive}
            onCheckedChange={() =>
              onToggleActive(automation._id, automation.isActive)
            }
            className="data-[state=checked]:bg-[#1A69DD] data-[state=unchecked]:bg-gray-200"
          />
        </div>
      </div>
    </div>
  </div>
);

// Desktop Table Row Component
const DesktopTableRow = ({
  automation,
  type,
  onEdit,
  onDelete,
  onViewInInstagram,
  onToggleActive,
}: {
  automation: Automation;
  type: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewInInstagram: (postId: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}) => (
  <TableRow className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
    <TableCell className="pl-6 py-4 font-medium">
      <div className="flex items-center gap-2">
        {automation.postIds && automation.postIds.length !== 1 && (
          <span
            className="inline-flex items-center"
            title="Applied to all posts"
          >
            <Globe className="h-4 w-4 text-blue-500" />
          </span>
        )}
        {automation.name}
      </div>
    </TableCell>
    <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-400">
      {new Date(automation.createdAt).toLocaleDateString()}
    </TableCell>
    <TableCell className="py-4 font-medium">{automation.hitCount}</TableCell>
    <TableCell className="py-4 font-medium">
      {automation.redirectCount}
    </TableCell>
    <TableCell className="py-4">
      <TableKeywordsDisplay automation={automation} />
    </TableCell>
    <TableCell className="py-4 max-w-[180px] truncate text-sm">
      <MessageTypeDisplay automation={automation} />
    </TableCell>
    {type === "post" && (
      <TableCell className="py-4">
        <AutoReplyStatus automation={automation} />
      </TableCell>
    )}
    <TableCell className="py-4">
      <div className="flex items-center justify-center">
        <Switch
          checked={automation.isActive}
          onCheckedChange={() =>
            onToggleActive(automation._id, automation.isActive)
          }
          className="data-[state=checked]:bg-[#1A69DD] data-[state=unchecked]:bg-gray-200"
        />
      </div>
    </TableCell>
    <TableCell className="pr-6 py-4">
      <div className="flex justify-end gap-2">
        <ActionDropdown
          automation={automation}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewInInstagram={onViewInInstagram}
        />
      </div>
    </TableCell>
  </TableRow>
);

// Desktop Table Header Component
const DesktopTableHeader = ({ type }: { type: string }) => (
  <TableHeader className="bg-gray-50/50 dark:bg-gray-700/50">
    <TableRow className="hover:bg-transparent">
      <TableHead className="font-medium py-4 pl-6">Name</TableHead>
      <TableHead className="font-medium py-4">Created</TableHead>
      <TableHead className="font-medium py-4">DM Count</TableHead>
      <TableHead className="font-medium py-4">Link Clicks</TableHead>
      <TableHead className="font-medium py-4">Keywords</TableHead>
      <TableHead className="font-medium py-4">DM Message</TableHead>
      {type === "post" && (
        <TableHead className="font-medium py-4">Auto Reply</TableHead>
      )}
      <TableHead className="font-medium py-4">Status</TableHead>
      <TableHead className="font-medium py-4 pr-6 text-right">
        Actions
      </TableHead>
    </TableRow>
  </TableHeader>
);

// Main AutomationTable Component
export function AutomationTable({ type }: { type: string }) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useAppSelector((state) => state.user);
  const router = useRouter();

  const handleNewAutomation = () => {
    if (type === "post") router.push(`/dashboard/automation/create`);
    else if (type === "story")
      router.push(`/dashboard/automation/story/create`);
  };

  const fetchAutomations = useCallback(async () => {
    try {
      if (!user.instagramId || !user.instagramUsername) {
        console.error("Instagram authentication required");
        setLoading(false);
        return;
      }

      setLoading(true);

      if (type === "post") {
        const { data } = await axios.get(`/api/automations`, {
          params: { userId: user._id },
        });
        setAutomations(data.reverse());
      }
      if (type === "story") {
        const { data } = await axios.get(`/api/automations/stories`, {
          params: { userId: user._id },
        });
        setAutomations(data.reverse());
      }
    } catch (error) {
      console.error("Error fetching automations:", error);
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  }, [
    user.instagramId,
    user.instagramUsername,
    user._id,
    type,
    setAutomations,
  ]);

  useEffect(() => {
    fetchAutomations();
  }, [
    user.instagramId,
    user.instagramUsername,
    user._id,
    type,
    fetchAutomations,
  ]);

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
      // Find the automation to be deleted first (for optimistic update)
      const automationToDelete = automations.find((auto) => auto._id === id);
      if (!automationToDelete) {
        toast.error("Automation not found");
        return;
      }

      const endpoint =
        type === "post" ? "/api/automations" : "/api/automations/stories";
      await axios.delete(endpoint, { params: { id } });

      setAutomations((prev) => prev.filter((auto) => auto._id !== id));

      toast.success("Automation deleted successfully");
    } catch (error) {
      console.error("Error deleting automation:", error);
      toast.error("Failed to delete automation");

      // If deletion failed, refresh to restore correct state
      fetchAutomations();
    }
  };

  const handleEdit = (id: string) => {
    if (type === "post") router.push(`/dashboard/automations/${id}/edit`);
    else if (type === "story")
      router.push(`/dashboard/automations/story/${id}/edit`);
  };

  const handleViewInInstagram = async (
    postId: string,
    automation?: Automation
  ) => {
    try {
      if (automation?.permalinks && automation.permalinks[postId]) {
        toast.dismiss();
        window.open(automation.permalinks[postId], "_blank");
        return;
      }

      const { data } = await axios.get(`/api/instagram/permalink`, {
        params: { mediaId: postId, accessToken: user.instagramAccessToken },
      });

      if (data.permalink) {
        toast.dismiss();
        window.open(data.permalink, "_blank");

        if (automation) {
          setAutomations((prevAutomations) =>
            prevAutomations.map((auto) =>
              auto._id === automation._id
                ? {
                    ...auto,
                    permalinks: {
                      ...auto.permalinks,
                      [postId]: data.permalink,
                    },
                  }
                : auto
            )
          );
        }
      } else {
        toast.error("Could not retrieve Instagram link");
      }
    } catch (error) {
      console.error("Error fetching permalink:", error);
      toast.error("Failed to get Instagram link");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const endpoint =
        type === "post" ? "/api/automations" : "/api/automations/stories";
      await axios.put(`${endpoint}?id=${id}`, { isActive: !currentStatus });

      setAutomations((prevAutomations) =>
        prevAutomations.map((automation) =>
          automation._id === id
            ? { ...automation, isActive: !currentStatus }
            : automation
        )
      );

      toast.success(
        `Automation ${!currentStatus ? "enabled" : "disabled"} successfully`
      );

      setTimeout(() => {
        fetchAutomations();
      }, 1000);
    } catch (error) {
      console.error("Error toggling automation status:", error);
      toast.error("Failed to update automation status");
    }
  };

  if (!user.isAuthenticated) {
    return <NotAuthenticatedState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (automations.length === 0) {
    return <EmptyState type={type} onCreateNew={handleNewAutomation} />;
  }

  return (
    <div className="w-full space-y-6">
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateNew={handleNewAutomation}
        type={type}
      />

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredAutomations.map((automation) => (
          <MobileAutomationCard
            key={automation._id}
            automation={automation}
            type={type}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewInInstagram={(postId) =>
              handleViewInInstagram(postId, automation)
            }
            onToggleActive={toggleActive}
          />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <Table>
            <DesktopTableHeader type={type} />
            <TableBody>
              {filteredAutomations.map((automation) => (
                <DesktopTableRow
                  key={automation._id}
                  automation={automation}
                  type={type}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewInInstagram={(postId) =>
                    handleViewInInstagram(postId, automation)
                  }
                  onToggleActive={toggleActive}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredAutomations.length === 0 && searchTerm && <SearchNotFound />}
    </div>
  );
}
