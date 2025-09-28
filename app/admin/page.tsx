import { getRecords, exportToExcel } from "@/lib/storage";
import AdminTable from "@/components/AdminTable";
import ExportButton from "@/components/ExportButton";
import { Michroma, Orbitron } from 'next/font/google';

const michroma = Michroma({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const orbitron = Orbitron({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default async function AdminPage() {
  const records = await getRecords();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold text-gray-900 ${michroma.className}`}>Admin Dashboard</h1>
          <ExportButton />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className={`text-2xl font-bold text-blue-600 ${orbitron.className}`}>
              {records.filter(r => r.type === "Clock In" || r.type === "出勤").length}
            </div>
            <div className={`text-sm text-gray-600 ${orbitron.className}`}>Clock In</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className={`text-2xl font-bold text-red-600 ${orbitron.className}`}>
              {records.filter(r => r.type === "Clock Out" || r.type === "退勤").length}
            </div>
            <div className={`text-sm text-gray-600 ${orbitron.className}`}>Clock Out</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className={`text-2xl font-bold text-yellow-600 ${orbitron.className}`}>
              {records.filter(r => r.type === "Away From Keyboard" || r.type === "休憩開始").length}
            </div>
            <div className={`text-sm text-gray-600 ${orbitron.className}`}>Away From Keyboard</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className={`text-2xl font-bold text-green-600 ${orbitron.className}`}>
              {records.filter(r => r.type === "Back" || r.type === "休憩終了").length}
            </div>
            <div className={`text-sm text-gray-600 ${orbitron.className}`}>Back</div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <AdminTable records={records} />
      </div>
    </div>
  );
}



