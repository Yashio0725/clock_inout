import { NextResponse } from "next/server";
import { getRecords } from "@/lib/storage";
import { getJSTDate } from "@/lib/timezone";

export async function GET() {
  try {
    const records = await getRecords();
    const today = getJSTDate(); // 日本時間の今日の日付
    
    // 今日の記録のみをフィルタリング
    // UTC時刻をそのまま日付として使用（日本時間として扱う）
    const todayRecords = records.filter(record => {
      const recordDate = record.timestamp.split('T')[0]; // YYYY-MM-DD部分を取得
      return recordDate === today;
    });
    
    // 時刻順でソート
    todayRecords.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return NextResponse.json(todayRecords);
  } catch (error) {
    console.error("Today's record fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's records" },
      { status: 500 }
    );
  }
}



