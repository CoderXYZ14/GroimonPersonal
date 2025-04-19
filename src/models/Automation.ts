import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface Button {
  title: string;
  url: string;
  buttonText: string;
}

export interface IAutomation extends Document {
  name: string;
  postIds: string[];
  keywords: string[];
  messageType: "message" | "ButtonText" | "ButtonImage";
  message: string;
  imageUrl?: string;
  buttons?: Button[];
  enableCommentAutomation: boolean;
  commentMessage?: string;
  enableBacktrack: boolean;
  isFollowed: boolean;
  removeBranding: boolean;
  hitCount: number;
  autoReplyLimit: number;
  autoReplyLimitLeft: number;
  notFollowerMessage?: string;
  followButtonTitle?: string;
  followUpMessage?: string;
  isActive?: boolean;
  respondToAll?: boolean;
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

const AutomationSchema: Schema<IAutomation> = new Schema(
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
    enableCommentAutomation: { type: Boolean, default: false },
    commentMessage: { type: String, default: "" },
    enableBacktrack: { type: Boolean, default: false },
    isFollowed: { type: Boolean, default: false },
    removeBranding: { type: Boolean, default: false },
    hitCount: { type: Number, default: 0 },
    autoReplyLimit: { type: Number, default: 100 },
    autoReplyLimitLeft: { type: Number, default: 100 },
    notFollowerMessage: { type: String },
    followButtonTitle: { type: String },
    followUpMessage: { type: String },
    isActive: { type: Boolean, default: true },
    respondToAll: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const AutomationModel =
  mongoose.models.Automation ||
  mongoose.model<IAutomation>("Automation", AutomationSchema);
export default AutomationModel as mongoose.Model<IAutomation>;
