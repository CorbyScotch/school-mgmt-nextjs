import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import StudentProfile from "@/models/StudentProfile";
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

  await connectDB();
  const attendance = await Attendance.findById(id);

  if (!attendance)
    return Response.json({ error: "Attendance not found" }, { status: 404 });

  // checking if a teacher can access attendance
  if (currentUser.role === "teacher") {
    const teacherProfile = await TeacherProfile.findOne({
      user: currentUser.userId,
    });

    if (!teacherProfile)
      return Response.json(
        { error: "Teacher Profile not found" },
        { status: 404 },
      );

    if (attendance.teacherId.toString() !== teacherProfile._id.toString())
      return Response.json(
        { error: "You are not authorized to access this attendance " },
        { status: 403 },
      );
  }

  return Response.json(attendance);
}

export async function PATCH(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });
  if (!authorize(currentUser, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );

  const { id } = await params;

  await connectDB();
  const attendance = await Attendance.findById(id);
  if (!attendance)
    return Response.json({ error: "Attendance not found" }, { status: 404 });
  if (currentUser.role === "teacher") {
    const teacherProfile = await TeacherProfile.findOne({
      user: currentUser.userId,
    });

    if (!teacherProfile)
      return Response.json(
        { error: "Teacher profile not found" },
        { status: 404 },
      );

    if (attendance.teacherId.toString() !== teacherProfile._id.toString())
      return Response.json(
        { error: "You are not authorized to modify this attendance" },
        { status: 403 },
      );
  }

  const { records, date } = await request.json();
  if (date === undefined && records === undefined)
    return Response.json(
      { error: "At least one field must be provided for update" },
      { status: 400 },
    );
  // validate fields
  const updateData = {};
  if (date !== undefined) {
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

    updateData.date = attendanceDate;
  }

  if (records !== undefined) {
    // check if array
    if (!Array.isArray(records) || records.length === 0) {
      return Response.json(
        { error: "Records must be a non-empty array" },
        { status: 400 },
      );
    }

    // checking all records pass
    const allValid = records.every(
      (record) =>
        ["present", "absent"].includes(record.status) &&
        mongoose.Types.ObjectId.isValid(record.studentId),
    );

    if (!allValid) {
      return Response.json(
        { error: "Some attendance records are invalid" },
        { status: 400 },
      );
    }

    // duplicate check
    const studentIds = records.map((record) => record.studentId);
    const uniqueStudentIds = new Set(studentIds);

    if (uniqueStudentIds.size !== studentIds.length) {
      return Response.json(
        { error: "Duplicate student IDs are not allowed" },
        { status: 400 },
      );
    }
    // find students
    const validStudents = await StudentProfile.find({
      _id: { $in: studentIds },
    });

    if (validStudents.length !== studentIds.length) {
      return Response.json(
        { error: "Some student IDs were not found" },
        { status: 400 },
      );
    }

    const validateStudentClass = validStudents.every(
      (student) =>
        student.classId?.toString() === attendance.classId.toString(),
    );

    if (!validateStudentClass)
      return Response.json(
        { error: "Some students do not belong to this class" },
        { status: 400 },
      );
  }

  try {
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    );

    if (!updatedAttendance)
      return Response.json({ error: "Attendance not found" }, { status: 404 });

    return Response.json(updatedAttendance);
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        { error: "Attendance already exists for this date" },
        { status: 409 },
      );
    }

    return Response.json(
      { error: "Failed to update attendance" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });
  if (!authorize(currentUser, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;

  await connectDB();
  const deletedAttendance = await Attendance.findByIdAndDelete(id);

  if (!deletedAttendance)
    return Response.json({ error: "Attendance not found" }, { status: 404 });

  return Response.json({ message: "Attendance deletion success" });
}
