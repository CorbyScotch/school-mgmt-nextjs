import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import AcademicYear from "@/models/AcademicYear";

export async function GET(request, { params }) {
  const { id } = await params;

  await connectDB();
  const acadYear = await AcademicYear.findById(id);

  if (!acadYear)
    return Response.json({ error: "Year not found" }, { status: 404 });

  return Response.json(acadYear);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;
  const body = await request.json();

  await connectDB();

  const updatedYear = await AcademicYear.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedYear)
    return Response.json({ error: "Year not found" }, { status: 404 });

  return Response.json(updatedYear);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 404 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;

  await connectDB();

  const deletedYear = await AcademicYear.findByIdAndDelete(id);

  if (!deletedYear)
    return Response.json({ error: "Year not found" }, { status: 404 });

  return Response.json({ message: "Delete success" });
}
