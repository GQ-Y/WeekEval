import { useState } from 'react';
import { Upload as UploadIcon, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { fetchApi, getWeekYear } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function DataUpload() {
  const { week, year } = getWeekYear();
  const [attPreview, setAttPreview] = useState<any[]>([]);
  const [chatPreview, setChatPreview] = useState<any[]>([]);
  const [attStatus, setAttStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [chatStatus, setChatStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  const handleUpload = async (type: 'attendance' | 'chat', file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('week', week.toString());
    formData.append('year', year.toString());

    const setStatus = type === 'attendance' ? setAttStatus : setChatStatus;
    const setPreview = type === 'attendance' ? setAttPreview : setChatPreview;

    setStatus('uploading');
    try {
      const res = await fetchApi(`/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      });
      if (res.success) {
        setStatus('success');
        setPreview(res.preview);
      } else {
        setStatus('error');
        alert(res.message);
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">数据上传</h2>
        <p className="text-sm text-slate-500">请上传企业微信导出的标准Excel报表</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Upload */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">考勤数据</h3>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all relative group flex-1 flex flex-col justify-center">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload('attendance', e.target.files[0]);
              }}
            />
            <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-900">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-slate-500 mt-1">支持 .xlsx, .xls 格式</p>
          </div>

          {attStatus === 'success' && (
            <div className="mt-6">
              <div className="flex items-center text-emerald-600 mb-3 text-sm font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" /> 考勤数据解析成功 (预览前10条)
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">姓名</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">部门</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">考勤日期</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {attPreview.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{row.emp_name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row.department}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Chat Upload */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">会话统计数据</h3>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all relative group flex-1 flex flex-col justify-center">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload('chat', e.target.files[0]);
              }}
            />
            <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-900">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-slate-500 mt-1">支持 .xlsx, .xls 格式</p>
          </div>

          {chatStatus === 'success' && (
            <div className="mt-6">
              <div className="flex items-center text-emerald-600 mb-3 text-sm font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" /> 会话数据解析成功 (预览前10条)
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">姓名</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">部门</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">消息总数</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {chatPreview.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{row.emp_name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row.department}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row.total_msg_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-6 border-t border-slate-200">
        <button
          disabled={attStatus !== 'success' || chatStatus !== 'success'}
          onClick={() => navigate('/admin/calculate')}
          className="px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          确认所有数据上传完成，进入下一步
        </button>
      </div>
    </div>
  );
}
