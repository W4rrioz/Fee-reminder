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
    { id: 'fees', label: 'Fees', icon: CreditCard },
    ...(attendanceEnabled ? [{ id: 'attendance', label: 'Attendance', icon: CalendarCheck }] : []),
    { id: 'students', label: 'Students', icon: Users },
    { id: 'defaulters', label: 'Defaulters', icon: AlertCircle, badge: overdueCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const gridColsClass = attendanceEnabled ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 max-w-lg mx-auto shadow-xs">
      <div className={`grid ${gridColsClass} h-14`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 transition-colors ${
                isActive
                  ? 'text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'stroke-[2.2px]' : 'stroke-[1.8px]'} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-3.5 min-w-[14px] px-0.5 flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full px-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-700" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
