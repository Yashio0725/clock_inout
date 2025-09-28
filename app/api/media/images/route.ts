import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const mediaDir = path.join(process.cwd(), "public", "media");
    
    // ディレクトリが存在するかチェック
    try {
      await fs.access(mediaDir);
    } catch {
      // ディレクトリが存在しない場合は作成
      await fs.mkdir(mediaDir, { recursive: true });
      return NextResponse.json([]);
    }

    // ディレクトリ内のファイルを取得
    const files = await fs.readdir(mediaDir);
    
    // 画像ファイルのみをフィルタリング
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // ファイルパスを相対パスに変換
    const imagePaths = imageFiles.map(file => `/media/${file}`);
    
    return NextResponse.json(imagePaths);
  } catch (error) {
    console.error("画像リスト取得エラー:", error);
    return NextResponse.json(
      { error: "画像リストの取得に失敗しました" },
      { status: 500 }
    );
  }
}




