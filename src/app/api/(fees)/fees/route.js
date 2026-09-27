import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import FeePayment from "@/models/FeePayment";
import StudentProfile from "@/models/StudentProfile";
import mongoose from "mongoose";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher", "parent"])) {
    return Response.json(
      { error: "You do not have permission to access fees" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const student = searchParams.get("student");
  const status = searchParams.get("status");

  await connectDB();

  const query = {};
  if (student && mongoose.Types.ObjectId.isValid(student))
    query.student = student;
  if (status) query.status = status;

  const fees = await FeePayment.find(query).sort({ dueDate: 1 }).lean();
  return Response.json(fees);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can create fee entries" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const {
    student,
    feeType,
    amount,
    paidAmount = 0,
    dueDate,
    paymentMode,
    reference,
    notes,
  } = payload;

  if (!student || !feeType || !amount || !dueDate) {
    return Response.json(
      { error: "Student, fee type, amount, and due date are required" },
      { status: 400 },
    );
  }

  if (!mongoose.Types.ObjectId.isValid(String(student))) {
    return Response.json({ error: "Invalid student id" }, { status: 400 });
  }

  await connectDB();

  const validStudent = await StudentProfile.findById(student);
  if (!validStudent) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return Response.json({ error: "Invalid due date" }, { status: 400 });
  }

  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber < 0) {
    return Response.json(
      { error: "Fee amount must be a valid positive number" },
      { status: 400 },
    );
  }

  const paymentNumber = Number(paidAmount);
  if (!Number.isFinite(paymentNumber) || paymentNumber < 0) {
    return Response.json(
      { error: "Paid amount must be a valid non-negative number" },
      { status: 400 },
    );
  }

  const normalized = FeePayment.normalizeFee({
    amount: amountNumber,
    paidAmount: paymentNumber,
    dueDate: due,
  });

  const fee = await FeePayment.create({
    student,
    studentName: validStudent.studentId,
    feeType,
    amount: normalized.amount,
    paidAmount: normalized.paidAmount,
    balance: normalized.balance,
    status: normalized.status,
    dueDate: due,
    paymentDate: normalized.paidAmount > 0 ? new Date() : null,
    paymentMode: paymentMode || "cash",
    reference,
    notes,
  });

  return Response.json({ message: "Fee entry created", fee }, { status: 201 });
}
