import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const body = await request.json();
  const { firstName, lastName, email, dob, gender, password } = body;

  await connectDB();

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser)
    return Response.json({ error: "email already in use" }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    dob,
    gender,
    password: hashedPassword,
  });

  return Response.json(
    {
      message: "User created succesfully",
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
