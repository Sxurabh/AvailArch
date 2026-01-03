import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addRow } from "@/lib/googleSheets";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await addRow("Projects", {
    id: Date.now().toString(),
    ...body // title, year, category, image
  });

  return NextResponse.json({ success: true });
}