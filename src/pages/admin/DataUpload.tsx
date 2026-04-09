import { useState } from 'react';
import { Upload as UploadIcon, CheckCircle, AlertCircle } from 'lucide-react';
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
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">考勤数据上传</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors relative">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload('attendance', e.target.files[0]);
            }}
          />
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">点击或拖拽文件到此处上传</p>
          <p className="text-xs text-gray-500">支持企业微信导出Excel格式</p>
        </div>
        {attStatus === 'success' && (
          <div className="mt-4">
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" /> 考勤数据上传成功
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">考勤日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">打卡时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attPreview.map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.emp_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">企业微信会话数据上传</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors relative">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUpload('chat', e.target.files[0]);
            }}
          />
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">点击或拖拽文件到此处上传</p>
          <p className="text-xs text-gray-500">支持企业微信导出Excel格式</p>
        </div>
        {chatStatus === 'success' && (
          <div className="mt-4">
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" /> 会话数据上传成功
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均首次回复时长</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收发消息总数</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chatPreview.map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.emp_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.avg_reply_time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.total_msg_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          disabled={attStatus !== 'success' || chatStatus !== 'success'}
          onClick={() => navigate('/admin/calculate')}
          className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#165DFF] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          确认所有数据上传完成
        </button>
      </div>
    </div>
  );
}
