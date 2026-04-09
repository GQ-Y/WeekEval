import { useState, useEffect } from 'react';
import { fetchApi, getWeekYear, cn } from '../lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';

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
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-500 font-medium w-6 text-center inline-block">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#165DFF] text-white py-6 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold">{selectedYear}年第{selectedWeek}周员工周度综合考评公示</h1>
          <p className="mt-2 text-blue-100 text-sm">每周一更新</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {message === 'Not published yet' ? (
          <div className="bg-white shadow rounded-lg p-12 text-center text-gray-500">
            本周考评结果尚未公示，请耐心等待。
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">综合排行榜</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">周度综合总分</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ranking.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(i)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.emp_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#165DFF]">{row.total_score}</td>
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
                      </tr>
                    ))}
                    {ranking.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">部门平均分排行</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门平均分</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门等级</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deptRanking.map((row, i) => {
                      const avg = row.avg_score;
                      let level = '不合格';
                      if (avg >= 225) level = '优秀';
                      else if (avg >= 200) level = '良好';
                      else if (avg >= 175) level = '及格';
                      else if (avg >= 150) level = '待改进';
                      
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-center w-8">
                              {getRankIcon(i)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#165DFF]">{avg.toFixed(1)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={cn(
                              "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                              level === '优秀' ? 'bg-green-100 text-green-800' :
                              level === '良好' ? 'bg-blue-100 text-blue-800' :
                              level === '及格' ? 'bg-yellow-100 text-yellow-800' :
                              level === '待改进' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            )}>
                              {level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {deptRanking.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">查看历史周次：</span>
            <select 
              className="border-gray-300 rounded-md shadow-sm focus:ring-[#165DFF] focus:border-[#165DFF] sm:text-sm"
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
          <p className="text-xs text-gray-400 text-center max-w-2xl">
            本考评严格遵循《员工周度综合考评规则 V1.2》，评分基于考勤、企业微信沟通及周报表现，最终解释权归公司管理方。
          </p>
        </div>
      </footer>
    </div>
  );
}
