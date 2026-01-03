import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSheetData, addRow, doc } from "@/lib/googleSheets";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await getSheetData("Requests");
  const role = (session.user as any).role;

  // Admin sees all, User sees only theirs
  const filtered = role === "admin" 
    ? rows 
    : rows.filter((r: any) => r.userEmail === session.user?.email);

  return NextResponse.json(filtered.reverse()); // Newest first
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const newRequest = {
    id: Date.now().toString(),
    userEmail: session.user?.email,
    date: new Date().toLocaleDateString(),
    type: body.type,
    description: body.description,
    status: "Pending",
    adminNotes: "",
  };

  await addRow("Requests", newRequest);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, adminNotes } = await req.json();
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Requests"];
  const rows = await sheet.getRows();
  const row = rows.find((r) => r.get("id") === id);

  if (row) {
    row.set("status", status);
    if (adminNotes) row.set("adminNotes", adminNotes);
    await row.save();
  }

  return NextResponse.json({ success: true });
}