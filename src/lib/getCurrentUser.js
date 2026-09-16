import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = await verifyToken(token);
    const { userId, role } = decoded.payload;

    return { userId, role };
  } catch (err) {
    return null;
  }
}
