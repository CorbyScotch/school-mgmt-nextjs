import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Subject from "@/models/Subject";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or teacher can perform this action" },
      { status: 403 },
    );

  await connectDB();
  const subjects = await Subject.find();

  return Response.json(subjects);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin"))
    return Response.json(
      { error: "Only an admin can perform this action" },
      { status: 403 },
    );

  const { name, code } = await request.json();

  if (!code || !name)
    return Response.json(
      { error: "Subject code or name not provided " },
      { status: 400 },
    );

  await connectDB();
  const newSubject = await Subject.create({ name, code });

  return Response.json(
    { message: "Subject created successfully", newSubject },
    { status: 201 },
  );
}
