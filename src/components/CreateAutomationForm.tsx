"use client";

import { useState, useEffect, KeyboardEvent } from "react";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Plus,
  Check,
  ChevronLeft,
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
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { cn } from "@/lib/utils";

// Animation variants for motion components
// const buttonVariants = {
//   hover: { scale: 1.02 },
//   tap: { scale: 0.98 },
// };

const buttonSchema = z.object({
  url: z.string().min(1, "URL is required"),
  buttonText: z.string().min(1, "Button text is required"),
});

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    applyOption: z.enum(["all", "selected"]),
    postId: z.string().optional(),
    keywords: z.array(z.string()).optional().default([]),
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
    enableCommentAutomation: z.boolean(),
    commentMessage: z.array(z.string()).optional().default([]),
    autoReplyLimit: z
      .number()
      .refine((val) => val === -1 || val >= 100, {
        message: "Number must be greater than or equal to 100 or Unlimited.",
      })
      .default(100),
    enableBacktrack: z.boolean().default(false),
    isFollowed: z.boolean().default(false),
    notFollowerMessage: z.string().optional(),
    followButtonTitle: z.string().optional(),
    followUpMessage: z.string().optional(),
    respondToAll: z.boolean().default(false),
    removeBranding: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If respondToAll is false, keywords are required
      if (
        data.respondToAll === false &&
        (!data.keywords || data.keywords.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "At least one keyword is required when not responding to all messages",
      path: ["keywords"],
    }
  )
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
      // If applyOption is "selected", postId is required
      if (data.applyOption === "selected" && !data.postId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a post",
      path: ["postId"],
    }
  )
  .refine(
    (data) => {
      // If messageType is ButtonImage, imageUrl is required
      if (
        data.messageType === "ButtonImage" &&
        (!data.imageUrl || data.imageUrl.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Image URL is required for Button Image type",
      path: ["imageUrl"],
    }
  )
  .refine(
    (data) => {
      // If messageType is ButtonText or ButtonImage, buttonTitle is required
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
      message: "Button section title is required",
      path: ["buttonTitle"],
    }
  )
  .refine(
    (data) => {
      // If enableCommentAutomation is true, commentMessage array should not be empty
      if (
        data.enableCommentAutomation &&
        (!data.commentMessage || data.commentMessage.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "At least one auto reply message is required",
      path: ["commentMessage"],
    }
  )
  .refine(
    (data) => {
      // If isFollowed is true, notFollowerMessage is required
      if (
        data.isFollowed &&
        (!data.notFollowerMessage || data.notFollowerMessage.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Message for non-followers is required",
      path: ["notFollowerMessage"],
    }
  )
  .refine(
    (data) => {
      // If isFollowed is true, followButtonTitle is required
      if (
        data.isFollowed &&
        (!data.followButtonTitle || data.followButtonTitle.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Follow button title is required",
      path: ["followButtonTitle"],
    }
  )
  .refine(
    (data) => {
      // If isFollowed is true, followUpMessage is required
      if (
        data.isFollowed &&
        (!data.followUpMessage || data.followUpMessage.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Follow-up message is required",
      path: ["followUpMessage"],
    }
  );

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
}

interface MediaItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  thumbnailUrl?: string;
  timestamp: string;
}

interface InstagramMediaResponse {
  data: InstagramMediaItem[];
  paging?: {
    cursors: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export function CreateAutomationForm() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  // Always keep post selection open
  const [selectPostOpen] = useState(true);
  const [dmTypeOpen, setDmTypeOpen] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [commentAutomationOpen, setCommentAutomationOpen] = useState(false);
  const [isFollowedOpen, setIsFollowedOpen] = useState(false);
  const [buttons, setButtons] = useState<{ url: string; buttonText: string }[]>(
    []
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);

  const toggleDmType = () => {
    setDmTypeOpen(!dmTypeOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      applyOption: "selected",
      postId: "",
      keywords: [],
      messageType: "message",
      message: "",
      imageUrl: "",
      enableCommentAutomation: false,
      commentMessage: [],
      autoReplyLimit: 100,
      enableBacktrack: false,
      isFollowed: false,
      notFollowerMessage:
        "Please follow our account to receive the information you requested. Once you've followed, click the button below.",
      followButtonTitle: "I'm following now!",

      followUpMessage:
        "It seems you haven't followed us yet. Please follow our account and click the button below when you're done.",
      respondToAll: false,
      removeBranding: false,
    },
  });

  const toggleCommentAutomation = () => {
    if (form.watch("enableCommentAutomation")) {
      setCommentAutomationOpen(!commentAutomationOpen);
    }
  };

  const toggleIsFollowed = () => {
    if (form.watch("isFollowed")) {
      setIsFollowedOpen(!isFollowedOpen);
    }
  };

  const applyOption = form.watch("applyOption");
  const messageType = form.watch("messageType");
  const enableCommentAutomation = form.watch("enableCommentAutomation");
  const isFollowed = form.watch("isFollowed");

  // Watch for changes to enableCommentAutomation and update commentAutomationOpen
  useEffect(() => {
    if (enableCommentAutomation) {
      setCommentAutomationOpen(true);
    } else {
      setCommentAutomationOpen(false);
    }
  }, [enableCommentAutomation]);

  // Watch for changes to isFollowed and update isFollowedOpen
  useEffect(() => {
    if (isFollowed) {
      setIsFollowedOpen(true);
    } else {
      setIsFollowedOpen(false);
    }
  }, [isFollowed]);

  // Add a default button when ButtonText or ButtonImage is selected and no buttons exist
  useEffect(() => {
    if (
      (messageType === "ButtonText" || messageType === "ButtonImage") &&
      buttons.length === 0
    ) {
      // Set default button title in the form
      form.setValue("buttonTitle", "Default Button");

      setButtons([
        {
          url: "",
          buttonText: "Click Here",
        },
      ]);
    }
  }, [messageType, buttons.length, form]);

  useEffect(() => {
    if (messageType === "ButtonImage") {
      if (!form.getValues("imageUrl")) {
        form.setValue("imageUrl", "");
      }
    }
  }, [form, messageType]);

  useEffect(() => {
    if (
      messageType !== "ButtonText" &&
      messageType !== "ButtonImage" &&
      buttons.length > 0
    ) {
      form.setValue("buttonTitle", "");

      setButtons([{ url: "", buttonText: "" }]);
    }
  }, [buttons.length, form, messageType]);

  // Track all loaded cursors to prevent duplicate loading
  const [loadedCursors, setLoadedCursors] = useState<Set<string>>(new Set());

  const fetchMedia = async (
    direction: "initial" | "next" | "previous" = "initial"
  ) => {
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
      console.error(
        "Instagram user ID or access token not found in localStorage"
      );
      toast.error("Instagram user ID or access token not found");
      setIsLoading(false);
      setIsPaginating(false);
      return;
    }

    try {
      // Build the URL with the appropriate cursor if needed
      let url = `https://graph.instagram.com/v18.0/${instagramId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp&limit=25&access_token=${instagramAccessToken}`;

      // Determine which cursor to use based on navigation direction
      let currentCursor = "";
      if (direction === "next" && afterCursor) {
        currentCursor = afterCursor;
        url += `&after=${afterCursor}`;
      } else if (direction === "previous" && beforeCursor) {
        currentCursor = beforeCursor;
        url += `&before=${beforeCursor}`;
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
        throw new Error(`Failed to fetch media: ${response.statusText}`);
      }

      const data: InstagramMediaResponse = await response.json();

      // Check if there are any media items
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

      // Only show pagination if there are more than 25 posts total
      // or if we already navigated to a page (currentPage > 0)

      const newMediaItems = data.data.map((item: InstagramMediaItem) => ({
        id: item.id,
        title: item.caption || `Post ${item.id}`,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        thumbnailUrl: item.thumbnail_url,
        timestamp: item.timestamp,
      }));

      // Handle the media items based on the direction
      if (direction === "initial") {
        // For initial load, just set the media
        setMedia(newMediaItems);
      } else if (direction === "next") {
        // For next page, append the new items without duplicates
        setMedia((prevMedia) => {
          // Create a set of existing IDs for quick lookup
          const existingIds = new Set(prevMedia.map((item) => item.id));
          // Filter out any duplicates from the new items
          const uniqueNewItems = newMediaItems.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prevMedia, ...uniqueNewItems];
        });

        // Add this cursor to our loaded set
        if (currentCursor) {
          setLoadedCursors((prev) => new Set(prev).add(currentCursor));
        }
      } else if (direction === "previous") {
        // For previous page, prepend the new items without duplicates
        setMedia((prevMedia) => {
          // Create a set of existing IDs for quick lookup
          const existingIds = new Set(prevMedia.map((item) => item.id));
          // Filter out any duplicates from the new items
          const uniqueNewItems = newMediaItems.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...uniqueNewItems, ...prevMedia];
        });

        // Add this cursor to our loaded set
        if (currentCursor) {
          setLoadedCursors((prev) => new Set(prev).add(currentCursor));
        }
      }

      // Update cursors for pagination
      if (data.paging?.cursors) {
        if (data.paging.cursors.after) {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching media:", error.message);
        toast.error(`Failed to fetch media: ${error.message}`);
      } else {
        console.error("Unknown error fetching media:", error);
        toast.error("Failed to fetch media");
      }
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  };

  // Initial fetch of media
  useEffect(() => {
    const initialFetch = async () => {
      const instagramId = user.instagramId;
      const instagramAccessToken = user.instagramAccessToken;

      if (!instagramId || !instagramAccessToken) {
        console.error("Instagram user ID or access token not found");
        toast.error("Instagram user ID or access token not found");
        return;
      }

      setIsLoading(true);

      try {
        // Initial fetch to get the first 25 posts
        const url = `https://graph.instagram.com/v18.0/${instagramId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp&limit=25&access_token=${instagramAccessToken}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.statusText}`);
        }

        const data: InstagramMediaResponse = await response.json();

        // Map the items
        const mediaItems = data.data.map((item: InstagramMediaItem) => ({
          id: item.id,
          title: item.caption || `Post ${item.id}`,
          mediaUrl: item.media_url,
          mediaType: item.media_type,
          thumbnailUrl: item.thumbnail_url,
          timestamp: item.timestamp,
        }));

        setMedia(mediaItems);

        if (data.data.length === 25 && data.paging?.cursors?.after) {
          setAfterCursor(data.paging.cursors.after);
        } else {
          setAfterCursor(null);
        }
      } catch (error) {
        console.error("Error in initial media fetch:", error);
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
  }, [user.instagramId, user.instagramAccessToken]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // Validate form before submission
      const errors = form.formState.errors;
      if (Object.keys(errors).length > 0) {
        // Scroll to the first error
        const firstErrorField = Object.keys(errors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Show toast with error message
        toast.error("Please fix the errors in the form before submitting");
        setIsLoading(false);
        return;
      }

      const postIds =
        values.applyOption === "all"
          ? media.map((post) => post.id)
          : values.postId
          ? [values.postId]
          : [];

      // This validation is handled by the form schema now
      // but we'll keep it as a fallback
      if (values.applyOption === "selected" && !values.postId) {
        form.setError("postId", { message: "Please select a post" });
        toast.error("Please select a post");
        setIsLoading(false);
        return;
      }

      const userId = user._id;
      if (!userId) {
        toast.error("User not found");
        return;
      }

      // Ensure imageUrl is properly handled
      const finalImageUrl =
        values.messageType === "ButtonImage" && values.imageUrl
          ? values.imageUrl
          : undefined;

      const { ...valuesWithoutMessage } = values;

      // In the onSubmit function, modify the axios POST request:
      // Ensure buttons have title field set to match the buttonTitle
      // This is needed because the MongoDB schema still validates title as required
      // Also ensure all URLs start with https://
      const buttonsList = buttons.map(({ url, buttonText }) => ({
        url:
          url && !url.startsWith("http://") && !url.startsWith("https://")
            ? `https://${url}`
            : url,
        buttonText,
      }));

      const response = await axios.post("/api/automations", {
        ...(values.messageType === "message" ? values : valuesWithoutMessage),
        postIds,
        keywords: values.keywords,
        user: userId,
        imageUrl: finalImageUrl,
        // Only include message field if messageType is 'message'
        message: values.messageType === "message" ? values.message : undefined,

        buttonTitle:
          values.messageType === "ButtonText" ||
          values.messageType === "ButtonImage"
            ? values.buttonTitle
            : undefined,

        buttons:
          values.messageType === "ButtonText" ||
          values.messageType === "ButtonImage"
            ? buttonsList
            : undefined,
        autoReplyLimitLeft: values.autoReplyLimit || 100,
        notFollowerMessage: values.isFollowed
          ? values.notFollowerMessage
          : undefined,
        followButtonTitle: values.isFollowed
          ? values.followButtonTitle
          : undefined,
        followUpMessage: values.isFollowed ? values.followUpMessage : undefined,
        respondToAll: Boolean(values.respondToAll),
      });
      toast.success("Automation created successfully!");

      // Process backtrack if enabled
      if (values.enableBacktrack) {
        toast.info("Processing existing comments...");
        try {
          // Create backtrack payload without message field for button types
          const backtrackPayload = {
            mediaIds: postIds,
            accessToken: user.instagramAccessToken,
            automationId: response.data.id,
            automationName: values.name,
            keywords: values.keywords,
            commentMessage: values.commentMessage,
            isFollowed: values.isFollowed,
            removeBranding: values.removeBranding,
            respondToAll: Boolean(values.respondToAll),
          };

          // Only add message field if messageType is 'message'
          if (values.messageType === "message" && values.message) {
            Object.assign(backtrackPayload, { message: values.message });
          }

          const backtrackResponse = await axios.post(
            "/api/process-backtrack",
            backtrackPayload
          );

          if (backtrackResponse.data.success) {
            toast.success("Successfully processed existing comments");
          } else {
            toast.error("Failed to process some existing comments");
          }
        } catch (error) {
          console.error("Error processing backtrack:", error);
          toast.error("Failed to process existing comments");
        }
      }

      router.push("/dashboard/automation?type=post");
    } catch (error) {
      console.error("Error creating automation:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to create automation"
        );
      } else {
        toast.error("Failed to create automation");
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
                    <Link href="/dashboard/automation?type=post">
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
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Publish Automation
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Post Selection Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-[#1A69DD]/10 dark:border-gray-700"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent">
                Select Post
              </h2>
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
                      {/* All Posts Card */}
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
                            <h3 className="text-lg font-semibold">All Posts</h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            Automatically apply this workflow to all existing
                            posts
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

                      {/* Specific Post Card */}
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
                              Specific Post
                            </h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            Choose individual posts to apply this automation
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

            {/* Post Selection Grid */}
            <AnimatePresence>
              {applyOption === "selected" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8"
                >
                  {/* Post selection error will be shown after the grid */}

                  {/* Content */}
                  {selectPostOpen && (
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
                          {/* SimpleBar for horizontal scrolling with custom styling */}
                          <div className="relative">
                            <SimpleBar
                              className={`py-2 ${
                                form.formState.errors.postId
                                  ? "border-2 border-red-500 dark:border-red-500 rounded-lg p-2"
                                  : ""
                              }`}
                              style={{
                                height: "100%",
                                overflowX: "auto",
                              }}
                              autoHide={false}
                              onScroll={() => {
                                const scrollContainer = document.querySelector(
                                  ".simplebar-content-wrapper"
                                );
                                if (scrollContainer) {
                                  const element =
                                    scrollContainer as HTMLDivElement;
                                  const scrollThreshold = 100; // pixels before end/beginning to trigger load

                                  // Detect scroll end - load next posts
                                  if (
                                    element.scrollWidth - element.scrollLeft <=
                                      element.clientWidth + scrollThreshold &&
                                    !isPaginating &&
                                    afterCursor
                                  ) {
                                    fetchMedia("next");
                                  }

                                  // Detect scroll beginning - load previous posts
                                  if (
                                    element.scrollLeft <= scrollThreshold &&
                                    !isPaginating &&
                                    beforeCursor
                                  ) {
                                    fetchMedia("previous");
                                  }
                                }
                              }}
                            >
                              {/* Posts Container */}
                              <div className="inline-flex gap-4 pl-2 pr-4">
                                {media.map((item) => (
                                  <div
                                    key={item.id}
                                    className="inline-block w-[250px] flex-shrink-0"
                                  >
                                    <FormField
                                      control={form.control}
                                      name="postId"
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
                                              {/* Media Preview */}
                                              <div className="relative h-full w-full bg-gray-100 dark:bg-gray-700">
                                                {item.mediaType === "IMAGE" && (
                                                  <Image
                                                    src={item.mediaUrl}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                    loading="lazy"
                                                  />
                                                )}
                                              </div>

                                              {/* Selection Overlay */}
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

                                              {/* Selection Badge */}
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

                                {/* Loading Indicator */}
                                {isPaginating && (
                                  <div className="inline-flex w-[250px] flex-shrink-0 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#1A69DD] dark:text-[#26A5E9]" />
                                  </div>
                                )}
                              </div>
                            </SimpleBar>

                            {/* Single line error message for post selection */}
                            {form.formState.errors.postId && (
                              <div className="mt-2 flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                <AlertCircle size={14} />
                                <p className="text-sm font-medium">
                                  {form.formState.errors.postId.message}
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
                  {" "}
                  {/* Adjusted positioning */}
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
                      onValueChange={(value) => {
                        const boolValue = value === "true";
                        field.onChange(boolValue);
                        if (boolValue) form.clearErrors("keywords");
                      }}
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

                          {/* Error message for keywords */}
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

          {/* DM Type section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                DM Type
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
                                      {type === "message"}
                                      {type === "ButtonText"}
                                      {type === "ButtonImage"}
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
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value.trim() !== "") {
                                  form.clearErrors("message");
                                }
                              }}
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
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (e.target.value.trim() !== "") {
                                    form.clearErrors("imageUrl");
                                  }
                                }}
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
                                  className="border-2 border-gray-200 dark:border-gray-700 focus:border-[#1A69DD] dark:focus:border-[#26A5E9]"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
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
                                  />
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
                                  />
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

          {/* Auto Reply section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                Auto Reply
              </h2>
              <Button
                type="button"
                variant="ghost"
                className={`text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 dark:hover:bg-[#26A5E9]/10 flex items-center gap-2 ${
                  !enableCommentAutomation
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={toggleCommentAutomation}
                disabled={!enableCommentAutomation}
              >
                {/* {commentAutomationOpen ? "Collapse" : "Expand"} */}
                {commentAutomationOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="enableCommentAutomation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-[#1A69DD]/20 dark:border-[#26A5E9]/20 p-4 bg-white dark:bg-gray-800">
                  <div className="space-y-1">
                    <Label className="text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                      Enable Auto Reply
                    </Label>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Automatically respond to comments using your templates
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

            {commentAutomationOpen && form.watch("enableCommentAutomation") && (
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="commentMessage"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value?.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="flex items-center bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded-full px-3 py-1.5"
                            >
                              <span className="text-[#1A69DD] dark:text-[#26A5E9] text-base font-medium mr-1">
                                {message}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newMessages = [...field.value];
                                  newMessages.splice(index, 1);
                                  field.onChange(newMessages);
                                }}
                                className="text-[#1A69DD] dark:text-[#26A5E9] hover:text-[#1A69DD]/70 dark:hover:text-[#26A5E9]/70"
                              >
                                <X size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </div>

                        <div className="relative">
                          <Input
                            placeholder="Add auto reply"
                            className={`w-full py-6 px-6 rounded-xl border-2 ${
                              form.formState.errors.commentMessage
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            } focus:border-[#1A69DD] focus:ring-0 dark:focus:border-[#26A5E9]`}
                            value={newCommentMessage}
                            onChange={(e) =>
                              setNewCommentMessage(e.target.value)
                            }
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                              if (
                                e.key === "Enter" &&
                                newCommentMessage.trim()
                              ) {
                                e.preventDefault();
                                const trimmedMessage = newCommentMessage.trim();
                                // Check if message already exists (case insensitive)
                                if (
                                  !field.value?.some(
                                    (m) =>
                                      m.toLowerCase() ===
                                      trimmedMessage.toLowerCase()
                                  )
                                ) {
                                  const updatedMessages = [
                                    ...(field.value || []),
                                  ];
                                  updatedMessages.push(trimmedMessage);
                                  field.onChange(updatedMessages);
                                  // Clear any errors
                                  form.clearErrors("commentMessage");
                                  setNewCommentMessage("");
                                } else {
                                  toast.error(
                                    "This auto reply message already exists"
                                  );
                                  setNewCommentMessage("");
                                }
                              }
                            }}
                          />
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            className="absolute right-2 top-2 bottom-2 px-4 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white rounded-lg flex items-center gap-2"
                            onClick={() => {
                              if (newCommentMessage.trim()) {
                                const trimmedMessage = newCommentMessage.trim();
                                // Check if message already exists (case insensitive)
                                if (
                                  !field.value?.some(
                                    (m) =>
                                      m.toLowerCase() ===
                                      trimmedMessage.toLowerCase()
                                  )
                                ) {
                                  const updatedMessages = [
                                    ...(field.value || []),
                                  ];
                                  updatedMessages.push(trimmedMessage);
                                  field.onChange(updatedMessages);
                                  // Clear any errors
                                  form.clearErrors("commentMessage");
                                  setNewCommentMessage("");
                                } else {
                                  toast.error(
                                    "This auto-reply message already exists"
                                  );
                                  setNewCommentMessage("");
                                }
                              }
                            }}
                          >
                            <Plus size={18} />
                            <span className="font-semibold">Add</span>
                          </motion.button>
                        </div>
                      </div>
                      <FormDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter or click Add to add a auto reply message
                      </FormDescription>
                      {form.formState.errors.commentMessage && (
                        <FormMessage className="text-sm font-medium text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          {form.formState.errors.commentMessage.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="autoReplyLimit"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <Label className="text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                        {" "}
                        Reply Limit
                      </Label>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) =>
                            field.onChange(
                              value === "unlimited" ? -1 : parseInt(value)
                            )
                          }
                          value={
                            field.value === -1
                              ? "unlimited"
                              : field.value
                              ? field.value.toString()
                              : "100"
                          }
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {[
                            { value: "100", label: "100 Replies" },
                            { value: "200", label: "200 Replies" },
                            { value: "unlimited", label: "Unlimited" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                (field.value === -1 &&
                                  option.value === "unlimited") ||
                                (field.value !== null &&
                                  field.value !== undefined &&
                                  field.value.toString() === option.value)
                                  ? "border-[#1A69DD] bg-[#1A69DD]/5 dark:border-[#26A5E9] dark:bg-[#26A5E9]/10"
                                  : "border-gray-200 dark:border-gray-700 hover:border-[#1A69DD]/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="autoReplyLimit"
                                value={option.value}
                                checked={
                                  (field.value === -1 &&
                                    option.value === "unlimited") ||
                                  (field.value !== null &&
                                    field.value !== undefined &&
                                    field.value.toString() === option.value)
                                }
                                onChange={() => {
                                  const newValue =
                                    option.value === "unlimited"
                                      ? -1
                                      : parseInt(option.value);
                                  field.onChange(newValue);
                                }}
                                className="sr-only" // Hide the actual radio input
                              />
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-current">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      (field.value === -1 &&
                                        option.value === "unlimited") ||
                                      (field.value &&
                                        field.value.toString() === option.value)
                                        ? "bg-[#1A69DD] dark:bg-[#26A5E9]"
                                        : "bg-transparent"
                                    }`}
                                  />
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {option.label}
                                </span>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Set the maximum number of auto-replies for this
                        automation. Number must be greater than or equal to 100,
                        or choose Unlimited.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </motion.div>

          {/* Backtrack Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                Backtrack
              </h2>
            </div>
            <FormField
              control={form.control}
              name="enableBacktrack"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-[#1A69DD]/20 dark:border-[#26A5E9]/20 p-4 bg-white dark:bg-gray-800">
                  <div className="space-y-1">
                    <Label className="text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                      Enable Backtrack
                    </Label>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Apply automation on selected posts to previous comments
                      upto 7 days old.
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

          {/* Ask to Follow section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#1A69DD]/10 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] bg-clip-text text-transparent mr-12">
                Ask to Follow
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#1A69DD] dark:text-[#26A5E9] hover:bg-[#1A69DD]/10 dark:hover:bg-[#26A5E9]/10 flex items-center gap-2"
                onClick={toggleIsFollowed}
              >
                {isFollowedOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="isFollowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-[#1A69DD]/20 dark:border-[#26A5E9]/20 p-4 bg-white dark:bg-gray-800">
                  <div className="space-y-1">
                    <Label className="text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                      Ask to Follow
                    </Label>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Request users to follow your account before receiving the
                      message
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

            {isFollowedOpen && form.watch("isFollowed") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="notFollowerMessage"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                          <UserX className="w-5 h-5" />
                          Non-Follower Message
                        </Label>
                        <FormDescription className="text-gray-600 dark:text-gray-400 bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10 px-3 py-2 rounded-md">
                          Displayed to users who don&apos;t follow you
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Please follow my account to receive the message"
                            className="min-h-[120px] p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#1A69DD] focus:ring-2 focus:ring-[#1A69DD]/20 dark:focus:border-[#26A5E9] dark:focus:ring-[#26A5E9]/30 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 text-sm" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followButtonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                          <UserPlus className="w-5 h-5" />
                          Follow Button Text
                        </Label>
                        <FormDescription className="text-gray-600 dark:text-gray-400 bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10 px-3 py-2 rounded-md">
                          Customize your follow button text
                        </FormDescription>
                        <FormControl>
                          <Input
                            placeholder="Follow Now"
                            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#1A69DD] focus:ring-2 focus:ring-[#1A69DD]/20 dark:focus:border-[#26A5E9] dark:focus:ring-[#26A5E9]/30 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 text-sm" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpMessage"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-lg font-medium text-[#1A69DD] dark:text-[#26A5E9]">
                          <MessageCircle className="w-5 h-5" />
                          Follow-up Message
                        </Label>
                        <FormDescription className="text-gray-600 dark:text-gray-400 bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10 px-3 py-2 rounded-md">
                          Sent after users follow your account
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Thanks for following! Here's your message..."
                            className="min-h-[120px] p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#1A69DD] focus:ring-2 focus:ring-[#1A69DD]/20 dark:focus:border-[#26A5E9] dark:focus:ring-[#26A5E9]/30 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 text-sm" />
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </motion.div>

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
