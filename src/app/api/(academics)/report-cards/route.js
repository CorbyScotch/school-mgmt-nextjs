import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import ReportCard from "@/models/ReportCard";
import StudentProfile from "@/models/StudentProfile";
import AcademicYear from "@/models/AcademicYear";
import Term from "@/models/Term";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import mongoose from "mongoose";

const gradeFromScore = (score) => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher", "parent"])) {
    return Response.json(
      { error: "You are not allowed to access report cards" },
      { status: 403 },
    );
  }

  await connectDB();
  const reportCards = await ReportCard.find().sort({ createdAt: -1 }).lean();
  return Response.json(reportCards);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can generate report cards" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const { student, academicYear, term, classId, subjects, remarks, status } =
    payload;

  if (
    !student ||
    !academicYear ||
    !term ||
    !classId ||
    !Array.isArray(subjects) ||
    subjects.length === 0
  ) {
    return Response.json(
      {
        error:
          "Student, academic year, term, class, and subject scores are required",
      },
      { status: 400 },
    );
  }

  for (const id of [student, academicYear, term, classId]) {
    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return Response.json(
        { error: "One or more ids are invalid" },
        { status: 400 },
      );
    }
  }

  await connectDB();

  const studentRecord = await StudentProfile.findById(student);
  if (!studentRecord)
    return Response.json({ error: "Student not found" }, { status: 404 });

  const year = await AcademicYear.findById(academicYear);
  if (!year)
    return Response.json({ error: "Academic year not found" }, { status: 404 });

  const currentTerm = await Term.findById(term);
  if (!currentTerm)
    return Response.json({ error: "Term not found" }, { status: 404 });

  const classRecord = await Class.findById(classId);
  if (!classRecord)
    return Response.json({ error: "Class not found" }, { status: 404 });

  const normalizedSubjects = [];
  let totalScore = 0;

  for (const item of subjects) {
    if (
      !item.subject ||
      !mongoose.Types.ObjectId.isValid(String(item.subject))
    ) {
      return Response.json(
        {
          error: "Each subject in the report card must have a valid subject id",
        },
        { status: 400 },
      );
    }

    const subjectRecord = await Subject.findById(item.subject);
    if (!subjectRecord) {
      return Response.json(
        { error: `Subject ${String(item.subject)} not found` },
        { status: 404 },
      );
    }

    const score = Number(item.score);
    if (!Number.isFinite(score) || score < 0) {
      return Response.json(
        { error: `Score for ${subjectRecord.name} must be valid` },
        { status: 400 },
      );
    }

    const grade = gradeFromScore(score);
    normalizedSubjects.push({
      subject: item.subject,
      score,
      grade,
      remark: item.remark || "Good effort",
    });

    totalScore += score;
  }

  const averageScore =
    normalizedSubjects.length > 0 ? totalScore / normalizedSubjects.length : 0;

  const reportCard = await ReportCard.create({
    student,
    academicYear,
    term,
    classId,
    subjects: normalizedSubjects,
    totalScore,
    averageScore,
    remarks: remarks || "Keep up the excellent work.",
    status: status || "published",
    generatedBy: user.userId,
  });

  return Response.json(
    { message: "Report card generated", reportCard },
    { status: 201 },
  );
}
