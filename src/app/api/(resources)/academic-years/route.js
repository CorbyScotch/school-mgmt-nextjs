import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import AcademicYear from "@/models/AcademicYear";

export async function GET() {
  await connectDB();
  const acadYears = await AcademicYear.find();

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
    return Response.json({ error: "start or end year not provided" });

  await connectDB();

  const newAcadYear = await AcademicYear.create({
    startYear,
    endYear,
    status,
  });

  return Response.json(
    { message: "Academic year created ", newAcadYear },
    { status: 201 },
  );
}
