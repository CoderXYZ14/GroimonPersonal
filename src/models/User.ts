import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: string;
  instagramId?: string;
  instagramUsername?: string;
  instagramAccessToken?: string;
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
    instagramAccessToken: { type: String },
    automations: [{ type: Schema.Types.ObjectId, ref: "Automation" }],
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default UserModel as mongoose.Model<IUser>;
