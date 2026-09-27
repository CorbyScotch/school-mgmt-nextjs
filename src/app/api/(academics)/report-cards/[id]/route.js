import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import ReportCard from "@/models/ReportCard";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher", "parent"])) {
    return Response.json(
      { error: "You are not permitted to view this report card" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid report card id" }, { status: 400 });
  }

  await connectDB();
  const reportCard = await ReportCard.findById(id).lean();

  if (!reportCard) {
    return Response.json({ error: "Report card not found" }, { status: 404 });
  }

  return Response.json(reportCard);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only admin or teacher can update report cards" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid report card id" }, { status: 400 });
  }

  const body = await request.json();
  await connectDB();

  const reportCard = await ReportCard.findByIdAndUpdate(id, body, {
    new: true,
  });
  if (!reportCard) {
    return Response.json({ error: "Report card not found" }, { status: 404 });
  }

  return Response.json(reportCard);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can delete report cards" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid report card id" }, { status: 400 });
  }

  await connectDB();
  const reportCard = await ReportCard.findByIdAndDelete(id);

  if (!reportCard) {
    return Response.json({ error: "Report card not found" }, { status: 404 });
  }

  return Response.json({ message: "Report card deleted" });
}
