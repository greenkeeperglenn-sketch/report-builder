import { NextRequest, NextResponse } from "next/server";
import { parseExcelBuffer } from "@/lib/excel-parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const tables = parseExcelBuffer(buffer);

    return NextResponse.json({ tables });
  } catch (error) {
    console.error("Excel parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse Excel file" },
      { status: 500 }
    );
  }
}
