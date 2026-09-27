import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import FeePayment from "@/models/FeePayment";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher", "parent"])) {
    return Response.json(
      { error: "You do not have permission to access this fee record" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid fee id" }, { status: 400 });
  }

  await connectDB();
  const fee = await FeePayment.findById(id).lean();

  if (!fee) {
    return Response.json({ error: "Fee record not found" }, { status: 404 });
  }

  return Response.json(fee);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can update fee records" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid fee id" }, { status: 400 });
  }

  const body = await request.json();
  await connectDB();

  const existing = await FeePayment.findById(id);
  if (!existing) {
    return Response.json({ error: "Fee record not found" }, { status: 404 });
  }

  const amount = body.amount ?? existing.amount;
  const paidAmount = body.paidAmount ?? existing.paidAmount;
  const normalized = FeePayment.normalizeFee({
    amount,
    paidAmount,
    dueDate: body.dueDate ?? existing.dueDate,
  });

  const nextData = {
    ...body,
    amount: normalized.amount,
    paidAmount: normalized.paidAmount,
    balance: normalized.balance,
    status: normalized.status,
    paymentDate:
      body.paidAmount !== undefined || body.amount !== undefined
        ? normalized.paidAmount >= normalized.amount
          ? new Date()
          : existing.paymentDate
        : existing.paymentDate,
  };

  const fee = await FeePayment.findByIdAndUpdate(id, nextData, { new: true });
  if (!fee) {
    return Response.json({ error: "Fee record not found" }, { status: 404 });
  }

  return Response.json(fee);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can delete fee records" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid fee id" }, { status: 400 });
  }

  await connectDB();
  const fee = await FeePayment.findByIdAndDelete(id);

  if (!fee) {
    return Response.json({ error: "Fee record not found" }, { status: 404 });
  }

  return Response.json({ message: "Fee record deleted" });
}
