import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import TeacherProfile from "@/models/TeacherProfile";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );
  await connectDB();
  const teachers = await TeacherProfile.find().sort({ createdAt: -1 });

  return Response.json(teachers);
}

export async function POST(request) {
  const currentUser = await getCurrentUser();

  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(currentUser, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { user, teacherId, hireDate, status } = await request.json();

  if (!user || !mongoose.Types.ObjectId.isValid(user) || !teacherId) {
    return Response.json(
      { error: "One or more fields missing or invalid" },
      { status: 400 },
    );
  }

  await connectDB();
  try {
    const availableUser = await User.findOne({ _id: user, role: "teacher" });
    if (!availableUser) {
      return Response.json({ error: "Teacher not found" }, { status: 404 });
    }

    const existingProfile = await TeacherProfile.findOne({
      $or: [{ teacherId }, { user }],
    });
    if (existingProfile)
      return Response.json(
        { error: "Teacher profile exists" },
        { status: 400 },
      );

    const newTeacherProfile = await TeacherProfile.create({
      user,
      teacherId,
      hireDate,
      status,
    });

    return Response.json(
      { message: "Teacher Profile creation success", newTeacherProfile },
      { status: 201 },
    );
  } catch (err) {
    return Response.json(
      { error: `Something happened: ${err.message}` },
      { status: 500 },
    );
  }
}
