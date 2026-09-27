import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
      required: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pass", "fail"],
      default: "pass",
    },
  },
  { timestamps: true },
);

resultSchema.index({ student: 1, exam: 1, subject: 1 }, { unique: true });

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
