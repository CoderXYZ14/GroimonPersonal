import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: string;
  instagramId?: string; // Optional Instagram ID
  instagramUsername?: string; // Optional Instagram username
  accessToken?: string; // Optional Instagram access token
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true },
    instagramId: { type: String }, // Optional Instagram ID
    instagramUsername: { type: String }, // Optional Instagram username
    accessToken: { type: String }, // Optional Instagram access token
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default UserModel;
