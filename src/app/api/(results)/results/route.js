import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import StudentProfile from "@/models/StudentProfile";
import Subject from "@/models/Subject";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher", "parent"])) {
    return Response.json(
      { error: "You do not have permission to access academic results" },
      { status: 403 },
    );
  }

  await connectDB();
  const results = await Result.find().sort({ createdAt: -1 }).lean();
  return Response.json(results);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can enter results" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const { student, exam, subject, score, grade, remark, status } = payload;

  if (!student || !exam || !subject || score === undefined || !grade) {
    return Response.json(
      { error: "Student, exam, subject, score, and grade are required" },
      { status: 400 },
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(String(student)) ||
    !mongoose.Types.ObjectId.isValid(String(exam)) ||
    !mongoose.Types.ObjectId.isValid(String(subject))
  ) {
    return Response.json({ error: "Invalid ids provided" }, { status: 400 });
  }

  await connectDB();

  const studentProfile = await StudentProfile.findById(student);
  if (!studentProfile)
    return Response.json({ error: "Student not found" }, { status: 404 });

  const examProfile = await Exam.findById(exam);
  if (!examProfile)
    return Response.json({ error: "Exam not found" }, { status: 404 });

  const subjectProfile = await Subject.findById(subject);
  if (!subjectProfile)
    return Response.json({ error: "Subject not found" }, { status: 404 });

  const scoreNumber = Number(score);
  if (!Number.isFinite(scoreNumber) || scoreNumber < 0) {
    return Response.json(
      { error: "Score must be a valid number" },
      { status: 400 },
    );
  }

  const result = await Result.create({
    student,
    exam,
    subject,
    score: scoreNumber,
    grade: String(grade).toUpperCase(),
    remark,
    status: status ?? (scoreNumber >= 50 ? "pass" : "fail"),
  });

  return Response.json({ message: "Result saved", result }, { status: 201 });
}
