import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface Button {
  title: string;
  url: string;
  buttonText: string;
}

export interface IStory extends Document {
  name: string;
  postIds: string[];
  keywords: string[];
  messageType: "message" | "ButtonText" | "ButtonImage";
  message: string;
  imageUrl?: string;
  buttons?: Button[];
  isFollowed: boolean;
  removeBranding: boolean;
  hitCount: number;
  user: mongoose.Types.ObjectId | IUser;
}

const ButtonSchema = new Schema<Button>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    buttonText: { type: String, required: true },
  },
  { _id: false }
);

const StorySchema: Schema<IStory> = new Schema(
  {
    name: { type: String, required: true },
    postIds: { type: [String] },
    keywords: { type: [String], required: true },
    messageType: {
      type: String,
      enum: ["message", "ButtonText", "ButtonImage"],
      default: "message",
      required: true,
    },
    message: { type: String, required: true },
    imageUrl: { type: String },
    buttons: { type: [ButtonSchema], default: [] },
    isFollowed: { type: Boolean, default: false },
    removeBranding: { type: Boolean, default: false },
    hitCount: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const StoryModel =
  mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
export default StoryModel as mongoose.Model<IStory>;
