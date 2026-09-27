import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      app: "SchoolFlow",
    });
  } catch (error) {
    return Response.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "unavailable",
        app: "SchoolFlow",
        error: "Database connection failed",
      },
      { status: 503 },
    );
  }
}
