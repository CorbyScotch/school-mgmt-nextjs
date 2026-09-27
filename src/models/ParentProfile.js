import mongoose from "mongoose";

const parentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    relationship: {
      type: String,
      enum: ["father", "mother", "guardian", "other"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    isPrimaryContact: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.ParentProfile ||
  mongoose.model("ParentProfile", parentProfileSchema);
