import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Class from "@/models/Class";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or teacher can perform this action" },
      { status: 403 },
    );
  const { id } = await params;

  await connectDB();
  const classes = await Class.findById(id);

  if (!classes) return Response.json([]);
  return Response.json(classes);
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

  const updatedClass = await Class.findByIdAndUpdate(id, body, { new: true });

  if (!updatedClass)
    return Response.json({ error: "Class not found" }, { status: 404 });

  return Response.json(updatedClass);
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

  const deletedClass = await Class.findByIdAndDelete(id);

  if (!deletedClass)
    return Response.json({ error: "Class not found" }, { status: 404 });

  return Response.json({ message: "delete success" });
}
