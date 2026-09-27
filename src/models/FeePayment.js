import mongoose from "mongoose";

const feeStatusFromPayment = (amount, paidAmount, dueDate) => {
  const safeAmount = Number(amount) || 0;
  const safePaid = Math.min(Math.max(Number(paidAmount) || 0, 0), safeAmount);
  const now = new Date();

  if (safePaid >= safeAmount) return "paid";
  if (safePaid > 0)
    return dueDate && new Date(dueDate) < now ? "overdue" : "partial";
  return dueDate && new Date(dueDate) < now ? "overdue" : "pending";
};

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    feeType: {
      type: String,
      enum: ["tuition", "exam", "uniform", "library", "miscellaneous"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "mobile-money", "bank-transfer", "card"],
      default: "cash",
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

feePaymentSchema.statics.normalizeFee = function ({
  amount,
  paidAmount,
  dueDate,
}) {
  const safeAmount = Number(amount) || 0;
  const safePaid = Math.min(Math.max(Number(paidAmount) || 0, 0), safeAmount);
  const safeBalance = Math.max(safeAmount - safePaid, 0);
  const status = feeStatusFromPayment(safeAmount, safePaid, dueDate);

  return {
    amount: Number(safeAmount.toFixed(2)),
    paidAmount: Number(safePaid.toFixed(2)),
    balance: Number(safeBalance.toFixed(2)),
    status,
  };
};

feePaymentSchema.index({ student: 1, dueDate: 1, status: 1 });

export default mongoose.models.FeePayment ||
  mongoose.model("FeePayment", feePaymentSchema);
