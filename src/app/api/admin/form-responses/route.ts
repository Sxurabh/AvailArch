import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // 🟢 CHANGED: Import from @/lib/auth
import { getFormResponses } from "@/lib/sheetsAdmin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Security Check: Only allow Admins
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { headers, data } = await getFormResponses();

    return NextResponse.json({ headers, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to load responses. Check server logs and Sheet ID." }, 
      { status: 500 }
    );
  }
}