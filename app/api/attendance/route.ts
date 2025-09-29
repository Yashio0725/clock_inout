import { NextRequest, NextResponse } from "next/server";
import { saveRecord } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { type, comment } = await request.json();
    
    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Punch type is not specified" },
        { status: 400 }
      );
    }

    const validTypes = ["Clock In", "Clock Out", "Away From Keyboard", "Back", "Comment", "出勤", "退勤", "休憩開始", "休憩終了"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid punch type" },
        { status: 400 }
      );
    }

    // Comment type requires comment content
    if (type === "Comment") {
      if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
        return NextResponse.json(
          { error: "Comment content is required for Comment type" },
          { status: 400 }
        );
      }
    }

    const timestamp = new Date().toISOString();
    const sanitizedComment = typeof comment === "string" && comment.trim().length > 0 ? comment.trim() : undefined;
    
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp,
      date: timestamp.split('T')[0], // YYYY-MM-DD形式
      comment: sanitizedComment,
    };

    await saveRecord(record);

    return NextResponse.json({
      success: true,
      message: `${type} recorded successfully`,
      timestamp: new Date(timestamp).toLocaleString("en-US", { hour12: false }),
      record,
    });
  } catch (error) {
    console.error("Punch error:", error);
    return NextResponse.json(
      { error: "Server error occurred" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { getRecords } = await import("@/lib/storage");
    const records = await getRecords();
    
    return NextResponse.json(records);
  } catch (error) {
    console.error("Record fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}



