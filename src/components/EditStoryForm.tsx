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
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

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
        if (direction === "next" && afterCursor) {
          url += `&after=${afterCursor}`;
          setCurrentPage((prev) => prev + 1);
        } else if (direction === "previous" && beforeCursor) {
          url += `&before=${beforeCursor}`;
          setCurrentPage((prev) => Math.max(0, prev - 1));
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

        // Always replace the stories with the new batch
        setStories(fetchedStories);
        setStoryLoaded(true);

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
              <Link href="/dashboard/automation?type=story">
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

          {/* Story selection section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Stories</h2>
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
                          Apply on all stories
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="selected" id="selected" />
                        <Label htmlFor="selected" className="text-sm">
                          Apply on selected story
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {applyOption === "selected" && selectStoryOpen && (
              <div className="mt-4">
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-t-purple-500 border-b-purple-300 border-l-purple-300 border-r-purple-300 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stories.length > 0 ? (
                      stories.map((item) => (
                        <Card
                          key={item.id}
                          className={`overflow-hidden w-full border transition-transform hover:scale-[1.02] ${
                            form.watch("storyId") === item.id
                              ? "border-purple-500 ring-2 ring-purple-300"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {item.mediaType === "IMAGE" && (
                              <Image
                                src={item.mediaUrl}
                                alt="Story"
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {item.mediaType === "VIDEO" && (
                              <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {item.thumbnailUrl ? (
                                  <Image
                                    src={item.thumbnailUrl}
                                    alt="Video Thumbnail"
                                    width={150}
                                    height={150}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="absolute text-gray-500 dark:text-gray-400 text-xs">
                                    Video Preview
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <FormField
                              control={form.control}
                              name="storyId"
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
                            {form.watch("storyId") === item.id && (
                              <div className="text-xs text-purple-500 font-medium">
                                Selected
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center w-full py-4 text-muted-foreground col-span-4">
                        No active stories found. Please create a story on
                        Instagram first.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {applyOption === "selected" &&
              selectStoryOpen &&
              stories.length > 0 && (
                <div className="flex justify-center mt-6 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchStories("previous")}
                    disabled={!beforeCursor || isPaginating || isLoading}
                    className="flex items-center gap-1"
                  >
                    {isPaginating && currentPage > 0 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage + 1}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchStories("next")}
                    disabled={!afterCursor || isPaginating || isLoading}
                    className="flex items-center gap-1"
                  >
                    Next
                    {isPaginating && afterCursor ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
          </div>
          {/* Trigger/Keywords section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Trigger</h2>
              {!form.watch("respondToAll") && (
                <div className="text-green-500 flex items-center">
                  {keywordsCount} keyword{keywordsCount !== 1 ? "s" : ""}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="respondToAll"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={field.value ? "true" : "false"}
                      className="flex flex-col space-y-2"
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
              <div>
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {field.value?.map((keyword, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1 text-sm"
                          >
                            <span>{keyword}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newKeywords = [...field.value];
                                newKeywords.splice(index, 1);
                                field.onChange(newKeywords);
                              }}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <Input
                          placeholder="Add keyword"
                          className="w-full rounded-md"
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
                      <FormDescription className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
                              value={field.value || ""}
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
                    {/* Button Title at the form level */}
                    <FormField
                      control={form.control}
                      name="buttonTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a title for all buttons"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                newButtons[index].buttonText = e.target.value;
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
                        setButtons([...buttons, { url: "", buttonText: "" }]);
                      }}
                      className="w-full mt-4"
                      disabled={buttons.length >= 3}
                    >
                      Add Button
                    </Button>
                  </div>
                )}
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
