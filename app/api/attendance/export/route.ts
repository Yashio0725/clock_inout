import { NextResponse } from "next/server";
import { getRecords, exportToExcel } from "@/lib/storage";

export async function GET() {
  try {
    const records = await getRecords();
    const excelBuffer = await exportToExcel(records);
    
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`勤怠記録_${new Date().toISOString().split('T')[0]}.xlsx`)}`,
      },
    });
  } catch (error) {
    console.error("Excel出力エラー:", error);
    return NextResponse.json(
      { error: "Excel出力に失敗しました" },
      { status: 500 }
    );
  }
}
