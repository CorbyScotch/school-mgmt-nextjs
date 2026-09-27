import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Exam from "@/models/Exam";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access exam details" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid exam id" }, { status: 400 });
  }

  await connectDB();
  const exam = await Exam.findById(id).lean();

  if (!exam) {
    return Response.json({ error: "Exam not found" }, { status: 404 });
  }

  return Response.json(exam);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can update exams" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid exam id" }, { status: 400 });
  }

  const body = await request.json();
  await connectDB();

  const exam = await Exam.findByIdAndUpdate(id, body, { new: true });
  if (!exam) {
    return Response.json({ error: "Exam not found" }, { status: 404 });
  }

  return Response.json(exam);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can delete exams" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid exam id" }, { status: 400 });
  }

  await connectDB();
  const exam = await Exam.findByIdAndDelete(id);

  if (!exam) {
    return Response.json({ error: "Exam not found" }, { status: 404 });
  }

  return Response.json({ message: "Exam deleted" });
}
