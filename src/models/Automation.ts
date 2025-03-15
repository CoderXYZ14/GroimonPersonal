import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IAutomation extends Document {
  name: string;
  postIds: string[];
  keywords: string[];
  message: string;
  enableCommentAutomation: boolean;
  commentMessage: string;
  isFollowed: boolean;
  user: mongoose.Types.ObjectId | IUser;
}

const AutomationSchema: Schema<IAutomation> = new Schema(
  {
    name: { type: String, required: true },
    postIds: { type: [String] },
    keywords: { type: [String], required: true },
    message: { type: String, required: true },
    enableCommentAutomation: { type: Boolean, default: false },
    commentMessage: { type: String, default: "" },
    isFollowed: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const AutomationModel =
  mongoose.models.Automation ||
  mongoose.model<IAutomation>("Automation", AutomationSchema);
export default AutomationModel as mongoose.Model<IAutomation>;
