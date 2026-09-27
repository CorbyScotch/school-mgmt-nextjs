import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import Class from "@/models/Class";
import AcademicYear from "@/models/AcademicYear";
import Term from "@/models/Term";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access exams" },
      { status: 403 },
    );
  }

  await connectDB();
  const exams = await Exam.find().sort({ examDate: -1 }).lean();
  return Response.json(exams);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can create exam schedules" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const {
    name,
    academicYear,
    term,
    classId,
    subjectId,
    examType,
    examDate,
    totalMarks,
    status,
  } = payload;

  if (
    !name ||
    !academicYear ||
    !term ||
    !classId ||
    !subjectId ||
    !examType ||
    !examDate
  ) {
    return Response.json(
      { error: "Exam details are incomplete" },
      { status: 400 },
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(String(academicYear)) ||
    !mongoose.Types.ObjectId.isValid(String(term)) ||
    !mongoose.Types.ObjectId.isValid(String(classId)) ||
    !mongoose.Types.ObjectId.isValid(String(subjectId))
  ) {
    return Response.json({ error: "Invalid ids provided" }, { status: 400 });
  }

  await connectDB();

  const year = await AcademicYear.findById(academicYear);
  if (!year)
    return Response.json({ error: "Academic year not found" }, { status: 404 });

  const activeTerm = await Term.findById(term);
  if (!activeTerm)
    return Response.json({ error: "Term not found" }, { status: 404 });

  const classRecord = await Class.findById(classId);
  if (!classRecord)
    return Response.json({ error: "Class not found" }, { status: 404 });

  const subjectRecord = await Subject.findById(subjectId);
  if (!subjectRecord)
    return Response.json({ error: "Subject not found" }, { status: 404 });

  const examDateValue = new Date(examDate);
  if (Number.isNaN(examDateValue.getTime())) {
    return Response.json({ error: "Invalid exam date" }, { status: 400 });
  }

  const exam = await Exam.create({
    name: String(name).trim(),
    academicYear,
    term,
    classId,
    subjectId,
    examType,
    examDate: examDateValue,
    totalMarks: totalMarks ?? 100,
    status: status ?? "draft",
  });

  return Response.json({ message: "Exam created", exam }, { status: 201 });
}
