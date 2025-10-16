import { Redis } from "@upstash/redis";
import * as ExcelJS from "exceljs";

interface AttendanceRecord {
  id: string;
  type: string;
  timestamp: string;
  date: string;
  comment?: string;
}

// Upstash Redis クライアントを初期化
const redis = Redis.fromEnv();

const RECORDS_KEY = "attendance_records";

// Convert Japanese record types to English
function normalizeRecordType(type: string): string {
  const typeMapping: { [key: string]: string } = {
    "出勤": "Clock In",
    "退勤": "Clock Out",
    "休憩開始": "Away From Keyboard",
    "休憩終了": "Back"
  };
  return typeMapping[type] || type;
}

// 記録を保存
export async function saveRecord(record: AttendanceRecord): Promise<void> {
  try {
    // 既存の記録を取得
    const existingRecords = await getRecords();
    
    // 新しい記録を追加
    const updatedRecords = [...existingRecords, record];
    
    // 日付と時刻でソート
    updatedRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Redisに保存
    await redis.set(RECORDS_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error("Record save error:", error);
    throw new Error("Failed to save record");
  }
}

// 記録を取得
export async function getRecords(): Promise<AttendanceRecord[]> {
  try {
    const data = await redis.get(RECORDS_KEY);
    
    if (!data) {
      return [];
    }
    
    const records = typeof data === 'string' ? JSON.parse(data) : data;
    
    // 記録タイプを英語に正規化し、日付と時刻でソート
    const normalizedRecords = records.map((record: AttendanceRecord) => ({
      ...record,
      type: normalizeRecordType(record.type)
    }));
    
    return normalizedRecords.sort((a: AttendanceRecord, b: AttendanceRecord) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error("Record fetch error:", error);
    return [];
  }
}

// Excelファイルにエクスポート
export async function exportToExcel(records: AttendanceRecord[]): Promise<Buffer> {
  // ワークブックを作成
  const workbook = new ExcelJS.Workbook();
  
  // Attendance Records Sheet
  const worksheet = workbook.addWorksheet("Attendance Records");
  
  // Set header row
  worksheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Time", key: "time", width: 10 },
    { header: "Type", key: "type", width: 20 },
    { header: "Comment", key: "comment", width: 32 },
    { header: "Timestamp", key: "timestamp", width: 25 },
  ];
  
  // Add data
  records.forEach(record => {
    worksheet.addRow({
      date: new Date(record.timestamp).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" }),
      time: new Date(record.timestamp).toLocaleTimeString("ja-JP", { 
        timeZone: "Asia/Tokyo", 
        hour12: false 
      }),
      type: record.type,
      comment: record.comment ?? "",
      timestamp: record.timestamp,
    });
  });
  
  // Set header row style
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // 統計情報シートを作成
  const statsWorksheet = workbook.addWorksheet("統計情報");
  const stats = calculateStats(records);
  
  statsWorksheet.columns = [
    { header: "項目", key: "item", width: 15 },
    { header: "値", key: "value", width: 10 },
  ];
  
  stats.forEach(stat => {
    statsWorksheet.addRow({
      item: stat["項目"],
      value: stat["値"],
    });
  });
  
  // 統計情報のヘッダー行のスタイルを設定
  statsWorksheet.getRow(1).font = { bold: true };
  statsWorksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Bufferに変換
  const buffer = await workbook.xlsx.writeBuffer();
  
  return Buffer.from(buffer);
}

// 統計情報を計算
function calculateStats(records: AttendanceRecord[]) {
  const stats = [
    { "項目": "総記録数", "値": records.length },
    { "項目": "出勤回数", "値": records.filter(r => r.type === "出勤").length },
    { "項目": "退勤回数", "値": records.filter(r => r.type === "退勤").length },
    { "項目": "休憩開始回数", "値": records.filter(r => r.type === "休憩開始").length },
    { "項目": "休憩終了回数", "値": records.filter(r => r.type === "休憩終了").length },
  ];

  // 日付ごとの統計
  const dateStats = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = { 出勤: 0, 退勤: 0, 休憩開始: 0, 休憩終了: 0 };
    }
    acc[date][record.type as keyof typeof acc[typeof date]]++;
    return acc;
  }, {} as Record<string, { 出勤: number; 退勤: number; 休憩開始: number; 休憩終了: number }>);

  // 日付統計を配列に変換
  Object.entries(dateStats).forEach(([date, counts]) => {
    stats.push({
      "項目": `${date} 出勤`,
      "値": counts.出勤
    });
    stats.push({
      "項目": `${date} 退勤`,
      "値": counts.退勤
    });
  });

  return stats;
}

// 特定の日付の記録を取得
export async function getRecordsByDate(date: string): Promise<AttendanceRecord[]> {
  const records = await getRecords();
  return records.filter(record => record.date === date);
}

// 記録を削除（管理者用）
export async function deleteRecord(id: string): Promise<boolean> {
  try {
    const records = await getRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    
    if (filteredRecords.length === records.length) {
      return false; // 削除する記録が見つからない
    }
    
    await redis.set(RECORDS_KEY, JSON.stringify(filteredRecords));
    return true;
  } catch (error) {
    console.error("Record delete error:", error);
    return false;
  }
}
