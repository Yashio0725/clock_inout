import { formatJSTDateTime } from "@/lib/timezone";

interface AttendanceRecord {
  id: string;
  type: string;
  timestamp: string;
  date: string;
  comment?: string;
}

interface AdminTableProps {
  records: AttendanceRecord[];
}

export default function AdminTable({ records }: AdminTableProps) {
  const formatDateTime = (timestamp: string) => {
    return formatJSTDateTime(timestamp);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Clock In":
      case "出勤":
        return "bg-green-100 text-green-800";
      case "Clock Out":
      case "退勤":
        return "bg-red-100 text-red-800";
      case "Away From Keyboard":
      case "休憩開始":
        return "bg-yellow-100 text-yellow-800";
      case "Back":
      case "休憩終了":
        return "bg-blue-100 text-blue-800";
      case "Comment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 日付ごとにグループ化
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  // 日付順でソート
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">勤怠記録一覧</h2>
      
      {sortedDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          まだ勤怠記録がありません
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-semibold text-gray-800">
                  {new Date(date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        時刻
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        区分
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        コメント
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedRecords[date]
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {formatDateTime(record.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                              {record.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.comment ?? "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





