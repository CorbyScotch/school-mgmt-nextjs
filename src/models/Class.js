import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: ["Primary", "JHS"],
      required: true,
      default: "Primary",
    },
    level: {
      type: String,
      enum: [
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "Primary 5",
        "Primary 6",
        "JHS 1",
        "JHS 2",
        "JHS 3",
      ],
      required: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 40,
      min: 1,
    },
  },
  { timestamps: true },
);

classSchema.index({ stage: 1, level: 1, section: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model("Class", classSchema);
