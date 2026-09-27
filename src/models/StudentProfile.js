import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParentProfile",
      },
    ],
    admissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);
