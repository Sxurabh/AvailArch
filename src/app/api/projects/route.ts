// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { getSheetData, addRow, updateRow } from "@/lib/googleSheets";

export async function GET() {
  try {
    const projects = await getSheetData("Projects");
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // If body has an 'id', it's an UPDATE
    if (body.id) {
       await updateRow("Projects", body.id, body);
       return NextResponse.json({ success: true, mode: "update" });
    } 
    
    // Otherwise it's a CREATE
    else {
       const newId = Date.now().toString();
       await addRow("Projects", { ...body, id: newId });
       return NextResponse.json({ success: true, mode: "create", id: newId });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}