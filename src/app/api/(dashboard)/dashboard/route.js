import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import TeacherProfile from "@/models/TeacherProfile";
import Attendance from "@/models/Attendance";
import FeePayment from "@/models/FeePayment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can view dashboard metrics" },
      { status: 403 },
    );
  }

  await connectDB();

  const [
    totalStudents,
    totalTeachers,
    totalUsers,
    totalFees,
    attendanceSummary,
  ] = await Promise.all([
    StudentProfile.countDocuments({ status: "active" }),
    TeacherProfile.countDocuments({ status: "active" }),
    User.countDocuments(),
    FeePayment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          paid: { $sum: "$paidAmount" },
          balance: { $sum: "$balance" },
        },
      },
    ]),
    Attendance.aggregate([
      {
        $unwind: "$records",
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$records.status", "present"] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  const feeStats = totalFees[0] || { total: 0, paid: 0, balance: 0 };
  const attendanceStats = attendanceSummary[0] || {
    totalRecords: 0,
    present: 0,
  };

  return Response.json({
    totals: {
      students: totalStudents,
      teachers: totalTeachers,
      users: totalUsers,
      feesTotal: feeStats.total,
      feesPaid: feeStats.paid,
      feesBalance: feeStats.balance,
    },
    attendance: {
      totalRecords: attendanceStats.totalRecords,
      present: attendanceStats.present,
      attendanceRate:
        attendanceStats.totalRecords > 0
          ? (
              (attendanceStats.present / attendanceStats.totalRecords) *
              100
            ).toFixed(2)
          : 0,
    },
  });
}
