import { connectDB } from "@/lib/mongodb";
import {
  buildAcademicYearRange,
  buildTermDates,
  defaultClassLevels,
  defaultSubjectCatalog,
} from "@/lib/schoolDefaults";
import AcademicYear from "@/models/AcademicYear";
import Class from "@/models/Class";
import SchoolSettings from "@/models/SchoolSettings";
import Subject from "@/models/Subject";
import Term from "@/models/Term";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";
import authorize from "@/lib/authorize";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can initialize the school setup" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const { schoolName, region, district, schoolType = "Basic School" } = payload;

  if (!schoolName || !region) {
    return Response.json(
      { error: "School name and region are required" },
      { status: 400 },
    );
  }

  await connectDB();

  const existingSettings = await SchoolSettings.findOne();
  if (existingSettings) {
    return Response.json(
      { error: "School setup has already been configured" },
      { status: 409 },
    );
  }

  const yearRange = buildAcademicYearRange();
  const academicYear = await AcademicYear.create({
    startYear: yearRange.startYear,
    endYear: yearRange.endYear,
    status: "active",
  });

  const createdSubjects = [];
  for (const subject of defaultSubjectCatalog) {
    try {
      const created = await Subject.create(subject);
      createdSubjects.push(created);
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  const classroomRecords = [];
  for (const levelConfig of defaultClassLevels) {
    for (const section of levelConfig.sections) {
      const className = `${levelConfig.level} ${section}`;
      const record = await Class.findOneAndUpdate(
        { stage: levelConfig.stage, level: levelConfig.level, section },
        {
          $setOnInsert: {
            stage: levelConfig.stage,
            level: levelConfig.level,
            section,
            name: className,
            capacity: 40,
          },
        },
        { upsert: true, new: true },
      );
      classroomRecords.push(record);
    }
  }

  const terms = [];
  for (let index = 1; index <= 3; index += 1) {
    const dates = buildTermDates(
      new Date(`${yearRange.startYear}-09-01T00:00:00.000Z`),
      index,
    );
    const term = await Term.create({
      acadYear: academicYear._id,
      term: `Term ${index}`,
      startDate: dates.startDate,
      endDate: dates.endDate,
      status: index === 1 ? "active" : "inactive",
    });
    terms.push(term);
  }

  const settings = await SchoolSettings.create({
    schoolName,
    schoolType,
    region,
    district: district || "",
    academicYear: academicYear._id,
    currentTerm: terms[0]._id,
    feeSettings: {
      defaultTermFee: 0,
      currency: "GHS",
      allowedPaymentModes: ["cash", "mobile-money", "bank-transfer"],
      gracePeriodDays: 7,
      lateFeePercentage: 0,
    },
  });

  const adminCount = await User.countDocuments({ role: "admin" });

  return Response.json(
    {
      message: "School bootstrap complete",
      settings,
      academicYear,
      terms,
      classrooms: classroomRecords,
      subjects: createdSubjects,
      adminCount,
    },
    { status: 201 },
  );
}
