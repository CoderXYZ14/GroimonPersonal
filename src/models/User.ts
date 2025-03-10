import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: string;
  instagramId?: string;
  instagramUsername?: string;
  accessToken?: string;
  automations: mongoose.Types.ObjectId[];
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true },
    instagramId: { type: String },
    instagramUsername: { type: String },
    accessToken: { type: String },
    automations: [{ type: Schema.Types.ObjectId, ref: "Automation" }],
  },
  { timestamps: true }
);

// Fix the model registration pattern
const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel as mongoose.Model<IUser>;
