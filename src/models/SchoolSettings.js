import mongoose from "mongoose";

const schoolSettingsSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    schoolCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    schoolType: {
      type: String,
      enum: ["Basic School", "Primary", "JHS", "Combined"],
      default: "Basic School",
    },
    motto: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    town: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
    currentTerm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
    },
    gradingSystem: {
      type: Object,
      default: {
        A: 80,
        B: 70,
        C: 60,
        D: 50,
        E: 40,
        F: 0,
      },
    },
    feeSettings: {
      type: Object,
      default: {
        defaultTermFee: 0,
        currency: "GHS",
        allowedPaymentModes: ["cash", "mobile-money", "bank-transfer"],
        gracePeriodDays: 7,
        lateFeePercentage: 0,
      },
    },
    schoolLogoUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.SchoolSettings ||
  mongoose.model("SchoolSettings", schoolSettingsSchema);
