import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import ParentProfile from "@/models/ParentProfile";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(currentUser, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access parent profiles" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json(
      { error: "Invalid parent profile id" },
      { status: 400 },
    );
  }

  await connectDB();
  const parent = await ParentProfile.findById(id).lean();

  if (!parent) {
    return Response.json(
      { error: "Parent profile not found" },
      { status: 404 },
    );
  }

  return Response.json(parent);
}

export async function PATCH(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(currentUser, "admin")) {
    return Response.json(
      { error: "Only an admin can update parent profiles" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json(
      { error: "Invalid parent profile id" },
      { status: 400 },
    );
  }

  const body = await request.json();
  await connectDB();

  const updated = await ParentProfile.findByIdAndUpdate(id, body, {
    new: true,
  });
  if (!updated) {
    return Response.json(
      { error: "Parent profile not found" },
      { status: 404 },
    );
  }

  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(currentUser, "admin")) {
    return Response.json(
      { error: "Only an admin can delete parent profiles" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json(
      { error: "Invalid parent profile id" },
      { status: 400 },
    );
  }

  await connectDB();
  const deleted = await ParentProfile.findByIdAndDelete(id);

  if (!deleted) {
    return Response.json(
      { error: "Parent profile not found" },
      { status: 404 },
    );
  }

  return Response.json({ message: "Parent profile deleted" });
}
