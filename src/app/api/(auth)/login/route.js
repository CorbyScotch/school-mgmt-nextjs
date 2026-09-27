import { createToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, isValidEmail, normalizeEmail } from "@/lib/validation";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  let body;

  try {
    body = await request.json();
  } catch (error) {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");

  if (!email || !password)
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 },
    );

  if (!isValidEmail(email))
    return Response.json({ error: "Invalid email format" }, { status: 400 });

  await connectDB();
  const existingUser = await User.findOne({ email });

  if (!existingUser || !(await bcrypt.compare(password, existingUser.password)))
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );

  const token = await createToken({
    userId: existingUser._id.toString(),
    role: existingUser.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return Response.json({
    message: "Login successful",
    user: {
      id: existingUser._id.toString(),
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      dob: existingUser.dob,
      gender: existingUser.gender,
      role: existingUser.role,
    },
  });
}
