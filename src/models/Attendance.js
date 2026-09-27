import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherProfile",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentProfile",
          required: true,
        },
        status: {
          type: String,
          enum: ["present", "absent"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

attendanceSchema.index(
  { teacherId: 1, classId: 1, subjectId: 1, date: 1 },
  { unique: true },
);

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
