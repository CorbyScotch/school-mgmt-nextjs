import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import TeacherProfile from "@/models/TeacherProfile";
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
      { error: "Invalid teacher profile id" },
      { status: 400 },
    );
  }

  await connectDB();
  const teacher = await TeacherProfile.findById(id).lean();

  if (!teacher)
    return Response.json(
      { error: "Teacher Profile not found" },
      { status: 404 },
    );

  return Response.json(teacher);
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
      { error: "Invalid teacher profile id" },
      { status: 400 },
    );
  }

  const body = await request.json();

  await connectDB();

  const updatedTeacher = await TeacherProfile.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedTeacher)
    return Response.json(
      { error: "Teacher Profile not found" },
      { status: 404 },
    );

  return Response.json(updatedTeacher);
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
      { error: "Invalid teacher profile id" },
      { status: 400 },
    );
  }

  await connectDB();

  const deletedProfile = await TeacherProfile.findByIdAndDelete(id);

  if (!deletedProfile)
    return Response.json(
      { error: "Teacher profile not found" },
      { status: 404 },
    );

  return Response.json({ message: "Delete success" });
}
