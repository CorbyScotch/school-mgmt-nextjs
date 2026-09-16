import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema({
  startYear: {
    type: Number,
    required: true,
  },
  endYear: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

// apply uniqueness
academicYearSchema.index({ startYear: 1, endYear: 1 }, { unique: true });

export default mongoose.models.AcademicYear ||
  mongoose.model("AcademicYear", academicYearSchema);
