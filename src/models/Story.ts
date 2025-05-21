import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface Button {
  url: string;
  buttonText: string;
}

export interface IStory extends Document {
  name: string;
  postIds: string[];
  keywords: string[];
  messageType: "message" | "ButtonText" | "ButtonImage";
  message?: string;
  imageUrl?: string;
  buttonTitle?: string;
  buttons?: Button[];
  isFollowed: boolean;
  notFollowerMessage?: string;
  followButtonTitle?: string;
  followUpMessage?: string;
  followUpButtonTitle?: string;
  removeBranding: boolean;
  hitCount: number;
  redirectCount: number;
  isActive?: boolean;
  respondToAll?: boolean;
  user: mongoose.Types.ObjectId | IUser;
}

const ButtonSchema = new Schema<Button>(
  {
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
    message: {
      type: String,
      required: function () {
        return this.messageType === "message";
      },
    },
    imageUrl: { type: String },
    buttonTitle: { type: String },
    buttons: { type: [ButtonSchema], default: [] },
    isFollowed: { type: Boolean, default: false },
    notFollowerMessage: { type: String },
    followButtonTitle: { type: String },
    followUpMessage: { type: String },
    followUpButtonTitle: { type: String },
    removeBranding: { type: Boolean, default: false },
    hitCount: { type: Number, default: 0 },
    redirectCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    respondToAll: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const StoryModel =
  mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
export default StoryModel as mongoose.Model<IStory>;
