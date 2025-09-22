import { getRecords, exportToExcel } from "@/lib/storage";
import AdminTable from "@/components/AdminTable";
import ExportButton from "@/components/ExportButton";

export default async function AdminPage() {
  const records = await getRecords();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">勤怠管理画面</h1>
          <ExportButton />
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {records.filter(r => r.type === "出勤").length}
            </div>
            <div className="text-sm text-gray-600">出勤回数</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {records.filter(r => r.type === "退勤").length}
            </div>
            <div className="text-sm text-gray-600">退勤回数</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {records.filter(r => r.type === "休憩開始").length}
            </div>
            <div className="text-sm text-gray-600">休憩開始</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => r.type === "休憩終了").length}
            </div>
            <div className="text-sm text-gray-600">休憩終了</div>
          </div>
        </div>

        {/* 勤怠記録テーブル */}
        <AdminTable records={records} />
      </div>
    </div>
  );
}
