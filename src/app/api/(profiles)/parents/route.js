import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import ParentProfile from "@/models/ParentProfile";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access parent profiles" },
      { status: 403 },
    );
  }

  await connectDB();
  const parents = await ParentProfile.find().sort({ createdAt: -1 }).lean();
  return Response.json(parents);
}

export async function POST(request) {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(currentUser, "admin")) {
    return Response.json(
      { error: "Only an admin can create parent profiles" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const {
    user,
    relationship,
    phone,
    alternatePhone,
    email,
    address,
    occupation,
    isPrimaryContact,
  } = payload;

  if (
    !user ||
    !mongoose.Types.ObjectId.isValid(String(user)) ||
    !relationship ||
    !phone
  ) {
    return Response.json(
      { error: "User, relationship, and phone are required" },
      { status: 400 },
    );
  }

  await connectDB();

  const validUser = await User.findOne({ _id: user, role: "parent" });
  if (!validUser) {
    return Response.json({ error: "Parent user not found" }, { status: 404 });
  }

  const existingParent = await ParentProfile.findOne({ user });
  if (existingParent) {
    return Response.json(
      { error: "Parent profile already exists" },
      { status: 409 },
    );
  }

  const parent = await ParentProfile.create({
    user,
    relationship,
    phone,
    alternatePhone,
    email,
    address,
    occupation,
    isPrimaryContact,
  });

  return Response.json(
    { message: "Parent profile created", parent },
    { status: 201 },
  );
}
