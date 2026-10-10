import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Users,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavigation = () => {
  const { activeTab, setActiveTab, feeDues, attendanceEnabled } = useApp();

  const overdueCount = feeDues.filter((d) => d.status === 'overdue').length;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    ...(attendanceEnabled ? [{ id: 'attendance', label: 'Attendance', icon: CalendarCheck }] : []),
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'defaulters', label: 'Defaulters', icon: AlertCircle, badge: overdueCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const gridColsClass = attendanceEnabled ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 max-w-lg mx-auto shadow-lg">
      <div className={`grid ${gridColsClass} h-16`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 transition-all ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
