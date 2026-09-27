import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import TeacherProfile from "@/models/TeacherProfile";
import TeachingAssignment from "@/models/TeachingAssignment";
import mongoose from "mongoose";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
  if (!authorize(currentUser, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );
  }

  await connectDB();
  const teachersAssignments = await TeachingAssignment.find()
    .sort({
      createdAt: -1,
    })
    .populate("teacherId")
    .populate("classId")
    .populate("subjectId");

  return Response.json(teachersAssignments);
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

  const { teacherId, classId, subjectId } = await request.json();

  if (
    !teacherId ||
    !mongoose.Types.ObjectId.isValid(teacherId) ||
    !classId ||
    !mongoose.Types.ObjectId.isValid(classId) ||
    !subjectId ||
    !mongoose.Types.ObjectId.isValid(subjectId)
  ) {
    return Response.json(
      { error: "Invalid ID in one or more fields" },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const existingTeacher = await TeacherProfile.findById(teacherId);
    if (!existingTeacher)
      return Response.json({ error: "Teacher not found" }, { status: 404 });
    const existingClass = await Class.findById(classId);
    if (!existingClass)
      return Response.json({ error: "Class not found" }, { status: 404 });
    const existingSubject = await Subject.findById(subjectId);
    if (!existingSubject)
      return Response.json({ error: "Subject not found" }, { status: 404 });

    const existingAssignment = await TeachingAssignment.findOne({
      $or: [
        { teacherId, classId, subjectId },
        { classId, subjectId },
      ],
    });

    if (existingAssignment)
      return Response.json(
        { error: "Teacher assignment already exists" },
        { status: 409 },
      );

    const assignment = await TeachingAssignment.create({
      teacherId,
      classId,
      subjectId,
    });

    return Response.json(
      { message: "Teacher assignment creation success", assignment },
      { status: 201 },
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
