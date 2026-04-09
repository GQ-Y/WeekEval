import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../lib/utils';
import { Trophy, Medal, Award, Building2, Users } from 'lucide-react';

export default function PublicRanking() {
  const { week: currentWeek, year: currentYear } = getWeekYear();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [ranking, setRanking] = useState<any[]>([]);
  const [deptRanking, setDeptRanking] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/api/history/list').then(res => {
      if (res.success) {
        setHistory(res.data.filter((d: any) => d.is_published === 1));
      }
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedWeek, selectedYear]);

  const fetchData = async () => {
    const res = await fetchApi(`/api/public/ranking?week=${selectedWeek}&year=${selectedYear}`);
    if (res.success) {
      setRanking(res.data);
      setDeptRanking(res.deptRanking);
      setMessage(res.message || '');
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-7 h-7 text-amber-400 drop-shadow-md" />;
    if (index === 1) return <Medal className="w-7 h-7 text-slate-300 drop-shadow-md" />;
    if (index === 2) return <Award className="w-7 h-7 text-amber-700 drop-shadow-md" />;
    return <span className="text-slate-500 font-bold w-7 text-center inline-block">{index + 1}</span>;
  };

  const getLevelBadge = (level: string) => {
    return (
      <span className={cn(
        "px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border",
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white py-12 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-slate-900/50 mix-blend-multiply"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {selectedYear}年第{selectedWeek}周员工综合考评公示
          </h1>
          <p className="text-blue-200 text-sm md:text-base font-medium max-w-2xl mx-auto">
            公平 · 公正 · 公开 | 每周一准时更新，表彰优秀，激励前行
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10 -mt-8 relative z-20">
        {message === 'Not published yet' ? (
          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-16 text-center border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">本周考评结果尚未公示</h3>
            <p className="text-slate-500">管理员正在进行最后的分数核对，请耐心等待。</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-100">
              <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <h2 className="text-lg font-bold text-slate-900">综合排行榜</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">排名</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">部门</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">综合总分</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">考评等级</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {ranking.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(i)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{row.emp_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600">{row.total_score}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getLevelBadge(row.level)}
                        </td>
                      </tr>
                    ))}
                    {ranking.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-100">
              <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center">
                <Building2 className="w-5 h-5 text-blue-600 mr-3" />
                <h2 className="text-lg font-bold text-slate-900">部门平均分排行</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">排名</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">部门名称</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">部门平均分</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">部门等级</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {deptRanking.map((row, i) => {
                      const avg = row.avg_score;
                      let level = '不合格';
                      if (avg >= 225) level = '优秀';
                      else if (avg >= 200) level = '良好';
                      else if (avg >= 175) level = '及格';
                      else if (avg >= 150) level = '待改进';
                      
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center w-8">
                              {getRankIcon(i)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{row.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600">{avg.toFixed(1)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getLevelBadge(level)}
                          </td>
                        </tr>
                      );
                    })}
                    {deptRanking.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-sm font-medium text-slate-600">查看历史周次：</span>
            <select 
              className="bg-transparent border-none text-slate-900 font-bold focus:ring-0 cursor-pointer"
              value={`${selectedYear}-${selectedWeek}`}
              onChange={(e) => {
                const [y, w] = e.target.value.split('-');
                setSelectedYear(parseInt(y));
                setSelectedWeek(parseInt(w));
              }}
            >
              <option value={`${currentYear}-${currentWeek}`}>本周 ({currentYear}年第{currentWeek}周)</option>
              {history.map((h, i) => (
                <option key={i} value={`${h.year}-${h.week}`}>
                  {h.year}年第{h.week}周
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-2xl leading-relaxed">
            本考评严格遵循《员工周度综合考评规则 V1.2》，评分基于考勤、企业微信沟通及周报表现，最终解释权归公司管理方。
          </p>
        </div>
      </footer>
    </div>
  );
}
