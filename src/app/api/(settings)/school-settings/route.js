import authorize from "@/lib/authorize";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import SchoolSettings from "@/models/SchoolSettings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, ["admin", "teacher"])) {
    return Response.json(
      { error: "Only an admin or teacher can access school settings" },
      { status: 403 },
    );
  }

  await connectDB();
  const settings = await SchoolSettings.findOne().lean();

  return Response.json(
    settings ?? { message: "School settings not configured yet" },
  );
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Invalid token" }, { status: 401 });

  if (!authorize(user, "admin")) {
    return Response.json(
      { error: "Only an admin can configure the school" },
      { status: 403 },
    );
  }

  const payload = await request.json();
  const {
    schoolName,
    schoolCode,
    schoolType,
    motto,
    region,
    district,
    town,
    phone,
    email,
    website,
    academicYear,
    currentTerm,
    feeSettings,
    schoolLogoUrl,
  } = payload;

  if (!schoolName || !schoolType || !region) {
    return Response.json(
      { error: "School name, type, and region are required" },
      { status: 400 },
    );
  }

  await connectDB();

  const fullSettings = {
    schoolName: String(schoolName).trim(),
    schoolCode: schoolCode
      ? String(schoolCode).trim().toUpperCase()
      : undefined,
    schoolType,
    motto: motto ? String(motto).trim() : undefined,
    region: String(region).trim(),
    district: district ? String(district).trim() : undefined,
    town: town ? String(town).trim() : undefined,
    phone: phone ? String(phone).trim() : undefined,
    email: email ? String(email).trim() : undefined,
    website: website ? String(website).trim() : undefined,
    academicYear: academicYear || undefined,
    currentTerm: currentTerm || undefined,
    feeSettings: feeSettings || undefined,
    schoolLogoUrl: schoolLogoUrl ? String(schoolLogoUrl).trim() : undefined,
  };

  const existing = await SchoolSettings.findOne();
  if (existing) {
    const updated = await SchoolSettings.findByIdAndUpdate(
      existing._id,
      fullSettings,
      { new: true },
    );

    return Response.json(
      { message: "School settings updated", settings: updated },
      { status: 200 },
    );
  }

  const settings = await SchoolSettings.create(fullSettings);

  return Response.json(
    { message: "School settings created", settings },
    { status: 201 },
  );
}
