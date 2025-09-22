import { NextResponse } from "next/server";
import { getRecords } from "@/lib/storage";

export async function GET() {
  try {
    const records = await getRecords();
    const today = new Date().toISOString().split('T')[0];
    
    // 今日の記録のみをフィルタリング
    const todayRecords = records.filter(record => record.date === today);
    
    // 時刻順でソート
    todayRecords.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return NextResponse.json(todayRecords);
  } catch (error) {
    console.error("今日の記録取得エラー:", error);
    return NextResponse.json(
      { error: "今日の記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}
