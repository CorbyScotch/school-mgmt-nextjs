import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import AcademicYear from "@/models/AcademicYear";
import Term from "@/models/Term";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or teacher can perform this action" },
      { status: 403 },
    );

  await connectDB();
  const term = await Term.find();

  return Response.json(term);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { acadYear, term, startDate, endDate, status } = await request.json();

  if (!acadYear || !term || !startDate || !endDate)
    return Response.json(
      { error: "one or more fields not provided" },
      { status: 400 },
    );

  await connectDB();

  const availableYear = await AcademicYear.findById(acadYear);
  if (!availableYear)
    return Response.json({ error: "No such year found" }, { status: 404 });

  const newTerm = await Term.create({
    acadYear,
    term,
    startDate,
    endDate,
    status,
  });

  return Response.json({ message: "Term created ", newTerm }, { status: 201 });
}
