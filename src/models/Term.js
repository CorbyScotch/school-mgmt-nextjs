import mongoose from "mongoose";

const termSchema = new mongoose.Schema({
  acadYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  term: {
    type: String,
    required: true,
    enum: ["Term 1", "Term 2", "Term 3"],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
});

export default mongoose.models.Term || mongoose.model("Term", termSchema);
