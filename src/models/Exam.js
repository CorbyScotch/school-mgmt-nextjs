import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    examType: {
      type: String,
      enum: ["class-work", "mid-term", "end-term", "mock"],
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

examSchema.index(
  { academicYear: 1, term: 1, classId: 1, subjectId: 1, name: 1 },
  { unique: true },
);

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);
