import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Calculator, ArrowRight } from 'lucide-react';
import { fetchApi, getWeekYear, cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function AutoScore() {
  const { week, year } = getWeekYear();
  const [attUploaded, setAttUploaded] = useState(false);
  const [chatUploaded, setChatUploaded] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<'idle' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApi(`/api/upload/status?week=${week}&year=${year}`).then(res => {
      if (res.success) {
        setAttUploaded(res.attendanceUploaded);
        setChatUploaded(res.chatUploaded);
      }
    });
  }, [week, year]);

  const handleCalculate = async () => {
    setCalculating(true);
    setCalcResult('idle');
    try {
      const res = await fetchApi('/api/score/calculate', {
        method: 'POST',
        body: JSON.stringify({ week, year })
      });
      if (res.success) {
        setCalcResult('success');
      } else {
        setCalcResult('error');
      }
    } catch (err) {
      setCalcResult('error');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">自动评分计算</h2>
        <p className="mt-2 text-slate-500">基于《员工周度综合考评规则 V1.2》自动计算考勤与沟通得分</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={cn(
          "rounded-2xl p-6 border flex items-center justify-between transition-colors",
          attUploaded ? "bg-white border-emerald-200 shadow-sm" : "bg-slate-50 border-slate-200"
        )}>
          <div>
            <h3 className="text-base font-bold text-slate-900">考勤数据状态</h3>
            <p className={cn("text-sm mt-1 font-medium", attUploaded ? "text-emerald-600" : "text-slate-500")}>
              {attUploaded ? '已就绪' : '未上传'}
            </p>
          </div>
          {attUploaded ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <AlertCircle className="w-8 h-8 text-slate-300" />}
        </div>
        
        <div className={cn(
          "rounded-2xl p-6 border flex items-center justify-between transition-colors",
          chatUploaded ? "bg-white border-emerald-200 shadow-sm" : "bg-slate-50 border-slate-200"
        )}>
          <div>
            <h3 className="text-base font-bold text-slate-900">会话数据状态</h3>
            <p className={cn("text-sm mt-1 font-medium", chatUploaded ? "text-emerald-600" : "text-slate-500")}>
              {chatUploaded ? '已就绪' : '未上传'}
            </p>
          </div>
          {chatUploaded ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <AlertCircle className="w-8 h-8 text-slate-300" />}
        </div>
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/40 rounded-3xl p-12 text-center border border-slate-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calculator className="w-10 h-10 text-blue-600" />
        </div>
        
        <button
          disabled={!attUploaded || !chatUploaded || calculating}
          onClick={handleCalculate}
          className="px-10 py-4 border border-transparent text-lg font-bold rounded-2xl shadow-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          {calculating ? '正在高速计算中...' : '一键计算本周考评分数'}
        </button>
        
        {!attUploaded || !chatUploaded ? (
          <p className="mt-6 text-sm font-medium text-rose-500 bg-rose-50 inline-block px-4 py-2 rounded-lg">
            ⚠️ 请先完成考勤数据和会话数据的上传
          </p>
        ) : null}

        {calcResult === 'success' && (
          <div className="mt-10 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-center text-emerald-800 mb-6 font-bold text-lg">
              <CheckCircle className="w-6 h-6 mr-2 text-emerald-600" />
              本周自动评分计算已完成！
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => navigate('/admin/evaluation')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                查看考评总表
              </button>
              <button onClick={() => navigate('/admin/report')} className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center">
                去录入周报分数 <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {calcResult === 'error' && (
          <div className="mt-8 p-4 bg-rose-50 rounded-xl text-rose-800 flex items-center justify-center font-medium border border-rose-100">
            <AlertCircle className="w-5 h-5 mr-2" />
            评分计算失败，请检查数据格式后重试
          </div>
        )}
      </div>
    </div>
  );
}
