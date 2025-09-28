import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 環境変数からパスワードを取得（デフォルトは "admin123"）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // デバッグ用ログ（本番環境では削除してください）
    console.log("環境変数 ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
    console.log("入力されたパスワード:", password);

    if (!password) {
      return NextResponse.json(
        { error: "パスワードが入力されていません" },
        { status: 400 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      // 認証成功時はセッションクッキーを設定
      const cookieStore = cookies();
      cookieStore.set("auth-session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24時間
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("認証エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
