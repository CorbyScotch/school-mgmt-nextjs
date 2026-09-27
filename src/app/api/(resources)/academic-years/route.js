import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import AcademicYear from "@/models/AcademicYear";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or teacher can perform this action" },
      { status: 403 },
    );

  await connectDB();
  const acadYears = await AcademicYear.find().sort({ startYear: 1 }).lean();

  return Response.json(acadYears);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { startYear, endYear, status } = await request.json();

  if (!startYear || !endYear)
    return Response.json(
      { error: "Start year and end year are required" },
      { status: 400 },
    );

  if (Number(startYear) >= Number(endYear))
    return Response.json(
      { error: "End year must be greater than start year" },
      { status: 400 },
    );

  await connectDB();

  try {
    const newAcadYear = await AcademicYear.create({
      startYear: Number(startYear),
      endYear: Number(endYear),
      status,
    });

    return Response.json(
      { message: "Academic year created ", newAcadYear },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        { error: "Academic year already exists" },
        { status: 409 },
      );
    }

    return Response.json(
      { error: "Could not create academic year" },
      { status: 500 },
    );
  }
}
