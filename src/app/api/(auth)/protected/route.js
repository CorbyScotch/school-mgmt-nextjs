import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();

  if (!user)
    return Response.json({ error: "verification failed" }, { status: 401 });
  return Response.json({ userId: user.userId, role: user.role });
}
