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

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  applyOption: z.enum(["all", "current"]),
  postSelection: z.string().optional(),
  keywords: z.string().min(1, "At least one keyword is required"),
  message: z.string().min(1, "Message template is required"),
});

export function CreateAutomationForm() {
  interface MediaItem {
    id: string;
    title: string;
    mediaUrl: string;
    mediaType: string;
    thumbnailUrl?: string;
    timestamp: string;
  }

  const [selectPostOpen, setSelectPostOpen] = useState(false);
  const [dmTypeOpen, setDmTypeOpen] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelectPost = () => {
    setSelectPostOpen(!selectPostOpen);
  };

  const toggleDmType = () => {
    setDmTypeOpen(!dmTypeOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      applyOption: "current",
      keywords: "",
      message: "",
      postSelection: "",
    },
  });

  const applyOption = form.watch("applyOption");

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      const userId = localStorage.getItem("instagram_user_id");
      const accessToken = localStorage.getItem("instagram_token");

      if (!userId || !accessToken) {
        console.error(
          "Instagram user ID or access token not found in localStorage"
        );
        toast.error("Instagram user ID or access token not found");
        setIsLoading(false);
        return;
      }

      try {
        // Simulating data for demonstration
        setTimeout(() => {
          const demoData = [
            {
              id: "1",
              title: "My first post",
              mediaUrl: "/api/placeholder/150/150",
              mediaType: "IMAGE",
              timestamp: "2025-02-28T12:00:00Z",
            },
            {
              id: "2",
              title: "Video content",
              mediaUrl: "/api/placeholder/150/150",
              mediaType: "VIDEO",
              timestamp: "2025-02-27T10:30:00Z",
            },
            {
              id: "3",
              title: "Carousel post",
              mediaUrl: "/api/placeholder/150/150",
              mediaType: "CAROUSEL_ALBUM",
              thumbnailUrl: "/api/placeholder/150/150",
              timestamp: "2025-02-26T15:45:00Z",
            },
          ];

          setMedia(demoData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching media:", error);
        toast.error("Failed to fetch media");
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Save to local storage
    localStorage.setItem("automation_message", values.message);
    if (values.postSelection) {
      localStorage.setItem("tracked_post_id", values.postSelection);
    }

    // Display success message
    toast.success("Automation created successfully!");
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
          {/* Header with name and buttons */}
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
              <h2 className="text-lg font-medium">Post</h2>
              {applyOption === "current" && (
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
                          Apply for all posts and reels
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="current" />
                        <Label htmlFor="current" className="text-sm">
                          Apply for a current post or reel
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {applyOption === "current" && selectPostOpen && (
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
                              name="postSelection"
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
        </form>
      </Form>
    </div>
  );
}
