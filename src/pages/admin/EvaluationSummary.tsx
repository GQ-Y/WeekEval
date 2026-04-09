import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../../lib/utils';
import { useOutletContext } from 'react-router-dom';

export default function EvaluationSummary() {
  const { week, year } = getWeekYear();
  const { isPublished } = useOutletContext<{ isPublished: boolean }>();
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, avg: 0 });
  const [department, setDepartment] = useState('全部');
  const [level, setLevel] = useState('全部');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [department, level]);

  const fetchData = async () => {
    const res = await fetchApi(`/api/evaluation/list?week=${week}&year=${year}&department=${department}&level=${level}`);
    if (res.success) {
      setData(res.data);
      setStats(res.stats);
    }
  };

  const handleScoreChange = (index: number, field: string, value: string) => {
    if (isPublished) return;
    const numValue = parseInt(value) || 0;
    const newData = [...data];
    newData[index][field] = numValue;
    
    // Recalculate total and level
    const total = newData[index].attendance_score + newData[index].chat_score + newData[index].report_score;
    newData[index].total_score = total;
    
    if (total >= 225) newData[index].level = '优秀';
    else if (total >= 200) newData[index].level = '良好';
    else if (total >= 175) newData[index].level = '及格';
    else if (total >= 150) newData[index].level = '待改进';
    else newData[index].level = '不合格';
    
    setData(newData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchApi('/api/evaluation/save-all', {
        method: 'POST',
        body: JSON.stringify({ week, year, evaluationList: data })
      });
      if (res.success) {
        alert('修改已保存');
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
        <h2 className="text-xl font-bold text-gray-900">周度考评总表 ({year}年第{week}周)</h2>
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
          <select 
            className="border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="全部">全部等级</option>
            <option value="优秀">优秀</option>
            <option value="良好">良好</option>
            <option value="及格">及格</option>
            <option value="待改进">待改进</option>
            <option value="不合格">不合格</option>
          </select>
          <button className="px-4 py-2 border border-[#165DFF] text-[#165DFF] rounded-md hover:bg-blue-50">
            重新计算
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            批量导出
          </button>
          <button 
            onClick={handleSave}
            disabled={isPublished || saving}
            className="px-4 py-2 bg-[#165DFF] text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            保存所有修改
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">考勤表现得分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">企业微信沟通得分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">周报质量得分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">周度综合总分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级</th>
                {!isPublished && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, i) => (
                <tr key={row.emp_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.emp_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" disabled={isPublished} value={row.attendance_score} onChange={(e) => handleScoreChange(i, 'attendance_score', e.target.value)} className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" disabled={isPublished} value={row.chat_score} onChange={(e) => handleScoreChange(i, 'chat_score', e.target.value)} className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input type="number" disabled={isPublished} value={row.report_score} onChange={(e) => handleScoreChange(i, 'report_score', e.target.value)} className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm disabled:bg-gray-100" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#165DFF]">
                    {row.total_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      row.level === '优秀' ? 'bg-green-100 text-green-800' :
                      row.level === '良好' ? 'bg-blue-100 text-blue-800' :
                      row.level === '及格' ? 'bg-yellow-100 text-yellow-800' :
                      row.level === '待改进' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {row.level}
                    </span>
                  </td>
                  {!isPublished && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-[#165DFF] hover:text-blue-900">编辑调整</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-sm text-gray-500 flex justify-between">
        <span>当前共{stats.count}名员工参与考评，平均总分为{stats.avg.toFixed(1)}分</span>
        <span>未发布公示前，可随时调整分数；发布后将锁定所有分数，不可修改</span>
      </div>
    </div>
  );
}
