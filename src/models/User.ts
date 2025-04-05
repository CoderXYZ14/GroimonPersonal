import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  instagramId?: string;
  instagramUsername?: string;
  instagramAccessToken?: string;
  instaProfilePic?: string;
  automations: mongoose.Types.ObjectId[];
  lastAuthCode?: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    instagramId: { type: String },
    instagramUsername: { type: String },
    instagramAccessToken: { type: String },
    instaProfilePic: { type: String },
    automations: [{ type: Schema.Types.ObjectId, ref: "Automation" }],
    lastAuthCode: { type: String },
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default UserModel as mongoose.Model<IUser>;
