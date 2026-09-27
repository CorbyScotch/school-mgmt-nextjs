import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Promotion from "@/models/Promotion";
import StudentProfile from "@/models/StudentProfile";
import AcademicYear from "@/models/AcademicYear";
import Term from "@/models/Term";
import Class from "@/models/Class";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access promotions" },
      { status: 403 },
    );
  }

  await connectDB();
  const promotions = await Promotion.find().sort({ createdAt: -1 }).lean();
  return Response.json(promotions);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can record promotions" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const {
    student,
    previousClassId,
    nextClassId,
    academicYear,
    term,
    status,
    remark,
  } = payload;

  if (!student || !previousClassId || !nextClassId || !academicYear || !term) {
    return Response.json(
      { error: "Student, class, academic year, and term are required" },
      { status: 400 },
    );
  }

  const ids = [student, previousClassId, nextClassId, academicYear, term];
  for (const id of ids) {
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

  const previousClass = await Class.findById(previousClassId);
  if (!previousClass)
    return Response.json(
      { error: "Previous class not found" },
      { status: 404 },
    );

  const nextClass = await Class.findById(nextClassId);
  if (!nextClass)
    return Response.json({ error: "Next class not found" }, { status: 404 });

  const year = await AcademicYear.findById(academicYear);
  if (!year)
    return Response.json({ error: "Academic year not found" }, { status: 404 });

  const currentTerm = await Term.findById(term);
  if (!currentTerm)
    return Response.json({ error: "Term not found" }, { status: 404 });

  const promotion = await Promotion.create({
    student,
    previousClassId,
    nextClassId,
    academicYear,
    term,
    status: status || "promoted",
    remark,
    promotedBy: user.userId,
  });

  if (status === "promoted" || status === undefined) {
    await StudentProfile.findByIdAndUpdate(student, { classId: nextClassId });
  }

  return Response.json(
    { message: "Promotion recorded", promotion },
    { status: 201 },
  );
}
