import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true },
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default UserModel;
//hello world
