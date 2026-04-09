import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear } from '../../lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function PublishHistory() {
  const { week, year } = getWeekYear();
  const { isPublished } = useOutletContext<{ isPublished: boolean }>();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await fetchApi('/api/history/list');
    if (res.success) {
      setHistory(res.data);
    }
  };

  const handlePublish = async () => {
    if (confirm('确定发布本周公示？发布后将锁定所有员工分数，不可再修改，员工可查看排行榜')) {
      const res = await fetchApi('/api/publish/week', {
        method: 'POST',
        body: JSON.stringify({ week, year })
      });
      if (res.success) {
        alert('发布成功');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">公示与历史管理</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">本周公示管理</h3>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">{year}年第{week}周</p>
            <p className="text-sm text-gray-500 mt-1">
              状态: <span className={isPublished ? "text-green-600 font-medium" : "text-gray-500"}>{isPublished ? '已公示' : '未公示'}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isPublished ? (
              <span className="text-sm text-gray-500 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> 本周公示已发布，分数已锁定
              </span>
            ) : (
              <span className="text-sm text-gray-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 text-orange-500" /> 请确认评分无误后发布公示
              </span>
            )}
            <button
              onClick={handlePublish}
              disabled={isPublished}
              className="px-6 py-2 bg-[#165DFF] text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              发布本周公示
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">历史周次管理</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">周次</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公示状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.year}年第{row.week}周</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={row.is_published ? "text-green-600" : "text-gray-500"}>
                      {row.is_published ? '已公示' : '未公示'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.emp_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <button className="text-[#165DFF] hover:text-blue-900">查看详情</button>
                    <button className="text-[#165DFF] hover:text-blue-900">导出报表</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
