import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Result from "@/models/Result";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher", "parent"])) {
    return Response.json(
      { error: "You do not have permission to access this result" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid result id" }, { status: 400 });
  }

  await connectDB();
  const result = await Result.findById(id).lean();

  if (!result) {
    return Response.json({ error: "Result not found" }, { status: 404 });
  }

  return Response.json(result);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only admins and teachers can update results" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid result id" }, { status: 400 });
  }

  const body = await request.json();
  await connectDB();

  const updated = await Result.findByIdAndUpdate(id, body, { new: true });
  if (!updated) {
    return Response.json({ error: "Result not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can delete results" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid result id" }, { status: 400 });
  }

  await connectDB();
  const result = await Result.findByIdAndDelete(id);

  if (!result) {
    return Response.json({ error: "Result not found" }, { status: 404 });
  }

  return Response.json({ message: "Result deleted" });
}
