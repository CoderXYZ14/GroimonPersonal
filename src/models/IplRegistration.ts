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
      default: "pending" 
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Make sure to check if the model exists before creating a new one
let IplRegistrationModel: mongoose.Model<IIplRegistration>;

try {
  // Try to get the existing model first
  IplRegistrationModel = mongoose.model<IIplRegistration>("IplRegistration");
} catch (error) {
  // If the model doesn't exist yet, create it
  IplRegistrationModel = mongoose.model<IIplRegistration>("IplRegistration", IplRegistrationSchema);
}

export default IplRegistrationModel;
