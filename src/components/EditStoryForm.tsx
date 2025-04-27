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
  title?: string;
}

interface InstagramStoriesResponse {
  data: InstagramStoryItem[];
}

const buttonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "URL is required"),
  buttonText: z.string().min(1, "Button text is required"),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  applyOption: z.enum(["all", "selected"]),
  storyId: z.string().optional(),
  keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  messageType: z
    .enum(["message", "ButtonText", "ButtonImage"])
    .default("message"),
  message: z.string().min(1, "Message template is required"),
  imageUrl: z.union([
    z.string().url("Must be a valid image URL").optional(),
    z.literal("").optional(),
    z.undefined(),
  ]),
  buttons: z.array(buttonSchema).optional(),
  isFollowed: z.boolean().default(false),
  notFollowerMessage: z.string().optional(),
  followButtonTitle: z.string().optional(),
  followUpMessage: z.string().optional(),
  isActive: z.boolean().default(true),
  respondToAll: z.boolean().default(false),
  removeBranding: z.boolean().default(false),
});

interface EditStoryFormProps {
  story: {
    id: string;
    name: string;
    applyOption: "all" | "selected";
    storyId?: string;
    keywords: string;
    messageType: "message" | "ButtonText" | "ButtonImage";
    message: string;
    imageUrl?: string;
    buttons?: Array<{ title: string; url: string; buttonText: string }>;
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
  const [isFollowedOpen, setIsFollowedOpen] = useState(false);
  const [buttons, setButtons] = useState<
    Array<{ title: string; url: string; buttonText: string }>
  >(story.buttons || []);
  const [newKeyword, setNewKeyword] = useState("");

  const toggleDmType = () => {
    setDmTypeOpen(!dmTypeOpen);
  };

  const toggleIsFollowed = () => {
    if (form.watch("isFollowed")) {
      setIsFollowedOpen(!isFollowedOpen);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name: story.name,
      applyOption: story.applyOption,
      storyId: story.storyId,
      keywords: story.keywords
        ? story.keywords.split(",").map((k) => k.trim())
        : [],
      messageType: story.messageType,
      message: story.message,
      imageUrl: story.imageUrl,
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

  // Watch for changes to isFollowed and update isFollowedOpen
  useEffect(() => {
    if (isFollowed) {
      setIsFollowedOpen(true);
    } else {
      setIsFollowedOpen(false);
    }
  }, [isFollowed]);

  // Set initial state for isFollowedOpen based on story data
  useEffect(() => {
    if (story.isFollowed) {
      setIsFollowedOpen(true);
    }
  }, [story]);

  useEffect(() => {
    if (
      (messageType === "ButtonText" || messageType === "ButtonImage") &&
      buttons.length === 0
    ) {
      setButtons([{ title: "", url: "", buttonText: "" }]);
    } else if (messageType === "message") {
      setButtons([]);
    }
  }, [messageType, buttons.length]);

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    const instagramId = user.instagramId;
    const instagramAccessToken = user.instagramAccessToken;

    if (!instagramId || !instagramAccessToken) {
      console.error("Instagram user ID or access token not found");
      toast.error("Instagram user ID or access token not found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/v22.0/${instagramId}/stories?fields=id,media_type,media_url,thumbnail_url,timestamp&access_token=${instagramAccessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.statusText}`);
      }

      const data: InstagramStoriesResponse = await response.json();
      const allStories = data.data.map((item: InstagramStoryItem) => ({
        id: item.id,
        title: `Story ${item.id}`,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        thumbnailUrl: item.thumbnail_url,
        timestamp: item.timestamp,
      }));

      setStories(allStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to fetch stories");
    } finally {
      setIsLoading(false);
    }
  }, [user.instagramId, user.instagramAccessToken]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      // Handle the case when respondToAll is true - keywords can be empty
      const keywordsArray = values.respondToAll ? [] : values.keywords || [];

      const formData = {
        ...values,
        keywords: keywordsArray,
        buttons:
          values.messageType === "ButtonText" ||
          values.messageType === "ButtonImage"
            ? buttons
            : undefined,
        // Explicitly include respondToAll to ensure it's sent to the backend
        respondToAll: values.respondToAll,
      };

      await axios.put(`/api/automations/stories/${story.id}`, formData);

      toast.success("Story automation updated successfully");
      router.push("/dashboard/automation?type=story");
      router.refresh();
    } catch (error) {
      console.error("Error updating story automation:", error);
      toast.error("Failed to update story automation");
    } finally {
      setIsLoading(false);
    }
  };

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
              <h2 className="text-lg font-medium">Selected Posts</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : stories.length === 1 ? (
              <div className="flex justify-center">
                <Card className="overflow-hidden max-w-md w-full">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                    {stories[0].mediaType === "IMAGE" && (
                      <div className="w-full h-full relative">
                        <Image
                          src={stories[0].mediaUrl}
                          alt={stories[0].title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {stories[0].mediaType === "VIDEO" && (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                        {stories[0].thumbnailUrl ? (
                          <Image
                            src={stories[0].thumbnailUrl}
                            alt="Video Thumbnail"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Video Preview
                          </span>
                        )}
                      </div>
                    )}
                    {stories[0].mediaType === "CAROUSEL_ALBUM" && (
                      <div className="w-full h-full relative">
                        <Image
                          src={stories[0].thumbnailUrl || stories[0].mediaUrl}
                          alt={stories[0].title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 truncate">
                      {stories[0].title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(stories[0].timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </div>
            ) : stories.length > 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stories.map((item) => (
                  <Card key={item.id} className="overflow-hidden w-full">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                      {item.mediaType === "IMAGE" && (
                        <div className="w-full h-full relative">
                          <Image
                            src={item.mediaUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      {item.mediaType === "VIDEO" && (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                          {item.thumbnailUrl ? (
                            <Image
                              src={item.thumbnailUrl}
                              alt="Video Thumbnail"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              Video Preview
                            </span>
                          )}
                        </div>
                      )}
                      {item.mediaType === "CAROUSEL_ALBUM" && (
                        <div className="w-full h-full relative">
                          <Image
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No posts found for this automation
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
                              const updatedKeywords = [...(field.value || [])];
                              updatedKeywords.push(newKeyword.trim());
                              field.onChange(updatedKeywords);
                              setNewKeyword("");
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-2"
                          onClick={() => {
                            if (newKeyword.trim()) {
                              const updatedKeywords = [...(field.value || [])];
                              updatedKeywords.push(newKeyword.trim());
                              field.onChange(updatedKeywords);
                              setNewKeyword("");
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
                Message Template
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
                    {buttons.map((button, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Button Title</Label>
                            <Input
                              value={button.title}
                              onChange={(e) => {
                                const newButtons = [...buttons];
                                newButtons[index].title = e.target.value;
                                setButtons(newButtons);
                              }}
                              placeholder="Enter Title"
                              className="mt-1"
                            />
                          </div>
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
                        setButtons([
                          ...buttons,
                          { title: "", url: "", buttonText: "" },
                        ]);
                      }}
                      className="w-full mt-4"
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
