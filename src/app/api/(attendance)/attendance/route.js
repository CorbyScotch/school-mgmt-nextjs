import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import StudentProfile from "@/models/StudentProfile";
import TeacherProfile from "@/models/TeacherProfile";
import TeachingAssignment from "@/models/TeachingAssignment";
import mongoose from "mongoose";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });
  if (!authorize(currentUser, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );

  await connectDB();
  if (currentUser.role === "teacher") {
    const teacherProfile = await TeacherProfile.findOne({
      user: currentUser.userId,
    });
    if (!teacherProfile)
      return Response.json(
        { error: "No teacher profile found" },
        { status: 404 },
      );
    const teacherAttendance = await Attendance.find({
      teacherId: teacherProfile._id.toString(),
    });
    return Response.json(teacherAttendance);
  }
  const attendance = await Attendance.find()
    .sort({ createdAt: -1 })
    .populate("teacherId")
    .populate("classId")
    .populate("subjectId");

  return Response.json(attendance);
}

export async function POST(request) {
  // authentication
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });

  // authorization
  if (!authorize(currentUser, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );

  const { teacherId, classId, subjectId, date, records } = await request.json();
  // validate date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "Date must be in YYYY-MM-DD format" },
      { status: 400 },
    );
  }

  const attendanceDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(attendanceDate.getTime())) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  let actualTeacherId = teacherId;

  await connectDB();
  if (currentUser.role === "teacher") {
    const currentTeacherProfile = await TeacherProfile.findOne({
      user: currentUser.userId,
    });
    if (!currentTeacherProfile)
      return Response.json(
        { error: "Teacher profile not found" },
        { status: 404 },
      );
    actualTeacherId = currentTeacherProfile._id.toString();
  }

  // input validation
  if (
    !actualTeacherId ||
    !classId ||
    !subjectId ||
    !Array.isArray(records) ||
    records.length === 0 ||
    !mongoose.Types.ObjectId.isValid(actualTeacherId) ||
    !mongoose.Types.ObjectId.isValid(classId) ||
    !mongoose.Types.ObjectId.isValid(subjectId)
  )
    return Response.json(
      { error: "Invalid ID in one or more fields" },
      { status: 400 },
    );

  // check all valid student records
  const allValid = records.every(
    (record) =>
      mongoose.Types.ObjectId.isValid(record.studentId) &&
      ["present", "absent"].includes(record.status),
  );
  if (!allValid)
    return Response.json(
      { error: "Some student IDs invalid" },
      { status: 400 },
    );

  // checking, teacher, class, subject exists
  const assignment = await TeachingAssignment.findOne({
    teacherId: actualTeacherId,
    classId,
    subjectId,
  });
  if (!assignment)
    return Response.json(
      {
        error:
          "This teacher is not assigned to teach this subject to this class",
      },
      { status: 403 },
    );
  // finding student records in StudentProfile collection
  const studentIds = records.map((record) => record.studentId);
  // checking duplicates
  const uniqueStudentIds = new Set(studentIds);
  if (uniqueStudentIds.size !== studentIds.length)
    return Response.json(
      { error: "Duplicate student records are not allowed" },
      { status: 400 },
    );

  const validStudents = await StudentProfile.find({
    _id: { $in: studentIds },
  });

  // checking if all submitted students were found
  if (validStudents.length < studentIds.length)
    return Response.json(
      { error: "Some IDs where not found" },
      { status: 400 },
    );

  // checking students belong to right class
  const validStudentClasses = validStudents.every(
    (student) => student.classId?.toString() === classId,
  );
  if (!validStudentClasses)
    return Response.json(
      { error: "Some students in wrong classes" },
      { status: 400 },
    );

  // check duplicate attendance session
  const existingAttendace = await Attendance.findOne({
    teacherId: actualTeacherId,
    classId,
    subjectId,
    date: attendanceDate,
  });
  if (existingAttendace)
    return Response.json(
      { error: "Attendance already exists" },
      { status: 409 },
    );

  try {
    await Attendance.create({
      teacherId: actualTeacherId,
      classId,
      subjectId,
      date: attendanceDate,
      records,
    });

    return Response.json(
      { message: "Attendance creation success" },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        { error: "Attendance already exists" },
        { status: 409 },
      );
    }

    return Response.json(
      { error: "Failed to create attendance" },
      { status: 500 },
    );
  }
}
