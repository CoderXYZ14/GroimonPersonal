import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IIplRegistration extends Document {
  user: mongoose.Types.ObjectId | IUser;
  registrationTime: Date;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

const IplRegistrationSchema: Schema<IIplRegistration> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    registrationTime: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const IplRegistrationModel =
  mongoose.models.IplRegistration ||
  mongoose.model<IIplRegistration>("IplRegistration", IplRegistrationSchema);

export default IplRegistrationModel as mongoose.Model<IIplRegistration>;
