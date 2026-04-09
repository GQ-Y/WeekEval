import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../../lib/utils';
import { useOutletContext } from 'react-router-dom';

export default function ReportScore() {
  const { week, year } = getWeekYear();
  const { isPublished } = useOutletContext<{ isPublished: boolean }>();
  const [data, setData] = useState<any[]>([]);
  const [department, setDepartment] = useState('全部');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [department]);

  const fetchData = async () => {
    const res = await fetchApi(`/api/report/score/list?week=${week}&year=${year}&department=${department}`);
    if (res.success) {
      setData(res.data);
    }
  };

  const handleScoreChange = (index: number, field: string, value: string) => {
    if (isPublished) return;
    const numValue = parseInt(value) || 0;
    const newData = [...data];
    newData[index][field] = numValue;
    
    // Calculate total
    let total = newData[index].feedback_depth + newData[index].progress_node + newData[index].plan_feasibility + newData[index].work_continuity;
    
    if (newData[index].submit_status === 'unsubmitted') {
      total = 0;
    } else {
      if (newData[index].submit_status === 'submitted' && total < 28) {
        total = 28;
      } else if (newData[index].submit_status === 'overdue') {
        total = Math.max(0, total - 5);
      }
    }
    
    newData[index].report_score = total;
    setData(newData);
  };

  const handleStatusChange = (index: number, status: string) => {
    if (isPublished) return;
    const newData = [...data];
    newData[index].submit_status = status;
    
    // Recalculate total
    let total = newData[index].feedback_depth + newData[index].progress_node + newData[index].plan_feasibility + newData[index].work_continuity;
    
    if (status === 'unsubmitted') {
      total = 0;
    } else {
      if (status === 'submitted' && total < 28) {
        total = 28;
      } else if (status === 'overdue') {
        total = Math.max(0, total - 5);
      }
    }
    
    newData[index].report_score = total;
    setData(newData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchApi('/api/report/score/save', {
        method: 'POST',
        body: JSON.stringify({ week, year, scoreList: data })
      });
      if (res.success) {
        alert('周报评分保存成功');
      } else {
        alert('保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">周报评分管理 ({year}年第{week}周)</h2>
        <div className="flex space-x-4">
          <select 
            className="border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="全部">全部部门</option>
            <option value="研发部">研发部</option>
            <option value="产品部">产品部</option>
            <option value="设计部">设计部</option>
          </select>
          <button 
            onClick={handleSave}
            disabled={isPublished || saving}
            className="px-4 py-2 bg-[#165DFF] text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            保存评分
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            批量导出
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作反馈深度(14)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度节点明确性(13)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划可行性(10)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作连续性(13)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">周报总分(50)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, i) => (
                <tr key={row.emp_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.emp_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      disabled={isPublished}
                      value={row.submit_status}
                      onChange={(e) => handleStatusChange(i, e.target.value)}
                      className={cn(
                        "text-sm border-gray-300 rounded-md",
                        row.submit_status === 'submitted' ? 'text-green-600' :
                        row.submit_status === 'overdue' ? 'text-orange-500' : 'text-red-600'
                      )}
                    >
                      <option value="submitted">已提交</option>
                      <option value="overdue">逾期提交</option>
                      <option value="unsubmitted">未提交</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" min="0" max="14" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.feedback_depth} onChange={(e) => handleScoreChange(i, 'feedback_depth', e.target.value)} className="w-16 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" min="0" max="13" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.progress_node} onChange={(e) => handleScoreChange(i, 'progress_node', e.target.value)} className="w-16 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" min="0" max="10" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.plan_feasibility} onChange={(e) => handleScoreChange(i, 'plan_feasibility', e.target.value)} className="w-16 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" min="0" max="13" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.work_continuity} onChange={(e) => handleScoreChange(i, 'work_continuity', e.target.value)} className="w-16 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.report_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-gray-500">正常提交周报最低保障28分，逾期提交扣5分，未提交得0分；录入完成后请点击保存评分</p>
    </div>
  );
}
