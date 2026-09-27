import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only admins or teachers can access users" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  await connectDB();

  const query = role ? { role } : {};
  const users = await User.find(query)
    .select("firstName lastName email role gender createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return Response.json(users);
}
