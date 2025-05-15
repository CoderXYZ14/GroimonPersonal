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
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { IAutomation } from "@/models/Automation";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
}

interface InstagramMediaResponse {
  data: InstagramMediaItem[];
  paging?: {
    cursors: {
      before?: string;
      after?: string;
    };
  };
}

interface MediaItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  thumbnailUrl?: string;
  timestamp: string;
}

const buttonSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  buttonText: z.string().min(1, "Button text is required"),
  title: z.string().optional(),
});

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
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
    enableBacktrack: z.boolean().default(false),
    isFollowed: z.boolean().default(false),
    notFollowerMessage: z.string().optional(),
    followButtonTitle: z.string().optional(),
    followUpMessage: z.string().optional(),
    isActive: z.boolean().default(true),
    respondToAll: z.boolean().default(false),
    removeBranding: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If respondToAll is false, keywords are required
      if (
        !data.respondToAll &&
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
  );

interface EditAutomationFormProps {
  automation: IAutomation;
}

export function EditAutomationForm({ automation }: EditAutomationFormProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [selectPostOpen, setSelectPostOpen] = useState(true);
  const [dmTypeOpen, setDmTypeOpen] = useState(true);
  const [commentAutomationOpen, setCommentAutomationOpen] = useState(false);
  const [isFollowedOpen, setIsFollowedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [isPaginating, setIsPaginating] = useState(false);
  const [buttons, setButtons] = useState<
    Array<{ url: string; buttonText: string }>
  >(
    automation.buttons?.map((button) => ({
      url: button.url,
      buttonText: button.buttonText,
    })) || []
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [newCommentMessage, setNewCommentMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);

  // Define fetchMedia with useCallback to prevent it from changing on every render

  const fetchMedia = async (
    direction: "initial" | "next" | "previous" = "initial"
  ) => {
    if (direction === "initial") {
      setIsLoading(true);
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
      let url = `https://graph.instagram.com/v18.0/${instagramId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp&limit=25&access_token=${instagramAccessToken}`;

      // Determine which cursor to use based on navigation direction
      if (direction === "next" && afterCursor) {
        url += `&after=${afterCursor}`;
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "previous" && beforeCursor) {
        url += `&before=${beforeCursor}`;
        setCurrentPage((prev) => Math.max(0, prev - 1));
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

      const newMediaItems = data.data.map((item: InstagramMediaItem) => ({
        id: item.id,
        title: item.caption || `Post ${item.id}`,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        thumbnailUrl: item.thumbnail_url,
        timestamp: item.timestamp,
      }));

      // Always replace the media with the new batch
      setMedia(newMediaItems);

      // Update cursors for pagination
      if (data.paging?.cursors) {
        // Only set afterCursor if we have exactly 25 posts (a full page)
        // This ensures we don't show the Next button when there are no more posts
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

        // Only set afterCursor if we have exactly 25 posts (a full page)
        // This ensures we don't show the Next button when there are no more posts
        if (data.paging?.cursors?.after && data.data.length === 25) {
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

  const toggleDmType = () => {
    setDmTypeOpen(!dmTypeOpen);
  };

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

  const toggleSelectPost = () => {
    setSelectPostOpen(!selectPostOpen);
  };

  // Default values for the form with proper handling of all fields
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: automation.name,
      applyOption:
        automation.postIds && automation.postIds.length === 1
          ? "selected"
          : "all",
      postId:
        automation.postIds && automation.postIds.length === 1
          ? automation.postIds[0]
          : "",
      keywords: automation.keywords || [],
      messageType: automation.messageType || "message",
      message: automation.message,
      imageUrl: automation.imageUrl || "",
      buttonTitle: automation.buttonTitle || "",
      buttons:
        automation.buttons?.map((button) => ({
          url: button.url,
          buttonText: button.buttonText,
        })) || [],
      enableCommentAutomation: automation.enableCommentAutomation,
      commentMessage: Array.isArray(automation.commentMessage)
        ? automation.commentMessage
        : [],
      enableBacktrack: automation.enableBacktrack,
      isFollowed: automation.isFollowed,
      notFollowerMessage:
        automation.notFollowerMessage ||
        "Please follow our account to receive the information you requested. Once you've followed, click the button below.",
      followButtonTitle: automation.followButtonTitle || "I'm following now!",
      followUpMessage:
        automation.followUpMessage ||
        "Thanks for following! Here's your message...",
      isActive: automation.isActive !== undefined ? automation.isActive : true,
      respondToAll:
        automation.respondToAll !== undefined ? automation.respondToAll : false,
      removeBranding: automation.removeBranding,
    },
  });

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

  useEffect(() => {
    if (
      (messageType === "ButtonText" || messageType === "ButtonImage") &&
      buttons.length === 0
    ) {
      // Set default button title in the form
      form.setValue("buttonTitle", "Default Button");

      // Add a default button without title (title is now at form level)
      setButtons([
        {
          url: "https://example.com",
          buttonText: "Click Here",
        },
      ]);
    } else if (messageType === "message") {
      setButtons([]);
    }
  }, [messageType, buttons.length, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // Handle the case when respondToAll is true - keywords can be empty
      let keywordsArray = [];
      if (values.respondToAll) {
        // If respondToAll is true, we can send an empty array for keywords
        keywordsArray = [];
      } else {
        // Use the keywords array directly
        keywordsArray = values.keywords || [];
      }

      const postIds =
        values.applyOption === "all"
          ? media.map((post) => post.id)
          : values.postId
          ? [values.postId]
          : [];
      if (values.applyOption === "selected" && !values.postId) {
        throw new Error("Please select a post");
      }

      // Ensure imageUrl is properly handled
      const finalImageUrl =
        values.messageType === "ButtonImage" && values.imageUrl
          ? values.imageUrl
          : undefined;

      // Create request payload without the message field for button types
      const { ...valuesWithoutMessage } = values;

      // Update the automation - try a different approach that might work better with ngrok
      await axios.put(`/api/automations?id=${automation._id}`, {
        id: automation._id,
        ...(values.messageType === "message" ? values : valuesWithoutMessage),
        postIds,
        keywords: keywordsArray,
        imageUrl: finalImageUrl,
        // Only include message field if messageType is 'message'
        message: values.messageType === "message" ? values.message : undefined,
        notFollowerMessage: values.isFollowed
          ? values.notFollowerMessage
          : undefined,
        followButtonTitle: values.isFollowed
          ? values.followButtonTitle
          : undefined,
        followUpMessage: values.isFollowed ? values.followUpMessage : undefined,
        // Include buttonTitle at the main level
        buttonTitle:
          values.messageType === "ButtonText" ||
          values.messageType === "ButtonImage"
            ? values.buttonTitle
            : undefined,
        // Ensure buttons have title field set to match the buttonTitle
        // This is needed because the MongoDB schema still validates title as required
        buttons:
          values.messageType === "ButtonText" ||
          values.messageType === "ButtonImage"
            ? buttons.map(({ url, buttonText }) => ({
                url:
                  url &&
                  !url.startsWith("http://") &&
                  !url.startsWith("https://")
                    ? `https://${url}`
                    : url,
                buttonText,
                title: values.buttonTitle || "", // Add title field with buttonTitle value
              }))
            : undefined,
        // Explicitly include respondToAll to ensure it's sent to the backend
        respondToAll: values.respondToAll,
      });

      toast.success("Automation updated successfully");
      router.push("/dashboard/automation?type=post");
      router.refresh();
    } catch (error) {
      console.error("Error updating automation:", error);
      toast.error("Failed to update automation");
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Untitled"
                      className="text-xl font-medium border-none focus-visible:ring-0 px-2 bg-transparent max-w-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Link href="/dashboard/automation?type=post">
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700"
                >
                  Back
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>

          {/* Post selection section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Posts</h2>
              {form.watch("applyOption") === "selected" && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-300 flex items-center"
                  onClick={toggleSelectPost}
                >
                  Select post
                  {selectPostOpen ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="applyOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="text-sm">
                          Apply on all posts
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="selected" id="selected" />
                        <Label htmlFor="selected" className="text-sm">
                          Apply on selected post
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("applyOption") === "selected" && (
              <div className="mt-4">
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-t-purple-500 border-b-purple-300 border-l-purple-300 border-r-purple-300 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {media.length > 0 ? (
                      media.map((item) => (
                        <Card
                          key={item.id}
                          className="overflow-hidden w-full border border-gray-200 dark:border-gray-700 transition-transform hover:scale-[1.02]"
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {item.mediaType === "IMAGE" && (
                              <Image
                                src={item.mediaUrl}
                                alt={item.title}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                                loading="lazy"
                              />
                            )}
                            {item.mediaType === "VIDEO" && (
                              <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {item.thumbnailUrl ? (
                                  <Image
                                    src={item.thumbnailUrl}
                                    alt={item.title}
                                    width={150}
                                    height={150}
                                    className="w-full h-full object-cover"
                                    unoptimized={true}
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="absolute text-gray-500 dark:text-gray-400 text-xs">
                                    Video Preview
                                  </span>
                                )}
                              </div>
                            )}
                            {item.mediaType === "CAROUSEL_ALBUM" && (
                              <Image
                                src={
                                  item.thumbnailUrl ||
                                  "/api/placeholder/150/150"
                                }
                                alt={item.title}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <FormField
                              control={form.control}
                              name="postId"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 m-0">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          value={item.id}
                                          id={item.id}
                                          checked={field.value === item.id}
                                        />
                                        <Label
                                          htmlFor={item.id}
                                          className="text-xs"
                                        >
                                          Select
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-medium truncate">
                                {item.title || "No caption"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center w-full py-4 text-muted-foreground">
                        No media found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Only show pagination when needed */}
          {currentPage > 0 || afterCursor ? (
            <div className="flex justify-center gap-4 mt-6 w-full">
              {currentPage > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchMedia("previous")}
                  disabled={isPaginating || isLoading}
                  className="px-6"
                >
                  {isPaginating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "← Previous"
                  )}
                </Button>
              )}
              {afterCursor && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchMedia("next")}
                  disabled={isPaginating || isLoading}
                  className="px-6"
                >
                  {isPaginating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Next →"
                  )}
                </Button>
              )}
            </div>
          ) : null}

          {/* Trigger/Keywords section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Trigger</h2>
              {!form.watch("respondToAll") && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-green-500 flex items-center"
                >
                  {keywordsCount} keyword{keywordsCount !== 1 ? "s" : ""}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="respondToAll"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={field.value ? "true" : "false"}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <Label className="font-normal">
                          a specific word or words
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <Label className="font-normal">any word</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch("respondToAll") && (
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value?.map((keyword, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1 text-sm"
                            >
                              <span className="mr-1">{keyword}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newKeywords = [...field.value];
                                  newKeywords.splice(index, 1);
                                  field.onChange(newKeywords);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <Input
                            placeholder="Add keyword"
                            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === "Enter" && newKeyword.trim()) {
                                e.preventDefault();
                                const trimmedKeyword = newKeyword.trim();
                                // Check if keyword already exists (case insensitive)
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
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={() => {
                              if (newKeyword.trim()) {
                                const trimmedKeyword = newKeyword.trim();
                                // Check if keyword already exists (case insensitive)
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
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <FormDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter or click Add to add a keyword
                      </FormDescription>
                      {form.formState.isSubmitted &&
                        (!field.value || field.value.length === 0) && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            At least one keyword is required when not responding
                            to all messages
                          </p>
                        )}
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* DM Type section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">DM Message</h2>
              <Button
                type="button"
                variant="ghost"
                className="text-green-500 flex items-center"
                onClick={toggleDmType}
              >
                Message Type
                {dmTypeOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>

            {dmTypeOpen && (
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="message" id="message" />
                            <Label htmlFor="message">Message</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="ButtonText"
                              id="ButtonText"
                            />
                            <Label htmlFor="ButtonText">Button Text</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="ButtonImage"
                              id="ButtonImage"
                            />
                            <Label htmlFor="ButtonImage">Button Image</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {messageType === "message" && (
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your message template"
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {messageType === "ButtonImage" && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-2">
                            <Label>Main Image URL</Label>
                            <Input
                              placeholder="https://example.com/main-image.jpg"
                              className="w-full"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(messageType === "ButtonText" ||
                  messageType === "ButtonImage") && (
                  <div className="space-y-4">
                    {/* Button Title moved to form level */}
                    <FormField
                      control={form.control}
                      name="buttonTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Title" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500 mt-1">
                            This title will be used for all buttons
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2 space-y-4">
                        {buttons.map((button, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-4">
                              <div>
                                <Label>URL</Label>
                                <Input
                                  value={button.url}
                                  onChange={(e) => {
                                    const newButtons = [...buttons];
                                    newButtons[index].url = e.target.value;
                                    setButtons(newButtons);
                                  }}
                                  placeholder="Enter URL"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Button Text</Label>
                                <Input
                                  value={button.buttonText}
                                  onChange={(e) => {
                                    const newButtons = [...buttons];
                                    newButtons[index].buttonText =
                                      e.target.value;
                                    setButtons(newButtons);
                                  }}
                                  placeholder="Click here"
                                  className="mt-1"
                                />
                              </div>

                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  const newButtons = buttons.filter(
                                    (_, i) => i !== index
                                  );
                                  setButtons(newButtons);
                                }}
                              >
                                Remove Button
                              </Button>
                            </div>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Limit to maximum 3 buttons
                            if (buttons.length >= 3) {
                              toast.error("Maximum 3 buttons are allowed");
                              return;
                            }
                            setButtons([
                              ...buttons,
                              { url: "", buttonText: "" },
                            ]);
                          }}
                          className="w-full mt-4"
                          disabled={buttons.length >= 3}
                        >
                          Add Button
                        </Button>
                      </div>

                      {/* Button Preview Section */}
                      {buttons.length > 0 && (
                        <div className="w-full md:w-1/2 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
                          <h3 className="text-sm font-medium mb-3">
                            Button Preview
                          </h3>
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {messageType === "ButtonImage" && (
                              <div className="mb-3 flex justify-center">
                                {form.watch("imageUrl") ? (
                                  <Image
                                    src={form.watch("imageUrl")}
                                    alt="Preview image"
                                    width={200}
                                    height={150}
                                    className="rounded-md max-h-[150px] object-contain"
                                    unoptimized={true}
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/placeholder-image.jpg";
                                    }}
                                  />
                                ) : (
                                  <div className="w-[200px] h-[150px] border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                      <div className="flex justify-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-10 w-10 text-gray-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {form.watch("buttonTitle") && (
                              <div className="font-medium text-sm mb-2">
                                {form.watch("buttonTitle")}
                              </div>
                            )}
                            {!form.watch("removeBranding") && (
                              <div className="text-xs text-gray-500 mb-2">
                                Sent using groimon.com
                              </div>
                            )}
                            <div className="flex flex-col gap-2">
                              {buttons.map((button, index) => (
                                <Button
                                  key={index}
                                  className="w-full bg-white hover:bg-gray-50 text-black border border-gray-200"
                                  variant="outline"
                                  disabled
                                >
                                  {button.buttonText || "Click Here"}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Automation section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Auto Reply</h2>
              <Button
                type="button"
                variant="ghost"
                className="text-green-500 flex items-center"
                onClick={toggleCommentAutomation}
              >
                Comment Template
                {commentAutomationOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="enableCommentAutomation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Auto Reply</Label>
                    <FormDescription>
                      Automatically respond to comments on your posts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value?.map((message, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1 text-sm"
                            >
                              <span className="mr-1">{message}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newMessages = [...field.value];
                                  newMessages.splice(index, 1);
                                  field.onChange(newMessages);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <Input
                            placeholder="Add comment message"
                            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md"
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
                                  setNewCommentMessage("");
                                } else {
                                  toast.error(
                                    "This auto-reply message already exists"
                                  );
                                  setNewCommentMessage("");
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
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
                            Add
                          </Button>
                        </div>
                      </div>
                      <FormDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter or click Add to add a comment message
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Follow Request section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Follow Request</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={toggleIsFollowed}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ask to Follow</Label>
                    <FormDescription>
                      Request users to follow your account before receiving the
                      message
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isFollowedOpen && form.watch("isFollowed") && (
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="notFollowerMessage"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Message for Non-Followers</Label>
                      <FormDescription>
                        This message will be shown to users who don&apos;t
                        follow you
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Please follow my account to receive the message"
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followButtonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Follow Button Text</Label>
                      <FormDescription>
                        Text to display on the follow button
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Follow Now" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpMessage"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Follow-up Message</Label>
                      <FormDescription>
                        Message to send after user follows your account
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Thanks for following! Here's your message..."
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Backtrack</h2>
            </div>

            <FormField
              control={form.control}
              name="enableBacktrack"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Backtrack</Label>
                    <FormDescription>
                      Apply automation to previous comments on selected posts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Remove Branding section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Branding</h2>
            </div>

            <FormField
              control={form.control}
              name="removeBranding"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Remove Branding</Label>
                    <FormDescription>
                      Remove &ldquo;This automation is sent by Groimon&rdquo;
                      from messages
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
