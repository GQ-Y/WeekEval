import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload, Calculator, FileText, Table, History, LogOut } from 'lucide-react';
import { cn, getWeekYear } from '../lib/utils';
import { useEffect, useState } from 'react';
import { fetchApi } from '../lib/utils';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { week, year } = getWeekYear();
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      navigate('/login');
    }
    
    fetchApi(`/api/publish/status?week=${week}&year=${year}`).then(res => {
      if (res.success) setIsPublished(res.is_published);
    });
  }, [navigate, week, year]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/login');
  };

  const navItems = [
    { name: '数据上传', path: '/admin/upload', icon: Upload },
    { name: '自动评分计算', path: '/admin/calculate', icon: Calculator },
    { name: '周报评分管理', path: '/admin/report', icon: FileText },
    { name: '周度考评总表', path: '/admin/evaluation', icon: Table },
    { name: '公示与历史', path: '/admin/publish', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">员工周度综合考评系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm">
                当前统计周次：{year}年第{week}周
              </span>
              <span className={cn("text-sm font-medium", isPublished ? "text-green-600" : "text-gray-500")}>
                {isPublished ? '已公示' : '未公示'}
              </span>
              <div className="flex items-center space-x-2 border-l pl-4">
                <span className="text-sm text-gray-700">管理员</span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex-shrink-0">
          <nav className="mt-5 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    isActive ? 'bg-blue-50 text-[#165DFF]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-[#165DFF]' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ isPublished }} />
        </main>
      </div>
    </div>
  );
}
