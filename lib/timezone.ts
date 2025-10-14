/**
 * 日本時間（JST）を扱うためのユーティリティ関数
 */

/**
 * 現在の日本時間をISO文字列で取得
 */
export function getJSTTimestamp(): string {
  const now = new Date();
  // 日本時間（UTC+9）に変換
  const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return jstTime.toISOString();
}

/**
 * 現在の日本時間の日付部分（YYYY-MM-DD）を取得
 */
export function getJSTDate(): string {
  return getJSTTimestamp().split('T')[0];
}

/**
 * ISO文字列を日本時間のDateオブジェクトに変換
 */
export function parseJSTTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * 日本時間での日時フォーマット
 */
export function formatJSTDateTime(timestamp: string): string {
  const date = parseJSTTimestamp(timestamp);
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 日本時間での時刻フォーマット
 */
export function formatJSTTime(timestamp: string): string {
  const date = parseJSTTimestamp(timestamp);
  return date.toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * 日本時間での日付フォーマット
 */
export function formatJSTDate(timestamp: string): string {
  const date = parseJSTTimestamp(timestamp);
  return date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
