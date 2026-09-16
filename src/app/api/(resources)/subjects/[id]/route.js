import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Subject from "@/models/Subject";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or teacher can perform this action" },
      { status: 403 },
    );

  await connectDB();
  const subject = await Subject.findById(id);

  if (!subject)
    return Response.json({ error: "Subject not found" }, { status: 404 });

  return Response.json(subject);
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

  const updatedSubject = await Subject.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedSubject)
    return Response.json({ error: "Subject not found" }, { status: 404 });

  return Response.json(updatedSubject);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { id } = await params;

  await connectDB();

  const deletedSubject = await Subject.findByIdAndDelete(id);
  if (!deletedSubject)
    return Response.json({ error: "Subject not found" }, { status: 404 });

  return Response.json({ message: "Delete success" });
}
