import mongoose from "mongoose";

const reportCardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
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
    subjects: [
      {
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
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    position: {
      type: Number,
      default: 0,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

reportCardSchema.index(
  { student: 1, academicYear: 1, term: 1 },
  { unique: true },
);

export default mongoose.models.ReportCard ||
  mongoose.model("ReportCard", reportCardSchema);
