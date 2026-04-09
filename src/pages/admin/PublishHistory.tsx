import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../../lib/utils';
import { useOutletContext } from 'react-router-dom';
import { Send, History, CheckCircle, AlertCircle } from 'lucide-react';

export default function PublishHistory() {
  const { week, year } = getWeekYear();
  const { isPublished } = useOutletContext<{ isPublished: boolean }>();
  const [history, setHistory] = useState<any[]>([]);
  const [publishing, setPublishing] = useState(false);

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
    if (!window.confirm('确认公示本周考评结果吗？公示后将无法再修改分数！')) return;
    
    setPublishing(true);
    try {
      const res = await fetchApi('/api/publish/week', {
        method: 'POST',
        body: JSON.stringify({ week, year })
      });
      if (res.success) {
        alert('公示成功！');
        window.location.reload(); // Reload to update layout state
      } else {
        alert('公示失败');
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">公示与历史</h2>
        <p className="text-sm text-slate-500 mt-1">发布本周考评结果，或查看历史周次数据</p>
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/40 rounded-3xl p-10 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">本周考评公示 ({year}年第{week}周)</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
            公示后，所有员工可在「公共查询页」查看本周的综合排行榜及部门平均分排行。
            <strong className="text-rose-500 font-medium ml-1">注意：公示操作不可逆，公示后本周所有分数将被锁定，无法再次修改。</strong>
          </p>
        </div>
        
        <div className="flex-shrink-0">
          {isPublished ? (
            <div className="flex items-center px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-500" />
              本周已公示
            </div>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              <Send className="w-5 h-5 mr-3" />
              {publishing ? '发布中...' : '确认无误，立即公示'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center">
          <History className="w-5 h-5 text-slate-400 mr-3" />
          <h3 className="text-lg font-bold text-slate-900">历史考评记录</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">周次</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">参评人数</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {history.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {row.year}年 第{row.week}周
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {row.emp_count} 人
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.is_published === 1 ? (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        已公示
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        未公示
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href={`/public?week=${row.week}&year=${row.year}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      查看榜单
                    </a>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">暂无历史记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
