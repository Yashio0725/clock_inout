import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authSession = cookieStore.get("auth-session");

    if (authSession?.value === "authenticated") {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error("認証チェックエラー:", error);
    return NextResponse.json({ authenticated: false });
  }
}
