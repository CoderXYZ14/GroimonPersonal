"use client";

import { useState, useEffect } from "react";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import axios from "axios";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  applyOption: z.enum(["all", "selected"]),
  postId: z.string().optional(),
  keywords: z.string().min(1, "At least one keyword is required"),
  message: z.string().min(1, "Message template is required"),
  enableCommentAutomation: z.boolean(),
  commentMessage: z.string().min(1, "Comment message is required"),
  isFollowed: z.boolean().default(false),
});

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
}

export function CreateAutomationForm() {
  const router = useRouter();
  const [selectPostOpen, setSelectPostOpen] = useState(true);
  const [dmTypeOpen, setDmTypeOpen] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentAutomationOpen, setCommentAutomationOpen] = useState(false);

  const toggleSelectPost = () => {
    setSelectPostOpen(!selectPostOpen);
  };

  const toggleDmType = () => {
    setDmTypeOpen(!dmTypeOpen);
  };

  const toggleCommentAutomation = () => {
    setCommentAutomationOpen(!commentAutomationOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      applyOption: "selected",
      postId: "",
      keywords: "",
      message: "",
      enableCommentAutomation: false,
      commentMessage: "",
      isFollowed: false,
    },
  });

  const applyOption = form.watch("applyOption");

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      const userDetail = JSON.parse(localStorage.getItem("user_details"));

      const instagramId = userDetail?.instagramId;
      const instagramAccessToken = userDetail?.instagramAccessToken;

      if (!instagramId || !instagramAccessToken) {
        console.error(
          "Instagram user ID or access token not found in localStorage"
        );
        toast.error("Instagram user ID or access token not found");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://graph.instagram.com/v22.0/${instagramId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp&access_token=${instagramAccessToken}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.statusText}`);
        }

        const data: InstagramMediaResponse = await response.json();
        setMedia(
          data.data.map((item: InstagramMediaItem) => ({
            id: item.id,
            title: item.caption || `Post ${item.id}`,
            mediaUrl: item.media_url,
            mediaType: item.media_type,
            thumbnailUrl: item.thumbnail_url,
            timestamp: item.timestamp,
          }))
        );
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
      }
    };

    fetchMedia();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const postIds =
        values.applyOption === "all"
          ? media.map((post) => post.id)
          : values.postId
          ? [values.postId]
          : [];
      if (values.applyOption === "selected" && !values.postId) {
        throw new Error("Please select a post");
      }

      const userDetail = JSON.parse(localStorage.getItem("user_details"));
      const userId = userDetail?._id;

      if (!userId) {
        console.error("User ID not found in session data");
        return;
      }

      await axios.post("/api/automations", {
        ...values,
        postIds,
        keywords: values.keywords.split(",").map((k) => k.trim()),
        user: userId,
      });

      toast.success("Automation created successfully!");
      router.push("/dashboard/automation");
    } catch (error) {
      console.error("Error creating automation:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to create automation"
        );
      } else {
        toast.error("Failed to create automation");
      }
    }
  }

  const keywordsCount = form.watch("keywords")
    ? form
        .watch("keywords")
        .split(",")
        .filter((k) => k.trim()).length
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
              <Link href="/dashboard/automation">
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
              >
                Publish
              </Button>
            </div>
          </div>

          {/* Post selection section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Posts</h2>
              {applyOption === "selected" && (
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
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {applyOption === "selected" && selectPostOpen && (
              <div className="mt-4">
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-t-purple-500 border-b-purple-300 border-l-purple-300 border-r-purple-300 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto gap-4 pb-2">
                    {media.length > 0 ? (
                      media.map((item) => (
                        <Card
                          key={item.id}
                          className="overflow-hidden flex-shrink-0 w-48 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {item.mediaType === "IMAGE" && (
                              <Image
                                src={item.mediaUrl}
                                alt={item.title}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {item.mediaType === "VIDEO" && (
                              <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="absolute text-gray-500 dark:text-gray-400 text-xs">
                                  Video Preview
                                </span>
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
                                      defaultValue={field.value}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          value={item.id}
                                          id={item.id}
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

          {/* Trigger/Keywords section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Trigger</h2>
              <Button
                type="button"
                variant="ghost"
                className="text-green-500 flex items-center"
              >
                {keywordsCount} keyword{keywordsCount !== 1 ? "s" : ""}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="send, dm me, hello"
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Separate keywords with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* DM Type section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">DM Type</h2>
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
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the message to send as an auto-reply"
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md min-h-[120px]"
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

          {/* Is Followed Check section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Follow Check</h2>
            </div>

            <FormField
              control={form.control}
              name="isFollowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Check if User is Following
                    </Label>
                    <FormDescription>
                      Only respond to users who follow your account
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

          {/* Comment Automation section */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Comment Automation</h2>
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
                    <Label className="text-base">
                      Enable Comment Automation
                    </Label>
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
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="commentMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the message to reply to comments"
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md min-h-[120px]"
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
        </form>
      </Form>
    </div>
  );
}
