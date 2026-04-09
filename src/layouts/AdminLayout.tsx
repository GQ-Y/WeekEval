import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload, Calculator, FileText, Table, History, LogOut, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">员工周度综合考评系统</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-end justify-center">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">当前统计周次</span>
                <span className="text-slate-900 text-sm font-semibold">{year}年第{week}周</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border",
                  isPublished ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  {isPublished ? '已公示' : '未公示'}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">管</span>
                </div>
                <span className="text-sm font-medium text-slate-700">管理员</span>
                <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col shadow-xl z-0">
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300',
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">© 2026 考评系统 v1.2</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ isPublished }} />
          </div>
        </main>
      </div>
    </div>
  );
}
