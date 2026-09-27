import { connectDB } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  getClientIp,
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
  normalizeName,
} from "@/lib/validation";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`register:${clientIp}`, 3, 60 * 1000);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many signup attempts. Please try again later." },
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

  const firstName = normalizeName(body.firstName);
  const lastName = normalizeName(body.lastName);
  const email = normalizeEmail(body.email);
  const dob = body.dob;
  const gender = String(body.gender ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");

  if (!firstName || !lastName || !email || !dob || !gender || !password)
    return Response.json(
      { error: "One or more fields missing" },
      { status: 400 },
    );

  if (!isValidEmail(email))
    return Response.json({ error: "Invalid email format" }, { status: 400 });

  if (!isStrongPassword(password))
    return Response.json(
      {
        error:
          "Password must be at least 8 characters long and contain letters and numbers",
      },
      { status: 400 },
    );

  if (!["male", "female"].includes(gender))
    return Response.json(
      { error: "Gender must be male or female" },
      { status: 400 },
    );

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser)
    return Response.json({ error: "Email already in use" }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    dob,
    gender,
    password: hashedPassword,
  });

  return Response.json(
    {
      message: "User created successfully",
      user: {
        id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        dob: newUser.dob,
        gender: newUser.gender,
        role: newUser.role,
      },
    },
    { status: 201 },
  );
}
