import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import Promotion from "@/models/Promotion";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access this promotion record" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid promotion id" }, { status: 400 });
  }

  await connectDB();
  const promotion = await Promotion.findById(id).lean();

  if (!promotion) {
    return Response.json(
      { error: "Promotion record not found" },
      { status: 404 },
    );
  }

  return Response.json(promotion);
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can update promotion records" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid promotion id" }, { status: 400 });
  }

  const body = await request.json();
  await connectDB();

  const promotion = await Promotion.findByIdAndUpdate(id, body, { new: true });
  if (!promotion) {
    return Response.json(
      { error: "Promotion record not found" },
      { status: 404 },
    );
  }

  return Response.json(promotion);
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can delete promotion records" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid promotion id" }, { status: 400 });
  }

  await connectDB();
  const promotion = await Promotion.findByIdAndDelete(id);

  if (!promotion) {
    return Response.json(
      { error: "Promotion record not found" },
      { status: 404 },
    );
  }

  return Response.json({ message: "Promotion record deleted" });
}
