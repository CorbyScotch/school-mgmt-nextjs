import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Term from "@/models/Term";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or teacher can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid term id" }, { status: 400 });
  }

  await connectDB();
  const term = await Term.findById(id).lean();

  if (!term) return Response.json({ error: "Term not found" }, { status: 404 });

  return Response.json(term);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid term id" }, { status: 400 });
  }

  const body = await request.json();

  await connectDB();

  const updatedTerm = await Term.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedTerm)
    return Response.json({ error: "Term not found" }, { status: 404 });

  return Response.json(updatedTerm);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid term id" }, { status: 400 });
  }

  await connectDB();

  const deletedTerm = await Term.findByIdAndDelete(id);
  if (!deletedTerm)
    return Response.json({ error: "Term not found" }, { status: 404 });

  return Response.json({ message: "Delete success" });
}
