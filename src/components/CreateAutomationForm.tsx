"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  applyOption: z.enum(["all", "current"]),
  postSelection: z.string().optional(),
  keywords: z.string(),
  message: z.string(),
  reply: z.string().optional(),
  sendAutoReply: z.boolean().default(true),
  backtrack: z.boolean().default(false),
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

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      applyOption: "all",
      keywords: "",
      message: "",
      reply: "",
      postSelection: "",
      sendAutoReply: true,
      backtrack: false,
    },
  });

  const applyOption = form.watch("applyOption");
  const sendAutoReply = form.watch("sendAutoReply");

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);

      const userId = localStorage.getItem("instagram_user_id");
      const accessToken = localStorage.getItem("instagram_token");

      if (!userId || !accessToken) {
        console.error(
          "Instagram user ID or access token not found in localStorage"
        );
        toast.error("Instagram user ID or access token not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://graph.instagram.com/v22.0/${userId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp&access_token=${accessToken}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.statusText}`);
        }

        const data = await response.json();
        setMedia(
          data.data.map((item: any) => ({
            id: item.id,
            title: item.caption || `Post ${item.id}`,
            mediaUrl: item.media_url,
            mediaType: item.media_type,
            thumbnailUrl: item.thumbnail_url,
            timestamp: item.timestamp,
          }))
        );
      } catch (error) {
        console.error("Error fetching media:", error);
        toast.error("Failed to fetch media");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success("Automation created successfully!");
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <Input
          placeholder="Untitled"
          className="text-lg font-medium border-none max-w-[200px] focus-visible:ring-0 px-0"
          {...form.register("name")}
        />
        <div className="flex gap-2">
          <Button variant="outline">Back</Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Publish</Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Post</h2>
              <Button
                variant="ghost"
                className="text-gray-600 flex items-center"
              >
                Select post
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
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
                        <Label htmlFor="all">
                          Apply for all posts and reels
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="current" />
                        <Label htmlFor="current">
                          Apply for a current post or reel
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {applyOption === "current" && (
              <div className="mt-4 flex overflow-x-auto gap-4">
                {media.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden flex-shrink-0 w-48"
                  >
                    <div className="h-24 bg-gray-200 flex items-center justify-center">
                      {item.mediaType === "IMAGE" && (
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Add other media types here */}
                      {item.mediaType === "VIDEO" && (
                        <video
                          src={item.mediaUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.mediaType === "CAROUSEL_ALBUM" && (
                        <img
                          src={item.thumbnailUrl || "/api/placeholder/150/150"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
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
                                    <Label htmlFor={item.id}>Select</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Trigger</h2>
              <Button
                variant="ghost"
                className="text-green-500 flex items-center"
              >
                2 keywords
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
            </div>

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="send, dm me, hello" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate keywords with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">DM Type</h2>
              <Button
                variant="ghost"
                className="text-green-500 flex items-center"
              >
                Message Template
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
            </div>
          </div>

          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Message</h2>
              <Button
                variant="ghost"
                className="text-gray-600 flex items-center"
              >
                Enter Message
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </Button>
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the message to look for in DMs"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Auto Reply</h2>
              <div className="flex items-center space-x-2">
                <span>Don't send auto reply</span>
                <FormField
                  control={form.control}
                  name="sendAutoReply"
                  render={({ field }) => (
                    <FormItem>
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
            </div>

            {sendAutoReply && (
              <FormField
                control={form.control}
                name="reply"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormControl>
                      <Textarea
                        placeholder="Enter the automatic reply message"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Backtrack</h2>
                <p className="text-sm text-gray-500">
                  Allows you to catch up on previous comments upto 7 days old.
                </p>
              </div>
              <FormField
                control={form.control}
                name="backtrack"
                render={({ field }) => (
                  <FormItem>
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
          </div>
        </form>
      </Form>
    </div>
  );
}
