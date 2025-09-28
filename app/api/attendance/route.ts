import { NextRequest, NextResponse } from "next/server";
import { saveRecord } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    
    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "打刻タイプが指定されていません" },
        { status: 400 }
      );
    }

    const validTypes = ["出勤", "退勤", "休憩開始", "休憩終了"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "無効な打刻タイプです" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp,
      date: timestamp.split('T')[0], // YYYY-MM-DD形式
    };

    await saveRecord(record);

    return NextResponse.json({
      success: true,
      message: `${type}を記録しました`,
      timestamp: new Date(timestamp).toLocaleString("ja-JP"),
      record,
    });
  } catch (error) {
    console.error("打刻エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
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
    console.error("記録取得エラー:", error);
    return NextResponse.json(
      { error: "記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}


