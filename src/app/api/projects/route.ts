import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addRow, getSheetData } from "@/lib/googleSheets"; // Added getSheetData
import { NextResponse } from "next/server";

// 1. GET: Fetch all projects from Google Sheets
export async function GET() {
  try {
    const projects = await getSheetData("Projects");
    
    // Ensure cache is disabled so new projects show immediately
    return NextResponse.json(projects, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// 2. POST: Add a new project (Only Admin)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  // Create a unique ID based on timestamp
  const newProject = {
    id: Date.now().toString(),
    ...body // title, year, category, image
  };

  await addRow("Projects", newProject);

  return NextResponse.json({ success: true, project: newProject });
}