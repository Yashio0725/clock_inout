import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 認証が必要なパス
  const protectedPaths = ["/", "/admin"];
  
  // 認証が不要なパス
  const publicPaths = ["/login"];
  
  // 現在のパスが保護されたパスかどうかチェック
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(path + "/")
  );
  
  // 現在のパスがパブリックパスかどうかチェック
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + "/")
  );
  
  // APIルートは認証チェックをスキップ
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  
  // 認証セッションをチェック
  const authSession = request.cookies.get("auth-session");
  const isAuthenticated = authSession?.value === "authenticated";
  
  // 認証が必要なパスで認証されていない場合
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // 認証済みでログインページにアクセスした場合
  if (isPublicPath && isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
