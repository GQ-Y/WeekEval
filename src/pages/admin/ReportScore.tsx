import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../../lib/utils';
import { useOutletContext } from 'react-router-dom';
import { Save, Download } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">周报评分管理</h2>
          <p className="text-sm text-slate-500 mt-1">正常提交最低保障28分，逾期扣5分，未提交得0分</p>
        </div>
        <div className="flex items-center space-x-3">
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
          <button className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" /> 导出
          </button>
          <button 
            onClick={handleSave}
            disabled={isPublished || saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" /> {saving ? '保存中...' : '保存评分'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">员工信息</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">提交状态</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">反馈深度(14)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">进度节点(13)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">计划可行(10)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">工作连续(13)</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">总分(50)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={row.emp_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{row.emp_name}</div>
                    <div className="text-xs text-slate-500">{row.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      disabled={isPublished}
                      value={row.submit_status}
                      onChange={(e) => handleStatusChange(i, e.target.value)}
                      className={cn(
                        "text-sm font-medium rounded-lg border-slate-200 focus:ring-blue-500 py-1.5 pl-3 pr-8",
                        row.submit_status === 'submitted' ? 'text-emerald-600 bg-emerald-50' :
                        row.submit_status === 'overdue' ? 'text-orange-600 bg-orange-50' : 'text-rose-600 bg-rose-50'
                      )}
                    >
                      <option value="submitted">已提交</option>
                      <option value="overdue">逾期提交</option>
                      <option value="unsubmitted">未提交</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="number" min="0" max="14" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.feedback_depth} onChange={(e) => handleScoreChange(i, 'feedback_depth', e.target.value)} className="w-16 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="number" min="0" max="13" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.progress_node} onChange={(e) => handleScoreChange(i, 'progress_node', e.target.value)} className="w-16 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="number" min="0" max="10" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.plan_feasibility} onChange={(e) => handleScoreChange(i, 'plan_feasibility', e.target.value)} className="w-16 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="number" min="0" max="13" disabled={isPublished || row.submit_status === 'unsubmitted'} value={row.work_continuity} onChange={(e) => handleScoreChange(i, 'work_continuity', e.target.value)} className="w-16 text-center border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-black text-blue-600">
                    {row.report_score}
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
