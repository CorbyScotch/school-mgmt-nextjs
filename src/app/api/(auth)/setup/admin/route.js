import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const body = await request.json();
  const { setupKey, firstName, lastName, email, dob, gender, password } = body;

  if (setupKey !== process.env.INITIAL_ADMIN_SETUP_KEY) {
    return Response.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await connectDB();
  const admin = await User.findOne({ role: "admin" });

  if (admin)
    return Response.json({ error: "Admin already exists" }, { status: 403 });

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    dob,
    gender,
    password: hashedPassword,
    role: "admin",
  });

  return Response.json(
    { message: "Initial Admin created successfully" },
    { status: 201 },
  );
}
