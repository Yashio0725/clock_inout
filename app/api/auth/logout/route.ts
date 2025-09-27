import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    cookieStore.delete("auth-session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ログアウトエラー:", error);
    return NextResponse.json(
      { error: "ログアウトに失敗しました" },
      { status: 500 }
    );
  }
}
