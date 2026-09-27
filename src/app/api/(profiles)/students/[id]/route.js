import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import StudentProfile from "@/models/StudentProfile";
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
    return Response.json(
      { error: "Invalid student profile id" },
      { status: 400 },
    );
  }

  await connectDB();
  const student = await StudentProfile.findById(id).lean();

  if (!student)
    return Response.json(
      { error: "Student Profile not found" },
      { status: 404 },
    );

  return Response.json(student);
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
    return Response.json(
      { error: "Invalid student profile id" },
      { status: 400 },
    );
  }

  const body = await request.json();

  await connectDB();

  const updatedStudent = await StudentProfile.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedStudent)
    return Response.json(
      { error: "Student Profile not found" },
      { status: 404 },
    );

  return Response.json(updatedStudent);
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
    return Response.json(
      { error: "Invalid student profile id" },
      { status: 400 },
    );
  }

  await connectDB();

  const deletedProfile = await StudentProfile.findByIdAndDelete(id);

  if (!deletedProfile)
    return Response.json(
      { error: "Student profile not found" },
      { status: 404 },
    );

  return Response.json({ message: "Delete success" });
}
