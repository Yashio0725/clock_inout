import fs from "fs/promises";
import path from "path";
import * as ExcelJS from "exceljs";

interface AttendanceRecord {
  id: string;
  type: string;
  timestamp: string;
  date: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "attendance.json");

// データディレクトリが存在しない場合は作成
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// 記録を保存
export async function saveRecord(record: AttendanceRecord): Promise<void> {
  await ensureDataDirectory();
  
  let records: AttendanceRecord[] = [];
  
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    records = JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空の配列から開始
    records = [];
  }
  
  records.push(record);
  
  // 日付と時刻でソート
  records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2));
}

// 記録を取得
export async function getRecords(): Promise<AttendanceRecord[]> {
  await ensureDataDirectory();
  
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const records = JSON.parse(data);
    
    // 日付と時刻でソート
    return records.sort((a: AttendanceRecord, b: AttendanceRecord) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    // ファイルが存在しない場合は空の配列を返す
    return [];
  }
}

// Excelファイルにエクスポート
export async function exportToExcel(records: AttendanceRecord[]): Promise<Buffer> {
  // ワークブックを作成
  const workbook = new ExcelJS.Workbook();
  
  // 勤怠記録シートを作成
  const worksheet = workbook.addWorksheet("勤怠記録");
  
  // ヘッダー行を設定
  worksheet.columns = [
    { header: "日付", key: "date", width: 12 },
    { header: "時刻", key: "time", width: 10 },
    { header: "区分", key: "type", width: 12 },
    { header: "タイムスタンプ", key: "timestamp", width: 20 },
  ];
  
  // データを追加
  records.forEach(record => {
    worksheet.addRow({
      date: new Date(record.timestamp).toLocaleDateString("ja-JP"),
      time: new Date(record.timestamp).toLocaleTimeString("ja-JP"),
      type: record.type,
      timestamp: record.timestamp,
    });
  });
  
  // ヘッダー行のスタイルを設定
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
    
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredRecords, null, 2));
    return true;
  } catch (error) {
    console.error("記録削除エラー:", error);
    return false;
  }
}
