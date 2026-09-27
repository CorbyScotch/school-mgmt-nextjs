import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import AcademicYear from "@/models/AcademicYear";
import Term from "@/models/Term";
import mongoose from "mongoose";

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
      { error: "Academic year, term, start date, and end date are required" },
      { status: 400 },
    );

  if (!/^(Term 1|Term 2|Term 3)$/.test(term)) {
    return Response.json({ error: "Invalid term value" }, { status: 400 });
  }

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(acadYear)) {
    return Response.json(
      { error: "Invalid academic year id" },
      { status: 400 },
    );
  }

  const availableYear = await AcademicYear.findById(acadYear);
  if (!availableYear)
    return Response.json({ error: "No such year found" }, { status: 404 });

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return Response.json(
      { error: "Dates are invalid or end date is before start date" },
      { status: 400 },
    );
  }

  try {
    const newTerm = await Term.create({
      acadYear,
      term,
      startDate: start,
      endDate: end,
      status,
    });

    return Response.json(
      { message: "Term created ", newTerm },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        { error: "This term already exists for the academic year" },
        { status: 409 },
      );
    }

    return Response.json({ error: "Could not create term" }, { status: 500 });
  }
}
