import { createToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password)
    return Response.json(
      { error: "Email and Password are required" },
      { status: 400 },
    );

  await connectDB();
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (!existingUser || !(await bcrypt.compare(password, existingUser.password)))
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );

  // generate token
  const token = await createToken({
    userId: existingUser._id.toString(),
    role: existingUser.role,
  });
  // save token in cookie
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
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
