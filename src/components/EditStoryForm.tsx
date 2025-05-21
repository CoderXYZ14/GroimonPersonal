"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Image as ImageIcon,
  Globe as GlobeIcon,
  MousePointerClick,
  AlertCircle,
  Info,
  MessageCircle,
  MessageSquareText,
  Link as LinkIcon,
  Trash2,
  Eye,
  UserPlus,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { cn } from "@/lib/utils";

interface InstagramStoryItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  thumbnailUrl?: string;
  timestamp: string;
}

interface InstagramStoriesResponse {
  data: InstagramStoryItem[];
  paging?: {
    cursors: {
      before?: string;
      after?: string;
    };
  };
}

const buttonSchema = z.object({
  url: z.string().min(1, "URL is required"),
  buttonText: z.string().min(1, "Button text is required"),
});

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    applyOption: z.enum(["all", "selected"]),
    storyId: z.string().optional(),
    keywords: z.array(z.string()).min(1, "At least one keyword is required"),
    messageType: z
      .enum(["message", "ButtonText", "ButtonImage"])
      .default("message"),
    message: z.string().optional(),
    imageUrl: z.union([
      z.string().url("Must be a valid image URL").optional(),
      z.literal("").optional(),
      z.undefined(),
    ]),
    buttonTitle: z.string().optional(),
    buttons: z.array(buttonSchema).optional(),
    isFollowed: z.boolean().default(false),
    notFollowerMessage: z.string().optional(),
    followButtonTitle: z.string().optional(),
    followUpMessage: z.string().optional(),
    followUpButtonTitle: z.string().optional(),
    isActive: z.boolean().default(true),
    respondToAll: z.boolean().default(false),
    removeBranding: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Message is required only for messageType "message"
      if (
        data.messageType === "message" &&
        (!data.message || data.message.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Message template is required for message type",
      path: ["message"],
    }
  )
  .refine(
    (data) => {
      // If applyOption is "selected", storyId is required
      if (data.applyOption === "selected" && !data.storyId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a story for your automation.",
      path: ["storyId"],
    }
  )
  .refine(
    (data) => {
      // Image URL is required for ButtonImage
      if (
        data.messageType === "ButtonImage" &&
        (!data.imageUrl || data.imageUrl.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Image URL is required for image buttons.",
      path: ["imageUrl"],
    }
  )
  .refine(
    (data) => {
      // Button title is required for ButtonText and ButtonImage
      if (
        (data.messageType === "ButtonText" ||
          data.messageType === "ButtonImage") &&
        (!data.buttonTitle || data.buttonTitle.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Button title is required.",
      path: ["buttonTitle"],
    }
  )
  .refine(
    (data) => {
      // Follower message fields are required when isFollowed is true
      if (data.isFollowed) {
        if (!data.notFollowerMessage || data.notFollowerMessage.trim() === "") {
          return false;
        }
        if (!data.followButtonTitle || data.followButtonTitle.trim() === "") {
          return false;
        }
        if (!data.followUpMessage || data.followUpMessage.trim() === "") {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "All follower-related messages are required when the follow check is enabled.",
      path: ["notFollowerMessage"],
    }
  );

interface EditStoryFormProps {
  story: {
    _id: string;
    id?: string; // Keep for backward compatibility
    name: string;
    postIds: string[];
    keywords: string[] | string;
    messageType: "message" | "ButtonText" | "ButtonImage";
    message: string;
    imageUrl?: string;
    buttonTitle?: string;
    buttons?: Array<{ url: string; buttonText: string }>;
    isFollowed: boolean;
    notFollowerMessage?: string;
    followButtonTitle?: string;
    followUpMessage?: string;
    followUpButtonTitle?: string;
    isActive?: boolean;
    respondToAll?: boolean;
    removeBranding: boolean;
  };
}

export function EditStoryForm({ story }: EditStoryFormProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [dmTypeOpen, setDmTypeOpen] = useState(true);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [isPaginating, setIsPaginating] = useState(false);
  const [loadedCursors, setLoadedCursors] = useState<Set<string>>(new Set());
  const [isFollowedOpen, setIsFollowedOpen] = useState(false);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [buttons, setButtons] = useState<
    Array<{ url: string; buttonText: string }>
  >(
    story.buttons?.map((button) => ({
      url: button.url,
      buttonText: button.buttonText,
    })) || []
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [selectStoryOpen, setSelectStoryOpen] = useState(true);

  const toggleDmType = () => {
    setDmTypeOpen(!dmTypeOpen);
  };

  const toggleIsFollowed = () => {
    if (form.watch("isFollowed")) {
      setIsFollowedOpen(!isFollowedOpen);
    }
  };

  const toggleSelectStory = () => {
    setSelectStoryOpen(!selectStoryOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: story.name,
      // Determine applyOption based on postIds array length
      applyOption:
        story.postIds && story.postIds.length === 1 ? "selected" : "all",
      // Initialize with existing storyId if available (first item in postIds)
      storyId:
        story.postIds && story.postIds.length === 1 ? story.postIds[0] : "",
      keywords: Array.isArray(story.keywords)
        ? story.keywords
        : story.keywords
        ? story.keywords.split(",").map((k) => k.trim())
        : [],
      messageType: story.messageType,
      message: story.message,
      imageUrl: story.imageUrl,
      buttonTitle: story.buttonTitle || "Button Title",
      isFollowed: story.isFollowed,
      notFollowerMessage:
        story.notFollowerMessage ||
        "Please follow our account to receive the information you requested. Once you've followed, click the button below.",
      followButtonTitle: story.followButtonTitle || "I'm following now!",
      followUpMessage:
        story.followUpMessage ||
        "It seems you haven't followed us yet. Please follow our account and click the button below when you're done.",
      followUpButtonTitle:
        story.followUpButtonTitle || "Continue",
      isActive: story.isActive !== undefined ? story.isActive : true,
      respondToAll:
        story.respondToAll !== undefined ? story.respondToAll : false,
      removeBranding: story.removeBranding,
    },
  });

  const messageType = form.watch("messageType");
  const isFollowed = form.watch("isFollowed");
  const applyOption = form.watch("applyOption");

  // Watch for changes to applyOption and update selectStoryOpen
  useEffect(() => {
    if (applyOption === "selected") {
      setSelectStoryOpen(true);
    }
  }, [applyOption]);

  // Watch for changes to isFollowed and update isFollowedOpen
  useEffect(() => {
    if (isFollowed) {
      setIsFollowedOpen(true);
    } else {
      setIsFollowedOpen(false);
    }
  }, [isFollowed]);

  // Set initial state for isFollowedOpen and selectStoryOpen based on story data
  useEffect(() => {
    if (story.isFollowed) {
      setIsFollowedOpen(true);
    }

    // Ensure story selection is open if there's exactly one post ID
    if (story.postIds && story.postIds.length === 1) {
      setSelectStoryOpen(true);
    }
  }, [story]);

  useEffect(() => {
    if (
      (messageType === "ButtonText" || messageType === "ButtonImage") &&
      buttons.length === 0
    ) {
      setButtons([
        {
          url: "https://example.com",
          buttonText: "Click Here",
        },
      ]);
    } else if (messageType === "message") {
      setButtons([]);
    }
  }, [messageType, buttons.length]);

  const fetchStories = useCallback(
    async (direction: "initial" | "next" | "previous" = "initial") => {
      if (direction === "initial") {
        setIsLoading(true);
        // Reset loaded cursors on initial load
        setLoadedCursors(new Set());
      } else {
        setIsPaginating(true);
      }

      const instagramId = user.instagramId;
      const instagramAccessToken = user.instagramAccessToken;

      if (!instagramId || !instagramAccessToken) {
        console.error("Instagram user ID or access token not found");
        toast.error("Instagram user ID or access token not found");
        setIsLoading(false);
        setIsPaginating(false);
        return;
      }

      try {
        // Build the URL with the appropriate cursor if needed
        let url = `https://graph.instagram.com/v18.0/${instagramId}/stories?fields=id,media_type,media_url,thumbnail_url,timestamp&limit=25&access_token=${instagramAccessToken}`;

        // Determine which cursor to use based on navigation direction
        let currentCursor = "";
        if (direction === "next" && afterCursor) {
          currentCursor = afterCursor;
          url += `&after=${afterCursor}`;
          setCurrentPage((prev) => prev + 1);
        } else if (direction === "previous" && beforeCursor) {
          currentCursor = beforeCursor;
          url += `&before=${beforeCursor}`;
          setCurrentPage((prev) => Math.max(0, prev - 1));
        }

        // Skip if we've already loaded this cursor
        if (
          direction !== "initial" &&
          currentCursor &&
          loadedCursors.has(currentCursor)
        ) {
          setIsPaginating(false);
          return;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch stories: ${response.statusText}`);
        }

        const data: InstagramStoriesResponse = await response.json();

        // Check if there are any story items
        if (!data.data || data.data.length === 0) {
          // If there's no data, just return without updating
          setIsLoading(false);
          setIsPaginating(false);
          // If we're trying to go 'next' but there's no data, that means we're at the end
          // So we should clear the afterCursor
          if (direction === "next") {
            setAfterCursor(null);
          }
          return;
        }

        const fetchedStories = data.data.map((item: InstagramStoryItem) => ({
          id: item.id,
          mediaUrl: item.media_url,
          mediaType: item.media_type,
          thumbnailUrl: item.thumbnail_url,
          timestamp: item.timestamp,
        }));

        // Handle the story items based on the direction
        if (direction === "initial") {
          // For initial load, just set the stories
          setStories(fetchedStories);
          setStoryLoaded(true);
        } else if (direction === "next") {
          // For next page, append the new items without duplicates
          setStories((prevStories) => {
            // Create a set of existing IDs for quick lookup
            const existingIds = new Set(prevStories.map((item) => item.id));
            // Filter out any duplicates from the new items
            const uniqueNewItems = fetchedStories.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prevStories, ...uniqueNewItems];
          });

          // Add this cursor to our loaded set
          if (currentCursor) {
            setLoadedCursors((prev) => new Set(prev).add(currentCursor));
          }
        } else if (direction === "previous") {
          // For previous page, prepend the new items without duplicates
          setStories((prevStories) => {
            // Create a set of existing IDs for quick lookup
            const existingIds = new Set(prevStories.map((item) => item.id));
            // Filter out any duplicates from the new items
            const uniqueNewItems = fetchedStories.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...uniqueNewItems, ...prevStories];
          });

          // Add this cursor to our loaded set
          if (currentCursor) {
            setLoadedCursors((prev) => new Set(prev).add(currentCursor));
          }
        }

        // Update cursors for pagination
        if (data.paging?.cursors) {
          // Only set afterCursor if we have exactly 25 stories (a full page)
          // This ensures we don't show the Next button when there are no more stories
          if (data.paging.cursors.after && data.data.length === 25) {
            setAfterCursor(data.paging.cursors.after);
          } else {
            setAfterCursor(null);
          }

          if (data.paging.cursors.before) {
            setBeforeCursor(data.paging.cursors.before);
          } else {
            setBeforeCursor(null);
          }
        } else {
          // If no paging object at all, clear both cursors
          setAfterCursor(null);
          setBeforeCursor(null);
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
        toast.error("Failed to fetch stories");
      } finally {
        setIsLoading(false);
        setIsPaginating(false);
      }
    },
    [user.instagramId, user.instagramAccessToken, afterCursor, beforeCursor]
  );

  useEffect(() => {
    fetchStories("initial");
  }, [fetchStories]);

  // Set the initial storyId when stories are loaded
  useEffect(() => {
    if (storyLoaded && stories.length > 0) {
      const applyOption = form.getValues("applyOption");

      if (applyOption === "selected") {
        const currentStoryId = form.getValues("storyId");

        // Check if the previously selected story still exists
        const storyExists = stories.some((item) => item.id === currentStoryId);

        if (storyExists) {
          // Set the form value to the previously selected story
          form.setValue("storyId", currentStoryId);
        } else if (stories.length > 0) {
          // If the story no longer exists but there are other stories, select the first one
          form.setValue("storyId", stories[0].id);
          toast.info(
            "Previously selected story is no longer available. Selected the first available story."
          );
        }
      }
    }
  }, [storyLoaded, stories, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Validate buttons if using button types
      if (
        values.messageType === "ButtonText" ||
        values.messageType === "ButtonImage"
      ) {
        // Check if button title is empty
        if (!values.buttonTitle || values.buttonTitle.trim() === "") {
          form.setError("buttonTitle", {
            type: "manual",
            message: "Button title is required",
          });
          // Scroll to the error
          document
            .querySelector("[name='buttonTitle']")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        // Check if any button has empty fields
        if (buttons.length === 0) {
          form.setError("buttons", {
            type: "manual",
            message: "At least one button is required",
          });
          return;
        }

        // Validate each button
        let hasEmptyFields = false;
        buttons.forEach((button) => {
          if (
            !button.buttonText ||
            button.buttonText.trim() === "" ||
            !button.url ||
            button.url.trim() === ""
          ) {
            hasEmptyFields = true;
          }
        });

        if (hasEmptyFields) {
          form.setError("buttons", {
            type: "manual",
            message: "Button text and URL are required for all buttons",
          });
          return;
        }
      }

      setIsLoading(true);

      // First, ensure we have a valid story ID
      if (!story._id) {
        throw new Error("Automation ID is missing");
      }

      const storyIds =
        values.applyOption === "all"
          ? stories.map((story) => story.id)
          : values.storyId
          ? [values.storyId]
          : [];

      if (values.applyOption === "selected" && !values.storyId) {
        throw new Error("Please select a story");
      }

      // Handle the case when respondToAll is true - keywords can be empty
      const keywordsArray = values.respondToAll ? [] : values.keywords || [];

      // Ensure imageUrl is properly handled
      const finalImageUrl =
        values.messageType === "ButtonImage" && values.imageUrl
          ? values.imageUrl
          : undefined;

      // Create request payload
      const payload = {
        id: story._id,
        ...(values.messageType === "message"
          ? values
          : {
              ...values,
              message: undefined,
            }),
        postIds: storyIds,
        keywords: keywordsArray,
        imageUrl: finalImageUrl,
        notFollowerMessage: values.isFollowed
          ? values.notFollowerMessage
          : undefined,
        followButtonTitle: values.isFollowed
          ? values.followButtonTitle
          : undefined,
        followUpMessage: values.isFollowed ? values.followUpMessage : undefined,
        followUpButtonTitle: values.isFollowed ? values.followUpButtonTitle : undefined,
        buttons:
          values.messageType === "ButtonText" ||
          values.messageType === "ButtonImage"
            ? buttons.map((button) => ({
                url:
                  button.url &&
                  !button.url.startsWith("http://") &&
                  !button.url.startsWith("https://")
                    ? `https://${button.url}`
                    : button.url,
                buttonText: button.buttonText,
              }))
            : undefined,
        respondToAll: values.respondToAll,
      };

      // Make the API request with the correct URL format (using query parameter instead of path parameter)
      await axios.put(`/api/automations/stories?id=${story._id}`, payload);

      toast.success("Story automation updated successfully!");
      router.push("/dashboard/automation?type=story");
      router.refresh();
    } catch (error) {
      console.error("Error updating story automation:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update story automation"
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update story automation");
      }
    } finally {
      setIsLoading(false);
    }
  }
  const keywordsCount = form.watch("keywords")
    ? form.watch("keywords").length
    : 0;

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-[#1A69DD]/20 dark:border-gray-700"
          >
            <div className="px-2 sm:px-3 lg:px-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 md:gap-4 md:py-4">
                {/* Title Input */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="w-full sm:max-w-[300px] lg:max-w-[400px] relative flex-1"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="✨ Name Your Automation"
                            className="text-base md:text-lg font-semibold bg-transparent border-gradient-to-r from-[#1A69DD]/30 to-[#26A5E9]/30 dark:border-[#26A5E9]/30 focus-visible:ring-0 px-3 py-2 placeholder:text-[#1A69DD]/60 dark:placeholder:text-[#26A5E9]/80"
                            {...field}
                          />
                        </FormControl>
                        {/* <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#1A69DD]/30 to-[#26A5E9]/30" /> */}
                        <FormMessage className="text-sm mt-1 ml-2" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <motion.div
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Link href="/dashboard/automation?type=story">
                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto gap-2 text-sm sm:text-base font-medium text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 dark:hover:bg-[#26A5E9]/10 border border-[#1A69DD]/20 dark:border-[#26A5E9]/30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="submit"
                      className="w-full sm:w-auto text-sm sm:text-base font-medium bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white shadow-lg shadow-[#1A69DD]/20 dark:shadow-[#26A5E9]/30"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-white/90" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Update Automation
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Story Selection Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-[#1A69DD]/10 dark:border-gray-700"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent">
                Stories
              </h2>
              {applyOption === "selected" && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-300 flex items-center"
                  onClick={toggleSelectStory}
                >
                  Select story
                  {selectStoryOpen ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              )}
            </div>

            {/* Automation Type Selection */}
            <FormField
              control={form.control}
              name="applyOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                      {/* All Stories Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <RadioGroupItem
                          value="all"
                          id="all"
                          className="peer hidden"
                        />
                        <Label
                          htmlFor="all"
                          className={cn(
                            "flex flex-col p-6 border-3 rounded-2xl cursor-pointer transition-all",
                            field.value === "all"
                              ? "border-[#1A69DD] bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10"
                              : "border-gray-200 dark:border-gray-700 hover:border-[#1A69DD]/50"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={cn(
                                "p-2 rounded-full transition-colors",
                                field.value === "all"
                                  ? "bg-[#1A69DD] dark:bg-[#26A5E9]"
                                  : "bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10"
                              )}
                            >
                              <GlobeIcon
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  field.value === "all"
                                    ? "text-white"
                                    : "text-[#1A69DD] dark:text-[#26A5E9]"
                                )}
                              />
                            </div>
                            <h3 className="text-lg font-semibold">
                              All Stories
                            </h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            Automatically apply this workflow to all existing
                            stories
                          </p>

                          {/* Selection Indicator */}
                          <div
                            className={cn(
                              "absolute top-4 right-4 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors",
                              field.value === "all"
                                ? "border-[#1A69DD] bg-[#1A69DD] dark:border-[#26A5E9] dark:bg-[#26A5E9]"
                                : "border-gray-300"
                            )}
                          >
                            <Check className="h-4 w-4 text-white opacity-100 transition-opacity" />
                          </div>
                        </Label>
                      </motion.div>

                      {/* Specific Story Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <RadioGroupItem
                          value="selected"
                          id="selected"
                          className="peer hidden"
                        />
                        <Label
                          htmlFor="selected"
                          className={cn(
                            "flex flex-col p-6 border-3 rounded-2xl cursor-pointer transition-all",
                            field.value === "selected"
                              ? "border-[#1A69DD] bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10"
                              : "border-gray-200 dark:border-gray-700 hover:border-[#1A69DD]/50"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={cn(
                                "p-2 rounded-full transition-colors",
                                field.value === "selected"
                                  ? "bg-[#1A69DD] dark:bg-[#26A5E9]"
                                  : "bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10"
                              )}
                            >
                              <MousePointerClick
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  field.value === "selected"
                                    ? "text-white"
                                    : "text-[#1A69DD] dark:text-[#26A5E9]"
                                )}
                              />
                            </div>
                            <h3 className="text-lg font-semibold">
                              Specific Story
                            </h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            Choose individual stories to apply this automation
                            workflow
                          </p>

                          {/* Selection Indicator */}
                          <div
                            className={cn(
                              "absolute top-4 right-4 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors",
                              field.value === "selected"
                                ? "border-[#1A69DD] bg-[#1A69DD] dark:border-[#26A5E9] dark:bg-[#26A5E9]"
                                : "border-gray-300"
                            )}
                          >
                            <Check className="h-4 w-4 text-white opacity-100 transition-opacity" />
                          </div>
                        </Label>
                      </motion.div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Story Selection Grid */}
            <AnimatePresence>
              {applyOption === "selected" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8"
                >
                  {selectStoryOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Loading State */}
                      {isLoading ? (
                        <div className="flex justify-center py-12">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="h-12 w-12 rounded-full border-4 border-[#1A69DD] border-t-transparent"
                          />
                        </div>
                      ) : (
                        <div className="relative flex flex-col space-y-4">
                          <div className="relative">
                            <SimpleBar
                              className={`py-2 ${
                                form.formState.errors.storyId
                                  ? "border-2 border-red-500 dark:border-red-500 rounded-lg p-2"
                                  : ""
                              }`}
                              style={{ height: "100%", overflowX: "auto" }}
                              autoHide={false}
                              onScroll={() => {
                                const scrollContainer = document.querySelector(
                                  ".simplebar-content-wrapper"
                                );
                                if (scrollContainer) {
                                  const element =
                                    scrollContainer as HTMLDivElement;
                                  const scrollThreshold = 100;

                                  if (
                                    element.scrollWidth - element.scrollLeft <=
                                      element.clientWidth + scrollThreshold &&
                                    !isPaginating &&
                                    afterCursor
                                  ) {
                                    fetchStories("next");
                                  }

                                  if (
                                    element.scrollLeft <= scrollThreshold &&
                                    !isPaginating &&
                                    beforeCursor
                                  ) {
                                    fetchStories("previous");
                                  }
                                }
                              }}
                            >
                              <div className="inline-flex gap-4 pl-2 pr-4">
                                {stories.map((item) => (
                                  <div
                                    key={item.id}
                                    className="inline-block w-[250px] flex-shrink-0"
                                  >
                                    <FormField
                                      control={form.control}
                                      name="storyId"
                                      render={({ field }) => (
                                        <RadioGroup
                                          value={field.value}
                                          onValueChange={field.onChange}
                                        >
                                          <Label className="block relative group cursor-pointer">
                                            <motion.div
                                              whileHover={{ scale: 1.03 }}
                                              className={cn(
                                                "relative aspect-square rounded-xl overflow-hidden border-4 transition-all",
                                                field.value === item.id
                                                  ? "border-[#1A69DD] dark:border-[#26A5E9]"
                                                  : "border-transparent group-hover:border-[#1A69DD]/30"
                                              )}
                                            >
                                              <div className="relative h-full w-full bg-gray-100 dark:bg-gray-700">
                                                {item.mediaType === "IMAGE" && (
                                                  <Image
                                                    src={item.mediaUrl}
                                                    alt="Story"
                                                    fill
                                                    className="object-cover"
                                                    loading="lazy"
                                                  />
                                                )}
                                                {item.mediaType === "VIDEO" && (
                                                  <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    {item.thumbnailUrl ? (
                                                      <Image
                                                        src={item.thumbnailUrl}
                                                        alt="Video Thumbnail"
                                                        fill
                                                        className="object-cover"
                                                      />
                                                    ) : (
                                                      <span className="absolute text-gray-500 dark:text-gray-400 text-xs">
                                                        Video Preview
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              <div
                                                className={cn(
                                                  "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                                                  field.value === item.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              >
                                                <Check className="h-8 w-8 text-white" />
                                              </div>

                                              <div className="absolute top-2 right-2">
                                                <div
                                                  className={cn(
                                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                                                    field.value === item.id
                                                      ? "border-white bg-[#1A69DD] dark:bg-[#26A5E9] opacity-100"
                                                      : "border-white bg-[#1A69DD]/60 dark:bg-[#26A5E9]/60 opacity-0 group-hover:opacity-70"
                                                  )}
                                                >
                                                  <Check className="h-4 w-4 text-white" />
                                                </div>
                                                <RadioGroupItem
                                                  value={item.id}
                                                  className="sr-only"
                                                />
                                              </div>
                                            </motion.div>
                                          </Label>
                                        </RadioGroup>
                                      )}
                                    />
                                  </div>
                                ))}

                                {isPaginating && (
                                  <div className="inline-flex w-[250px] flex-shrink-0 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#1A69DD] dark:text-[#26A5E9]" />
                                  </div>
                                )}
                              </div>
                            </SimpleBar>

                            {form.formState.errors.storyId && (
                              <div className="mt-2 flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                <AlertCircle size={14} />
                                <p className="text-sm font-medium">
                                  {form.formState.errors.storyId.message}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trigger/Keywords Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                  Trigger
                </h2>
                <div className="relative group -ml-9">
                  <Info className="h-5 w-5 text-[#1A69DD] dark:text-[#26A5E9]" />
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg w-64 text-center">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 dark:bg-gray-100 rotate-45"></div>
                    Keywords are not case-sensitive, e.g., “Groimon” and
                    “groimon” are recognized as the same.
                  </div>
                </div>
              </div>
              {!form.watch("respondToAll") && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 rounded-full bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 text-[#1A69DD] dark:text-[#26A5E9]"
                >
                  {keywordsCount} {keywordsCount === 1 ? "Keyword" : "Keywords"}
                </motion.div>
              )}
            </div>

            <FormField
              control={form.control}
              name="respondToAll"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {/* Specific Words Option */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Label
                          htmlFor="specific"
                          className={cn(
                            "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all",
                            field.value === false
                              ? "border-[#1A69DD] bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10"
                              : "border-gray-200 dark:border-gray-700 hover:border-[#1A69DD]/50"
                          )}
                        >
                          <RadioGroupItem
                            value="false"
                            id="specific"
                            className="peer hidden"
                          />
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center border-current">
                              <div
                                className={cn(
                                  "h-3 w-3 rounded-full transition-all",
                                  field.value === false
                                    ? "bg-[#1A69DD] dark:bg-[#26A5E9]"
                                    : "bg-transparent"
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-base">
                                Specific Words
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                Respond when specific keywords are used
                              </p>
                            </div>
                          </div>
                        </Label>
                      </motion.div>

                      {/* Any Word Option */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Label
                          htmlFor="any"
                          className={cn(
                            "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all",
                            field.value === true
                              ? "border-[#1A69DD] bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10"
                              : "border-gray-200 dark:border-gray-700 hover:border-[#1A69DD]/50"
                          )}
                        >
                          <RadioGroupItem
                            value="true"
                            id="any"
                            className="peer hidden"
                          />
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center">
                              <div
                                className={cn(
                                  "h-3 w-3 rounded-full transition-all",
                                  field.value === true
                                    ? "bg-[#1A69DD] dark:bg-[#26A5E9]"
                                    : "bg-transparent"
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-base">
                                Any Word
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                Respond to all messages
                              </p>
                            </div>
                          </div>
                        </Label>
                      </motion.div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <AnimatePresence>
              {!form.watch("respondToAll") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                              {field.value?.map((keyword, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  className="flex items-center bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded-full px-3 py-1.5"
                                >
                                  <span className="text-[#1A69DD] dark:text-[#26A5E9] text-base font-medium mr-1">
                                    {keyword}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newKeywords = [...field.value];
                                      newKeywords.splice(index, 1);
                                      field.onChange(newKeywords);
                                    }}
                                    className="text-[#1A69DD] dark:text-[#26A5E9] hover:text-[#1A69DD]/70 dark:hover:text-[#26A5E9]/70"
                                  >
                                    <X size={14} />
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>

                          <div className="relative">
                            <Input
                              placeholder="Add keyword"
                              className={`w-full py-6 px-6 rounded-xl border-2 ${
                                form.formState.errors.keywords
                                  ? "border-red-500 dark:border-red-500"
                                  : "border-gray-200 dark:border-gray-700"
                              } focus:border-[#1A69DD] focus:ring-0 dark:focus:border-[#26A5E9]`}
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              onKeyDown={(
                                e: KeyboardEvent<HTMLInputElement>
                              ) => {
                                if (e.key === "Enter" && newKeyword.trim()) {
                                  e.preventDefault();
                                  const trimmedKeyword = newKeyword.trim();
                                  if (
                                    !field.value?.some(
                                      (k) =>
                                        k.toLowerCase() ===
                                        trimmedKeyword.toLowerCase()
                                    )
                                  ) {
                                    const updatedKeywords = [
                                      ...(field.value || []),
                                    ];
                                    updatedKeywords.push(trimmedKeyword);
                                    field.onChange(updatedKeywords);
                                    setNewKeyword("");
                                  } else {
                                    toast.error("This keyword already exists");
                                    setNewKeyword("");
                                  }
                                }
                              }}
                            />
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => {
                                if (newKeyword.trim()) {
                                  const trimmedKeyword = newKeyword.trim();
                                  if (
                                    !field.value?.some(
                                      (k) =>
                                        k.toLowerCase() ===
                                        trimmedKeyword.toLowerCase()
                                    )
                                  ) {
                                    const updatedKeywords = [
                                      ...(field.value || []),
                                    ];
                                    updatedKeywords.push(trimmedKeyword);
                                    field.onChange(updatedKeywords);
                                    setNewKeyword("");
                                  } else {
                                    toast.error("This keyword already exists");
                                    setNewKeyword("");
                                  }
                                }
                              }}
                              className="absolute right-2 top-2 bottom-2 px-4 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white rounded-lg flex items-center gap-2"
                            >
                              <Plus size={18} />
                              <span className="font-semibold">Add</span>
                            </motion.button>
                          </div>

                          {form.formState.errors.keywords && (
                            <div className="mt-2 flex items-center gap-1.5 text-red-500 dark:text-red-400">
                              <AlertCircle size={14} />
                              <p className="text-sm font-medium">
                                {form.formState.errors.keywords.message}
                              </p>
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* DM Type Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                DM Message
              </h2>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 dark:hover:bg-[#26A5E9]/10"
                  onClick={toggleDmType}
                >
                  <MessageCircle className="w-4 h-4" /> Message Type
                  {dmTypeOpen ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </motion.div>
            </div>

            <AnimatePresence>
              {dmTypeOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  {/* Message Type Selection */}
                  <FormField
                    control={form.control}
                    name="messageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          >
                            {["message", "ButtonText", "ButtonImage"].map(
                              (type) => (
                                <motion.div
                                  key={type}
                                  whileHover={{ scale: 1.02 }}
                                  className="relative"
                                >
                                  <RadioGroupItem
                                    value={type}
                                    id={type}
                                    className="peer hidden"
                                  />
                                  <Label
                                    htmlFor={type}
                                    className={cn(
                                      "flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all",
                                      field.value === type
                                        ? "border-[#1A69DD] bg-[#1A69DD]/5 dark:border-[#26A5E9] dark:bg-[#26A5E9]/10"
                                        : "border-gray-200 dark:border-gray-700 hover:border-[#1A69DD]/50"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Custom Radio Indicator */}
                                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-current">
                                        <div
                                          className={cn(
                                            "w-3 h-3 rounded-full transition-all",
                                            field.value === type
                                              ? "bg-[#1A69DD] dark:bg-[#26A5E9]"
                                              : "bg-transparent"
                                          )}
                                        />
                                      </div>

                                      {/* Icon Container */}
                                      <div className="p-2 rounded-lg bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10">
                                        {type === "message" && (
                                          <MessageSquareText className="w-5 h-5 text-[#1A69DD] dark:text-[#26A5E9]" />
                                        )}
                                        {type === "ButtonText" && (
                                          <LinkIcon className="w-5 h-5 text-[#1A69DD] dark:text-[#26A5E9]" />
                                        )}
                                        {type === "ButtonImage" && (
                                          <ImageIcon className="w-5 h-5 text-[#1A69DD] dark:text-[#26A5E9]" />
                                        )}
                                      </div>

                                      <span className="font-medium text-base capitalize dark:text-gray-200">
                                        {type.replace(/([A-Z])/g, " $1").trim()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 ml-9">
                                      {type === "message" &&
                                        "Text message reply"}
                                      {type === "ButtonText" &&
                                        "Text with buttons"}
                                      {type === "ButtonImage" &&
                                        "Image with buttons"}
                                    </p>
                                  </Label>
                                </motion.div>
                              )
                            )}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("messageType") === "message" && (
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Enter the message to send as an auto-reply"
                              className={`w-full p-4 border-2 ${
                                form.formState.errors.message
                                  ? "border-red-500 dark:border-red-500"
                                  : "border-gray-200 dark:border-gray-700"
                              } rounded-lg min-h-[140px] 
                                        text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800/90
                                        focus:border-[#1A69DD] dark:focus:border-[#26A5E9] focus:ring-2 
                                        focus:ring-[#1A69DD]/20 dark:focus:ring-[#26A5E9]/30
                                        hover:border-gray-300 dark:hover:border-gray-600
                                        transition-all duration-200 ease-in-out
                                        placeholder-gray-400 dark:placeholder-gray-500
                                        resize-y`}
                              {...field}
                            />
                          </FormControl>
                          {form.formState.errors.message && (
                            <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                              <AlertCircle size={14} />
                              {form.formState.errors.message.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("messageType") === "ButtonImage" && (
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-200 transition-colors hover:text-[#1A69DD] dark:hover:text-[#26A5E9]">
                            <span className="bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent">
                              Media URL
                            </span>
                          </Label>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                placeholder="https://example.com/main-image.jpg"
                                className={`w-full pl-10 pr-4 py-3 border-2 ${
                                  form.formState.errors.imageUrl
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-gray-200 dark:border-gray-700"
                                } rounded-lg
                                          text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800/90
                                          focus:border-[#1A69DD] dark:focus:border-[#26A5E9] focus:ring-2
                                          focus:ring-[#1A69DD]/20 dark:focus:ring-[#26A5E9]/30
                                          hover:border-gray-300 dark:hover:border-gray-600
                                          transition-all duration-200 ease-in-out
                                          placeholder-gray-400 dark:placeholder-gray-500`}
                                {...field}
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[#1A69DD] dark:group-hover:text-[#26A5E9] transition-colors" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm mt-2 px-3 py-1.5 bg-blue-50/50 dark:bg-[#26A5E9]/10 text-gray-600 dark:text-gray-400 rounded-md border-l-4 border-[#1A69DD] dark:border-[#26A5E9]">
                            Must start with http:// or https://
                          </FormDescription>
                          {form.formState.errors.imageUrl && (
                            <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                              <AlertCircle size={14} />
                              {form.formState.errors.imageUrl.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  )}

                  {(form.watch("messageType") === "ButtonText" ||
                    form.watch("messageType") === "ButtonImage") && (
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Preview Section - Left (1/4 width) */}
                      {buttons.length > 0 && (
                        <div className="lg:w-1/4">
                          <div className="sticky top-4 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Eye className="w-5 h-5 text-[#1A69DD] dark:text-[#26A5E9]" />
                              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                Live Preview
                              </h3>
                            </div>

                            <div className="space-y-4">
                              {form.watch("messageType") === "ButtonImage" && (
                                <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                  {form.watch("imageUrl")?.trim() ? (
                                    <Image
                                      src={form.watch("imageUrl").trim()}
                                      alt="Preview"
                                      fill
                                      className="object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src = "/placeholder-image.jpg";
                                      }}
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                      <ImageIcon className="w-8 h-8" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {form.watch("buttonTitle") && (
                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                  {form.watch("buttonTitle")}
                                </p>
                              )}

                              <div className="flex flex-col gap-2">
                                {buttons.map((button, index) => (
                                  <div
                                    key={index}
                                    className="p-2 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                  >
                                    <span className="text-sm text-gray-800 dark:text-gray-200">
                                      {button.buttonText || "Button Text"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Configuration Section - Right (3/4 width) */}
                      <div className="flex-1 space-y-6">
                        <FormField
                          control={form.control}
                          name="buttonTitle"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="text-gray-800 dark:text-gray-200">
                                Button Section Title
                              </Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g. 'Choose an option'"
                                  className={`border-2 ${
                                    form.formState.errors.buttonTitle
                                      ? "border-red-500 dark:border-red-500"
                                      : "border-gray-200 dark:border-gray-700"
                                  } focus:border-[#1A69DD] dark:focus:border-[#26A5E9]`}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value.trim() !== "") {
                                      form.clearErrors("buttonTitle");
                                    }
                                  }}
                                />
                              </FormControl>
                              {form.formState.errors.buttonTitle && (
                                <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                                  <AlertCircle size={14} />
                                  {form.formState.errors.buttonTitle.message}
                                </FormMessage>
                              )}
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          {/* General error message for buttons */}
                          {form.formState.errors.buttons && (
                            <div className="p-3 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                              <p className="text-sm font-medium text-red-500 dark:text-red-400 flex items-center gap-1.5">
                                <AlertCircle size={16} />
                                {form.formState.errors.buttons.message ||
                                  "Button fields cannot be empty"}
                              </p>
                            </div>
                          )}

                          {buttons.map((button, index) => (
                            <Card
                              key={index}
                              className="p-4 relative bg-white dark:bg-gray-800"
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  setButtons(
                                    buttons.filter((_, i) => i !== index)
                                  )
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>

                              <div className="space-y-3">
                                <div>
                                  <Input
                                    value={button.buttonText}
                                    onChange={(e) => {
                                      const newButtons = [...buttons];
                                      newButtons[index].buttonText =
                                        e.target.value;
                                      setButtons(newButtons);
                                    }}
                                    placeholder="Button label"
                                    className={
                                      !button.buttonText ? "border-red-500" : ""
                                    }
                                  />
                                  {!button.buttonText && (
                                    <p className="text-sm text-red-500 mt-1">
                                      Button text is required
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Input
                                    value={button.url}
                                    onChange={(e) => {
                                      const newButtons = [...buttons];
                                      newButtons[index].url = e.target.value;
                                      setButtons(newButtons);
                                    }}
                                    placeholder="https://example.com"
                                    className={
                                      !button.url ? "border-red-500" : ""
                                    }
                                  />
                                  {!button.url && (
                                    <p className="text-sm text-red-500 mt-1">
                                      URL is required
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (buttons.length >= 3) {
                              toast.error("Maximum 3 buttons allowed");
                              return;
                            }
                            setButtons([
                              ...buttons,
                              { url: "", buttonText: "" },
                            ]);
                          }}
                          className="w-full border-2 border-[#1A69DD] dark:border-[#26A5E9] text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 py-2 px-6 rounded-lg font-medium"
                          disabled={buttons.length >= 3}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Button
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Follow Request Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent">
                Follow Request
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 dark:hover:bg-[#26A5E9]/10"
                onClick={toggleIsFollowed}
                disabled={!form.watch("isFollowed")}
              >
                {isFollowedOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="isFollowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-800 dark:text-gray-200">
                      Ask to Follow
                    </Label>
                    <FormDescription className="text-sm text-gray-600 dark:text-gray-300">
                      Request users to follow your account before receiving the
                      message
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#1A69DD] dark:data-[state=checked]:bg-[#26A5E9]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <AnimatePresence>
              {isFollowedOpen && form.watch("isFollowed") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="notFollowerMessage"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-800 dark:text-gray-200">
                          Message for Non-Followers
                        </Label>
                        <FormDescription className="text-sm bg-blue-50/50 dark:bg-[#26A5E9]/10 px-3 py-1.5 rounded-md border-l-4 border-[#1A69DD] dark:border-[#26A5E9]">
                          This message will be shown to users who don't follow
                          you
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Please follow my account to receive the message"
                            className={`w-full p-4 border-2 ${
                              form.formState.errors.notFollowerMessage
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            } rounded-lg min-h-[100px] 
                                      text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800/90
                                      focus:border-[#1A69DD] dark:focus:border-[#26A5E9] focus:ring-2 
                                      focus:ring-[#1A69DD]/20 dark:focus:ring-[#26A5E9]/30
                                      hover:border-gray-300 dark:hover:border-gray-600
                                      transition-all duration-200 ease-in-out
                                      placeholder-gray-400 dark:placeholder-gray-500`}
                            {...field}
                          />
                        </FormControl>
                        {form.formState.errors.notFollowerMessage && (
                          <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            {form.formState.errors.notFollowerMessage.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followButtonTitle"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-800 dark:text-gray-200">
                          Follow Button Text
                        </Label>
                        <FormDescription className="text-sm bg-blue-50/50 dark:bg-[#26A5E9]/10 px-3 py-1.5 rounded-md border-l-4 border-[#1A69DD] dark:border-[#26A5E9]">
                          Text to display on the follow button
                        </FormDescription>
                        <FormControl>
                          <Input
                            placeholder="Follow Now"
                            className={`border-2 ${
                              form.formState.errors.followButtonTitle
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            } focus:border-[#1A69DD] dark:focus:border-[#26A5E9]`}
                            {...field}
                          />
                        </FormControl>
                        {form.formState.errors.followButtonTitle && (
                          <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            {form.formState.errors.followButtonTitle.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followUpMessage"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-800 dark:text-gray-200">
                          Follow-up Message
                        </Label>
                        <FormDescription className="text-sm bg-blue-50/50 dark:bg-[#26A5E9]/10 px-3 py-1.5 rounded-md border-l-4 border-[#1A69DD] dark:border-[#26A5E9]">
                          Message to send after user follows your account
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Thanks for following! Here's your message..."
                            className={`w-full p-4 border-2 ${
                              form.formState.errors.followUpMessage
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            } rounded-lg min-h-[100px] 
                                      text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800/90
                                      focus:border-[#1A69DD] dark:focus:border-[#26A5E9] focus:ring-2 
                                      focus:ring-[#1A69DD]/20 dark:focus:ring-[#26A5E9]/30
                                      hover:border-gray-300 dark:hover:border-gray-600
                                      transition-all duration-200 ease-in-out
                                      placeholder-gray-400 dark:placeholder-gray-500`}
                            {...field}
                          />
                        </FormControl>
                        {form.formState.errors.followUpMessage && (
                          <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            {form.formState.errors.followUpMessage.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followUpButtonTitle"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-800 dark:text-gray-200">
                          Follow-up Button Text
                        </Label>
                        <FormDescription className="text-sm bg-blue-50/50 dark:bg-[#26A5E9]/10 px-3 py-1.5 rounded-md border-l-4 border-[#1A69DD] dark:border-[#26A5E9]">
                          Customize your follow-up button text
                        </FormDescription>
                        <FormControl>
                          <Input
                            placeholder="Continue"
                            className={`w-full p-4 border-2 ${
                              form.formState.errors.followUpButtonTitle
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            } rounded-lg
                                      text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800/90
                                      focus:border-[#1A69DD] dark:focus:border-[#26A5E9] focus:ring-2 
                                      focus:ring-[#1A69DD]/20 dark:focus:ring-[#26A5E9]/30
                                      hover:border-gray-300 dark:hover:border-gray-600
                                      transition-all duration-200 ease-in-out
                                      placeholder-gray-400 dark:placeholder-gray-500`}
                            {...field}
                          />
                        </FormControl>
                        {form.formState.errors.followUpButtonTitle && (
                          <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            {form.formState.errors.followUpButtonTitle.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Remove Branding section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                Branding
              </h2>
            </div>

            <FormField
              control={form.control}
              name="removeBranding"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-[#1A69DD]/20 dark:border-[#26A5E9]/20 p-4 bg-white dark:bg-gray-800">
                  <div className="space-y-1">
                    <Label className="text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                      Remove Branding
                    </Label>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Remove &ldquo;This automation is sent using
                      groimon.com&rdquo; from messages
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#1A69DD] data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
