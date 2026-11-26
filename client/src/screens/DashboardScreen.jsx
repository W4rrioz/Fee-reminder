import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Send,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  WifiOff,
  PieChart as PieChartIcon,
  Clock,
  CheckCircle,
  QrCode,
  Users,
  Sparkles,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { SendReminderModal } from '../components/SendReminderModal';
import { PieChart } from '../components/PieChart';
import GlassWorkspace from '@/components/ui/adjustable-glass-dashboard';

export const DashboardScreen = () => {
  const {
    institute,
    user,
    terms,
    feeDues,
    students,
    classesBatches,
    attendance,
    setActiveTab,
    recordPayment,
    isOnline,
    setIsOnline,
    attendanceEnabled
  } = useApp();

  const [selectedDue, setSelectedDue] = useState(null);
  const [reminderModalData, setReminderModalData] = useState(null);
  const [showDetailedCharts, setShowDetailedCharts] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('fees'); // 'fees' | 'unpaidMonths' | 'batches' | 'attendance'
  const [unpaidMonthFilter, setUnpaidMonthFilter] = useState('all');

  const isAttendanceEnabled = attendanceEnabled !== undefined ? attendanceEnabled : (institute.enable_attendance !== false);
  const currentChartTab = (!isAttendanceEnabled && activeChartTab === 'attendance') ? 'fees' : activeChartTab;

  // 1. Calculate Fees (Collected vs Due vs Overdue)
  const currentMonthDues = feeDues.filter(
    (d) => d.month === 'October 2026' || d.due_date?.startsWith('2026-10')
  );

  const totalCollectedThisMonth = currentMonthDues
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0) || 48200;

  const totalPendingThisMonth = currentMonthDues
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + Number(d.amount), 0) || 16500;

  const totalOverdueThisMonth = currentMonthDues
    .filter((d) => d.status === 'overdue')
    .reduce((sum, d) => sum + Number(d.amount), 0) || 8400;

  // Overall overdue dues across all months
  const overdueDues = feeDues.filter((d) => d.status === 'overdue');
  const defaulterStudentIds = new Set(overdueDues.map((d) => d.student_id));
  const defaulterCount = defaulterStudentIds.size || 6;
  const totalOverdueAmount = overdueDues.reduce((sum, d) => sum + Number(d.amount), 0) || 14200;

  // Total Expected Pool
  const totalPool = totalCollectedThisMonth + totalPendingThisMonth + totalOverdueThisMonth;

  // Helper lookups
  const getStudent = (studentId) => students.find((s) => s.id === studentId);
  const getBatch = (batchId) => classesBatches.find((b) => b.id === batchId);

  // 2. Format Real Transactions for GlassWorkspace
  const workspaceTransactions = useMemo(() => {
    if (feeDues.length === 0) {
      return [
        {
          id: '1',
          name: 'Aarav Sharma · Class 10 Batch A',
          category: 'Tuition Fee (UPI Direct)',
          date: 'Today',
          amount: 1500,
          status: 'Completed',
        },
        {
          id: '2',
          name: 'Pooja Nair · Class 12 PCM',
          category: 'Tuition Fee (UPI Direct)',
          date: 'Today',
          amount: 2200,
          status: 'Completed',
        },
        {
          id: '3',
          name: 'Rohit Deshmukh · Class 9 Batch B',
          category: 'Overdue Dues',
          date: 'Overdue',
          amount: -1200,
          status: 'Pending',
        },
        {
          id: '4',
          name: 'Neha Singhania · Class 11 Comm',
          category: 'Advance Tuition',
          date: 'Yesterday',
          amount: 1800,
          status: 'Completed',
        },
        {
          id: '5',
          name: 'Vikram Seth · Class 10 Batch B',
          category: 'Pending Due',
          date: 'Due Oct 10',
          amount: -1500,
          status: 'Pending',
        },
      ];
    }

    return feeDues.slice(0, 10).map((due, idx) => {
      const student = getStudent(due.student_id);
      const batch = student ? getBatch(student.class_batch_id) : null;
      const isPaid = due.status === 'paid';
      const studentLabel = student
        ? `${student.name} · ${batch ? batch.name : 'General'}`
        : `Student #${due.student_id}`;

      return {
        id: due.id || String(idx),
        name: studentLabel,
        category: isPaid ? (due.fee_head || 'Tuition Fee (UPI)') : 'Overdue Tuition',
        date: isPaid ? (due.paid_date || 'Oct 2026') : (due.month || 'Pending'),
        amount: isPaid ? Number(due.amount) : -Number(due.amount),
        status: isPaid ? 'Completed' : 'Pending',
      };
    });
  }, [feeDues, students, classesBatches]);

  // 3. Format Real Goals / Institutional Targets
  const workspaceGoals = useMemo(() => {
    return [
      {
        id: 'target_monthly',
        name: 'October Fee Collection Target',
        saved: totalCollectedThisMonth,
        target: totalPool > 0 ? totalPool : 75000,
        color: '#274b39',
      },
      {
        id: 'infra_reserve',
        name: 'Digital Classroom & Smart Board Fund',
        saved: 62000,
        target: 100000,
        color: '#a82d24',
      },
    ];
  }, [totalCollectedThisMonth, totalPool]);

  // 4. Format Cash Flow Periods (Daily and Monthly Collections)
  const workspaceCashFlow = useMemo(() => {
    return [
      {
        id: 'month',
        label: 'Month',
        description: 'Daily collection flow for October 2026 across all batches.',
        points: [
          { label: 'Oct 01', income: 4500, expenses: 800 },
          { label: 'Oct 03', income: 6200, expenses: 1200 },
          { label: 'Oct 05', income: 7800, expenses: 950 },
          { label: 'Oct 07', income: 9400, expenses: 1400 },
          { label: 'Oct 10', income: 11200, expenses: 1100 },
          { label: 'Oct 14', income: 8600, expenses: 1300 },
          { label: 'Oct 18', income: 12400, expenses: 1500 },
          { label: 'Oct 22', income: 10800, expenses: 1200 },
          { label: 'Oct 26', income: 9600, expenses: 1100 },
          { label: 'Oct 30', income: 14200, expenses: 1800 },
        ],
      },
      {
        id: 'week',
        label: 'Week',
        description: 'Daily collection breakdown for the current week.',
        points: [
          { label: 'Mon', income: 3800, expenses: 600 },
          { label: 'Tue', income: 5400, expenses: 900 },
          { label: 'Wed', income: 4200, expenses: 450 },
          { label: 'Thu', income: 6800, expenses: 1100 },
          { label: 'Fri', income: 5900, expenses: 750 },
          { label: 'Sat', income: 2400, expenses: 400 },
          { label: 'Sun', income: 1800, expenses: 300 },
        ],
      },
      {
        id: 'year',
        label: 'Year',
        description: 'Monthly tuition collected across 2026.',
        points: [
          { label: 'Jan', income: 42000, expenses: 8500 },
          { label: 'Feb', income: 46000, expenses: 9200 },
          { label: 'Mar', income: 38000, expenses: 7800 },
          { label: 'Apr', income: 52000, expenses: 11000 },
          { label: 'May', income: 48000, expenses: 9500 },
          { label: 'Jun', income: 56000, expenses: 12400 },
          { label: 'Jul', income: 59000, expenses: 11800 },
          { label: 'Aug', income: 64000, expenses: 13500 },
          { label: 'Sep', income: 61000, expenses: 12000 },
          { label: 'Oct', income: totalCollectedThisMonth, expenses: 14000 },
          { label: 'Nov', income: 58000, expenses: 11500 },
          { label: 'Dec', income: 67000, expenses: 14200 },
        ],
      },
    ];
  }, [totalCollectedThisMonth]);

  // Attendance metrics
  const todayStr = '2026-10-07';
  let totalMarkedToday = 0;
  let presentCountToday = 0;
  let absentCountToday = 0;

  Object.entries(attendance).forEach(([key, records]) => {
    if (key.startsWith(todayStr)) {
      Object.values(records).forEach((status) => {
        totalMarkedToday++;
        if (status === 'present') presentCountToday++;
        else if (status === 'absent') absentCountToday++;
      });
    }
  });

  const attendanceRateToday =
    totalMarkedToday > 0
      ? Math.round((presentCountToday / totalMarkedToday) * 100)
      : 92;

  // Chart Data: Fee Collection Status
  const feeStatusChartData = [
    {
      label: 'Collected (UPI)',
      value: totalCollectedThisMonth,
      color: '#10B981',
      formattedValue: `₹${totalCollectedThisMonth.toLocaleString('en-IN')}`,
    },
    {
      label: 'Pending',
      value: totalPendingThisMonth,
      color: '#3B82F6',
      formattedValue: `₹${totalPendingThisMonth.toLocaleString('en-IN')}`,
    },
    {
      label: 'Overdue Defaulters',
      value: totalOverdueThisMonth,
      color: '#EF4444',
      formattedValue: `₹${totalOverdueThisMonth.toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div className="w-full space-y-4 pb-12 font-body">
      
      {/* =========================================================
          1. INSTITUTE QUICK ACTION TOOLBAR
      ========================================================= */}
      <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Institute Quick Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#A82D24] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                {institute?.name || 'Apex Coaching Academy'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                UPI Direct 0%
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono">
              {institute?.upi_id || 'apexacademy@upi'}
            </p>
          </div>
        </div>

        {/* Right: Operational Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Collect Fee via UPI QR button */}
          <button
            type="button"
            onClick={() => {
              const pendingDue = feeDues.find((d) => d.status !== 'paid') || {
                id: 'custom_fee',
                amount: 1500,
                student_id: students[0]?.id || '1',
                month: 'October 2026',
                fee_head: 'Tuition Fee'
              };
              setSelectedDue(pendingDue);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#A82D24] hover:bg-[#8B261E] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <QrCode size={13} />
            <span>Collect Fee (UPI QR)</span>
          </button>

          {/* Defaulters Shortcut */}
          <button
            type="button"
            onClick={() => setActiveTab('defaulters')}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 text-[#8B261E] dark:text-red-300 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <AlertCircle size={13} />
            <span>Defaulters ({overdueDues.length || defaulterCount})</span>
          </button>

          {/* Mark Attendance Shortcut */}
          {isAttendanceEnabled && (
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
            >
              <CalendarCheck size={13} className="text-emerald-600" />
              <span>Attendance ({attendanceRateToday}%)</span>
            </button>
          )}

          {/* Toggle Analytics breakdown */}
          <button
            type="button"
            onClick={() => setShowDetailedCharts(!showDetailedCharts)}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              showDetailedCharts
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent'
                : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <PieChartIcon size={13} />
            <span>{showDetailedCharts ? 'Hide Charts' : 'Pie Charts'}</span>
          </button>

        </div>
      </div>

      {/* =========================================================
          2. DETAILED PIE CHART ANALYTICS (When toggled)
      ========================================================= */}
      {showDetailedCharts && (
        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-stone-100 dark:border-stone-800 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Collection & Recovery Health
              </h3>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Fee Status Distribution (October 2026)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetailedCharts(false)}
              className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center py-2">
              <PieChart data={feeStatusChartData} size={200} />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Collected Dues (0% Commission)</div>
                  <div className="text-base font-black text-emerald-900 dark:text-emerald-200">
                    ₹{totalCollectedThisMonth.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {Math.round((totalCollectedThisMonth / (totalPool || 1)) * 100)}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">Pending (Due in Current Cycle)</div>
                  <div className="text-base font-black text-blue-900 dark:text-blue-200">
                    ₹{totalPendingThisMonth.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700">
                  {Math.round((totalPendingThisMonth / (totalPool || 1)) * 100)}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-red-800 dark:text-red-300">Overdue Defaulters</div>
                  <div className="text-base font-black text-red-900 dark:text-red-200">
                    ₹{totalOverdueThisMonth.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('defaulters')}
                  className="text-xs font-bold text-[#A82D24] underline cursor-pointer"
                >
                  Send 1-Tap Reminders →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          3. MAIN ADMIN GLASS WORKSPACE (21st.dev Component UI)
      ========================================================= */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden bg-stone-900/40 min-h-[720px]">
        <GlassWorkspace
          brand={institute?.name || 'Apex Coaching Academy'}
          userName={user?.name || 'Director'}
          balance={totalCollectedThisMonth}
          balanceChange={{ percent: 14.6, label: 'vs previous fee cycle' }}
          account={{
            name: institute?.upi_name || 'Direct UPI Account',
            lastFour: '4829',
          }}
          periodLabel="Current Fee Cycle (October 2026)"
          cashFlowPeriods={workspaceCashFlow}
          initialPeriodId="month"
          currency="INR"
          footerNote="100% Direct Bank Settlement • 0% Middleman Deduction"
          savingsNote={`₹${Math.round(totalCollectedThisMonth * 0.0236).toLocaleString('en-IN')} saved in gateway commission with Direct UPI.`}
          transactions={workspaceTransactions}
          goals={workspaceGoals}
          backgroundImage="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80"
        />
      </div>

      {/* Payment Modal */}
      {selectedDue && (
        <PaymentModal
          due={selectedDue}
          student={getStudent(selectedDue.student_id)}
          onClose={() => setSelectedDue(null)}
          onPaymentSuccess={() => {
            setSelectedDue(null);
          }}
        />
      )}

      {/* Send WhatsApp Reminder Modal */}
      {reminderModalData && (
        <SendReminderModal
          data={reminderModalData}
          onClose={() => setReminderModalData(null)}
        />
      )}

    </div>
  );
};
