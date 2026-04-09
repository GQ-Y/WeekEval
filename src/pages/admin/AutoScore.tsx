import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { fetchApi, getWeekYear } from '../../lib/utils';
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">考勤数据状态</h3>
            <p className="text-sm text-gray-500 mt-1">{attUploaded ? '已上传' : '未上传'}</p>
          </div>
          {attUploaded ? <CheckCircle className="w-8 h-8 text-green-500" /> : <AlertCircle className="w-8 h-8 text-gray-400" />}
        </div>
        <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">会话数据状态</h3>
            <p className="text-sm text-gray-500 mt-1">{chatUploaded ? '已上传' : '未上传'}</p>
          </div>
          {chatUploaded ? <CheckCircle className="w-8 h-8 text-green-500" /> : <AlertCircle className="w-8 h-8 text-gray-400" />}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-12 text-center">
        <button
          disabled={!attUploaded || !chatUploaded || calculating}
          onClick={handleCalculate}
          className="px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-[#165DFF] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {calculating ? '正在计算本周评分，请稍候...' : '一键计算本周考评分数'}
        </button>
        
        {!attUploaded || !chatUploaded ? (
          <p className="mt-4 text-sm text-red-500">请先上传考勤数据和会话数据</p>
        ) : null}

        {calcResult === 'success' && (
          <div className="mt-8 p-4 bg-green-50 rounded-md">
            <div className="flex items-center justify-center text-green-800 mb-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              本周自动评分计算完成，可前往周度考评总表查看，或前往周报评分管理录入周报分数
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => navigate('/admin/evaluation')} className="px-4 py-2 border border-[#165DFF] text-[#165DFF] rounded-md hover:bg-blue-50">
                前往周度考评总表
              </button>
              <button onClick={() => navigate('/admin/report')} className="px-4 py-2 bg-[#165DFF] text-white rounded-md hover:bg-blue-700">
                前往周报评分管理
              </button>
            </div>
          </div>
        )}

        {calcResult === 'error' && (
          <div className="mt-8 p-4 bg-red-50 rounded-md text-red-800 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            评分计算失败，请重新上传数据后重试
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500">
        评分计算严格遵循《员工周度综合考评规则 V1.2》，自动计算考勤得分和企业微信沟通得分，周报得分需手动录入。
      </p>
    </div>
  );
}
