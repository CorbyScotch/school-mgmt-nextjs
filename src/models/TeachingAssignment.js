import mongoose from "mongoose";

const teachingAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherProfile",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },
  { timestamps: true },
);

teachingAssignmentSchema.index(
  { teacherId: 1, subjectId: 1, classId: 1 },
  { unique: true },
);

export default mongoose.models.TeachingAssignment ||
  mongoose.model("TeachingAssignment", teachingAssignmentSchema);
