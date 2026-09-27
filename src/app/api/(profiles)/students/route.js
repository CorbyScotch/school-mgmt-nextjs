import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Class from "@/models/Class";
import StudentProfile from "@/models/StudentProfile";
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
  const students = await StudentProfile.find().sort({ createdAt: -1 });

  return Response.json(students);
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

  const { userId, studentId, classId, admissionDate, status } =
    await request.json();

  if (
    !userId ||
    !mongoose.Types.ObjectId.isValid(userId) ||
    !studentId ||
    !classId ||
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    return Response.json(
      { error: "One or more fields missing or invalid" },
      { status: 400 },
    );
  }

  await connectDB();
  const availableUser = await User.findOne({ _id: userId, role: "student" });
  if (!availableUser) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const existingProfile = await StudentProfile.findOne({
    $or: [{ studentId }, { user: userId }],
  });
  if (existingProfile)
    return Response.json(
      { error: "Student profile already exists" },
      { status: 409 },
    );

  if (classId) {
    if (!mongoose.Types.ObjectId.isValid(classId))
      return Response.json({ error: "Invalid class ID" }, { status: 400 });

    const existingClass = await Class.findById(classId);
    if (!existingClass)
      return Response.json({ error: "Class not found" }, { status: 404 });
  }

  try {
    const newStudentProfile = await StudentProfile.create({
      user: userId,
      studentId,
      classId,
      admissionDate,
      status,
    });

    return Response.json(
      { message: "Student Profile creation success", newStudentProfile },
      { status: 201 },
    );
  } catch (err) {
    if (err.code === 11000)
      return Response.json(
        { error: "Student Profile already exists" },
        { status: 409 },
      );
    return Response.json(
      { error: `Could not register Student` },
      { status: 500 },
    );
  }
}
