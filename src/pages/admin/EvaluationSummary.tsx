import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../../lib/utils';
import { useOutletContext } from 'react-router-dom';
import { Save, RefreshCw, Download, Edit3 } from 'lucide-react';

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

  const getLevelBadge = (level: string) => {
    return (
      <span className={cn(
        "px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border",
        level === '优秀' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        level === '良好' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        level === '及格' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        level === '待改进' ? 'bg-orange-50 text-orange-700 border-orange-200' :
        'bg-rose-50 text-rose-700 border-rose-200'
      )}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">周度考评总表</h2>
          <p className="text-sm text-slate-500 mt-1">
            本周参评人数 <span className="font-bold text-slate-900">{stats.count}</span> 人，
            平均分 <span className="font-bold text-blue-600">{stats.avg.toFixed(1)}</span> 分
          </p>
        </div>
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <select 
            className="bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 pl-3 pr-10"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="全部">全部部门</option>
            <option value="研发部">研发部</option>
            <option value="产品部">产品部</option>
            <option value="设计部">设计部</option>
          </select>
          <select 
            className="bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 pl-3 pr-10"
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
          <button className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" /> 导出
          </button>
          <button 
            onClick={handleSave}
            disabled={isPublished || saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" /> {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">排名</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">员工信息</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">考勤分(100+)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">会话分(100)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">周报分(50)</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">综合总分</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">考评等级</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={row.emp_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-400">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{row.emp_name}</div>
                    <div className="text-xs text-slate-500">{row.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="number" 
                      disabled={isPublished} 
                      value={row.attendance_score} 
                      onChange={(e) => handleScoreChange(i, 'attendance_score', e.target.value)} 
                      className="w-20 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-transparent disabled:border-transparent disabled:text-slate-900 disabled:font-medium" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="number" 
                      disabled={isPublished} 
                      value={row.chat_score} 
                      onChange={(e) => handleScoreChange(i, 'chat_score', e.target.value)} 
                      className="w-20 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-transparent disabled:border-transparent disabled:text-slate-900 disabled:font-medium" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="number" 
                      disabled={isPublished} 
                      value={row.report_score} 
                      onChange={(e) => handleScoreChange(i, 'report_score', e.target.value)} 
                      className="w-20 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-transparent disabled:border-transparent disabled:text-slate-900 disabled:font-medium" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-black text-blue-600">
                    {row.total_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getLevelBadge(row.level)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
