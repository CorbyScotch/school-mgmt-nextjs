import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const normalizeName = (value) => String(value ?? "").trim();

export async function POST(request) {
  const body = await request.json();
  const { setupKey, firstName, lastName, email, dob, gender, password } = body;

  if (!process.env.INITIAL_ADMIN_SETUP_KEY) {
    return Response.json(
      { error: "Initial admin setup is not configured on this server." },
      { status: 500 },
    );
  }

  if (setupKey !== process.env.INITIAL_ADMIN_SETUP_KEY) {
    return Response.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const cleanFirstName = normalizeName(firstName);
  const cleanLastName = normalizeName(lastName);
  const cleanEmail = String(email ?? "")
    .trim()
    .toLowerCase();
  const cleanGender = String(gender ?? "")
    .trim()
    .toLowerCase();

  if (
    !cleanFirstName ||
    !cleanLastName ||
    !cleanEmail ||
    !dob ||
    !cleanGender ||
    !password
  ) {
    return Response.json(
      { error: "All admin setup fields are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return Response.json(
      { error: "A valid email address is required." },
      { status: 400 },
    );
  }

  if (String(password).length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 },
    );
  }

  if (!["male", "female"].includes(cleanGender)) {
    return Response.json(
      { error: "Gender must be either male or female." },
      { status: 400 },
    );
  }

  await connectDB();
  const admin = await User.findOne({ role: "admin" });

  if (admin) {
    return Response.json({ error: "Admin already exists." }, { status: 403 });
  }

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);

  await User.create({
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
    dob: new Date(dob),
    gender: cleanGender,
    password: hashedPassword,
    role: "admin",
  });

  return Response.json(
    { message: "Initial admin created successfully." },
    { status: 201 },
  );
}
