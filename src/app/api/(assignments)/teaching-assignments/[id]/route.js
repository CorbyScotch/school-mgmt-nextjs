import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import TeachingAssignment from "@/models/TeachingAssignment";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });
  if (!authorize(currentUser, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid assignment id" }, { status: 400 });
  }

  await connectDB();
  const teacherAssignment = await TeachingAssignment.findById(id)
    .populate("teacherId")
    .lean();

  if (!teacherAssignment)
    return Response.json({ error: "No assignment found" }, { status: 404 });

  return Response.json(teacherAssignment);
}

export async function PATCH(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });
  if (!authorize(currentUser, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid assignment id" }, { status: 400 });
  }

  const body = await request.json();

  await connectDB();
  const updatedAssignment = await TeachingAssignment.findByIdAndUpdate(
    id,
    body,
    { new: true },
  );

  if (!updatedAssignment)
    return Response.json({ error: "No assignment found" }, { status: 404 });

  return Response.json(updatedAssignment);
}

export async function DELETE(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });
  if (!authorize(currentUser, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid assignment id" }, { status: 400 });
  }

  await connectDB();
  const deletedAssginment = await TeachingAssignment.findByIdAndDelete(id);

  if (!deletedAssginment)
    return Response.json({ error: "No assignment found" }, { status: 404 });

  return Response.json({ message: "Assignment deletion success" });
}
