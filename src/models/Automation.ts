import mongoose, { Schema, Document } from "mongoose";

export interface IAutomation extends Document {
  name: string;
  postIds: string[];
  keywords: string[];
  message: string;
  user: mongoose.Types.ObjectId;
}

const AutomationSchema: Schema<IAutomation> = new Schema(
  {
    name: { type: String, required: true },
    postIds: { type: [String] },
    keywords: { type: [String], required: true },
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const AutomationModel =
  (mongoose.models.Automation as mongoose.Model<IAutomation>) ||
  mongoose.model<IAutomation>("Automation", AutomationSchema);

export default AutomationModel;
