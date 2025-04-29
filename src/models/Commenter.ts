import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface ICommenter extends Document {
  user: mongoose.Types.ObjectId | IUser;
  commenterIds: string[]; // Array of Instagram commenter IDs
  createdAt: Date;
  updatedAt: Date;
}

const CommenterSchema: Schema<ICommenter> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commenterIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Create a unique index on user to ensure one record per user
CommenterSchema.index({ user: 1 }, { unique: true });

const CommenterModel =
  mongoose.models.Commenter ||
  mongoose.model<ICommenter>("Commenter", CommenterSchema);

export default CommenterModel as mongoose.Model<ICommenter>;
