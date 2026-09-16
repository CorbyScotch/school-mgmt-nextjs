import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Class from "@/models/Class";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );

  await connectDB();
  const classes = await Class.find();

  return Response.json(classes);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"]))
    return Response.json(
      { error: "Only an admin or a teacher can perform this action" },
      { status: 403 },
    );

  const { level, section } = await request.json();

  if (!level)
    return Response.json({ error: "Level not provided" }, { status: 400 });

  await connectDB();
  const newClass = await Class.create({ level, section });

  return Response.json({ message: "Class created", newClass }, { status: 201 });
}
