import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  instagramId?: string;
  instagramUsername?: string;
  instagramAccessToken?: string;
  instaProfilePic?: string;
  automations: mongoose.Types.ObjectId[];
  stories: mongoose.Types.ObjectId[];
  lastAuthCode?: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    instagramId: { type: String },
    instagramUsername: { type: String },
    instagramAccessToken: { type: String },
    instaProfilePic: { type: String },
    automations: [{ type: Schema.Types.ObjectId, ref: "Automation" }],
    stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
    lastAuthCode: { type: String },
  },
  { timestamps: true }
);

// Make sure to check if the model exists before creating a new one
let UserModel: mongoose.Model<IUser>;

try {
  // Try to get the existing model first
  UserModel = mongoose.model<IUser>("User");
} catch (err) {
  // If the model doesn't exist yet, create it
  UserModel = mongoose.model<IUser>("User", UserSchema);
  console.error("Error creating User model:", err);
}

export default UserModel;
