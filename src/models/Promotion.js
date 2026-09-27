import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    previousClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    nextClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
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
    status: {
      type: String,
      enum: ["promoted", "retained", "transferred"],
      default: "promoted",
    },
    remark: {
      type: String,
      trim: true,
    },
    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

promotionSchema.index(
  { student: 1, academicYear: 1, term: 1 },
  { unique: true },
);

export default mongoose.models.Promotion ||
  mongoose.model("Promotion", promotionSchema);
