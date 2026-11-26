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
  CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { SendReminderModal } from '../components/SendReminderModal';
import { PieChart } from '../components/PieChart';

export const DashboardScreen = () => {
  const {
    institute,
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
  const [activeChartTab, setActiveChartTab] = useState('fees'); // 'fees' | 'unpaidMonths' | 'batches' | 'attendance'
  const [unpaidMonthFilter, setUnpaidMonthFilter] = useState('all'); // 'all' | '1' | '2' | '3+'

  const isAttendanceEnabled = attendanceEnabled !== undefined ? attendanceEnabled : (institute.enable_attendance !== false);
  const currentChartTab = (!isAttendanceEnabled && activeChartTab === 'attendance') ? 'fees' : activeChartTab;

  // 1. Calculate Fees (Collected vs Due vs Overdue)
  const currentMonthDues = feeDues.filter(
    (d) => d.month === 'October 2026' || d.due_date?.startsWith('2026-10')
  );

  const totalCollectedThisMonth = currentMonthDues
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalPendingThisMonth = currentMonthDues
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalOverdueThisMonth = currentMonthDues
    .filter((d) => d.status === 'overdue')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  // Overall overdue dues across all months
  const overdueDues = feeDues.filter((d) => d.status === 'overdue');
  const defaulterStudentIds = new Set(overdueDues.map((d) => d.student_id));
  const defaulterCount = defaulterStudentIds.size;
  const totalOverdueAmount = overdueDues.reduce((sum, d) => sum + Number(d.amount), 0);

  // 2. Attendance Status Breakdown
  const todayStr = '2026-10-07';
  let totalMarkedToday = 0;
  let presentCountToday = 0;
  let absentCountToday = 0;
  let lateCountToday = 0;

  Object.entries(attendance).forEach(([key, records]) => {
    if (key.startsWith(todayStr)) {
      Object.values(records).forEach((status) => {
        totalMarkedToday++;
        if (status === 'present') presentCountToday++;
        else if (status === 'absent') absentCountToday++;
        else if (status === 'late') lateCountToday++;
      });
    }
  });

  const attendanceRateToday =
    totalMarkedToday > 0
      ? Math.round((presentCountToday / totalMarkedToday) * 100)
      : 92; // fallback

  // Helper to find student & batch
  const getStudent = (studentId) => students.find((s) => s.id === studentId);
  const getBatch = (batchId) => classesBatches.find((b) => b.id === batchId);

  // 3. Multi-Month Unpaid Records calculation per student
  const studentsUnpaidRecords = useMemo(() => {
    return students.map((std) => {
      // Find all unpaid (pending or overdue) dues
      const stdUnpaidDues = feeDues.filter(
        (d) => d.student_id === std.id && (d.status === 'overdue' || d.status === 'pending')
      );
      const overdueOnlyDues = feeDues.filter(
        (d) => d.student_id === std.id && d.status === 'overdue'
      );
      const totalPendingAmount = stdUnpaidDues.reduce((sum, d) => sum + Number(d.amount), 0);
      const unpaidMonths = [...new Set(stdUnpaidDues.map((d) => d.month || 'Current Month'))];
      const overdueMonths = [...new Set(overdueOnlyDues.map((d) => d.month || 'Current Month'))];

      return {
        student: std,
        unpaidCount: unpaidMonths.length,
        unpaidMonths,
        overdueMonths,
        dues: stdUnpaidDues,
        totalAmount: totalPendingAmount
      };
    });
  }, [students, feeDues]);

  // Distribution bins: 0, 1, 2, 3+
  const unpaidBins = useMemo(() => {
    let zero = 0;
    let one = 0;
    let two = 0;
    let threePlus = 0;

    studentsUnpaidRecords.forEach((item) => {
      if (item.unpaidCount === 0) zero++;
      else if (item.unpaidCount === 1) one++;
      else if (item.unpaidCount === 2) two++;
      else threePlus++;
    });

    return { zero, one, two, threePlus };
  }, [studentsUnpaidRecords]);

  // Chart Data 1: Fee Collection Status
  const feeStatusChartData = [
    {
      label: 'Collected',
      value: totalCollectedThisMonth,
      color: '#10B981', // Emerald
      formattedValue: `₹${totalCollectedThisMonth.toLocaleString('en-IN')}`
    },
    {
      label: 'Pending',
      value: totalPendingThisMonth,
      color: '#3B82F6', // Blue
      formattedValue: `₹${totalPendingThisMonth.toLocaleString('en-IN')}`
    },
    {
      label: 'Overdue',
      value: totalOverdueThisMonth,
      color: '#EF4444', // Red
      formattedValue: `₹${totalOverdueThisMonth.toLocaleString('en-IN')}`
    }
  ];

  // Chart Data 2: Unpaid Months Distribution
  const unpaidMonthsChartData = [
    {
      label: 'Cleared (0 Mo)',
      value: unpaidBins.zero,
      color: '#10B981',
      formattedValue: `${unpaidBins.zero} students`
    },
    {
      label: '1 Month Due',
      value: unpaidBins.one,
      color: '#F59E0B',
      formattedValue: `${unpaidBins.one} students`
    },
    {
      label: '2 Months Due',
      value: unpaidBins.two,
      color: '#F97316',
      formattedValue: `${unpaidBins.two} students`
    },
    {
      label: '3+ Months Due',
      value: unpaidBins.threePlus,
      color: '#EF4444',
      formattedValue: `${unpaidBins.threePlus} students`
    }
  ];

  // Chart Data 3: Batch-wise Fee Pending Breakdown
  const batchFeeChartData = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const batchLookup = new Map(classesBatches.map((b) => [b.id, b]));
    const batchMap = {};
    feeDues.forEach((due) => {
      if (due.status === 'pending' || due.status === 'overdue') {
        const student = studentMap.get(due.student_id);
        const batchId = student?.class_batch_id || 'unassigned';
        const batch = batchLookup.get(batchId);
        const batchName = batch ? batch.name.replace(/^Batch\s*/i, '') : 'Other';
        batchMap[batchName] = (batchMap[batchName] || 0) + Number(due.amount);
      }
    });

    const colors = ['#6366F1', '#EC4899', '#06B6D4', '#F59E0B', '#10B981', '#8B5CF6'];
    return Object.entries(batchMap).map(([name, amount], idx) => ({
      label: name,
      value: amount,
      color: colors[idx % colors.length],
      formattedValue: `₹${amount.toLocaleString('en-IN')}`
    }));
  }, [feeDues, students, classesBatches]);

  // Chart Data 4: Attendance Status (if enabled)
  const attendanceChartData = [
    {
      label: 'Present',
      value: presentCountToday,
      color: '#10B981',
      formattedValue: `${presentCountToday} students`
    },
    {
      label: 'Late',
      value: lateCountToday,
      color: '#F59E0B',
      formattedValue: `${lateCountToday} students`
    },
    {
      label: 'Absent',
      value: absentCountToday,
      color: '#EF4444',
      formattedValue: `${absentCountToday} students`
    }
  ];

  // Quick 1-click WhatsApp single due with instant UPI QR photo
  const handleQuickWhatsApp = (due) => {
    const student = getStudent(due.student_id);
    if (!student) return;

    setReminderModalData({
      due,
      student,
      unpaidMonths: [due.month || 'Current Month'],
      totalAmount: Number(due.amount)
    });
  };

  // Cumulative WhatsApp reminder for all unpaid months with instant UPI QR photo
  const handleCumulativeWhatsApp = (record) => {
    const { student, unpaidMonths, totalAmount, dues } = record;
    setReminderModalData({
      due: dues && dues[0] ? dues[0] : null,
      student,
      unpaidMonths,
      totalAmount
    });
  };

  // Filtered list for the Unpaid Months breakdown card
  const filteredUnpaidStudents = useMemo(() => {
    return studentsUnpaidRecords.filter((item) => {
      if (item.unpaidCount === 0) return false;
      if (unpaidMonthFilter === 'all') return true;
      if (unpaidMonthFilter === '1') return item.unpaidCount === 1;
      if (unpaidMonthFilter === '2') return item.unpaidCount === 2;
      if (unpaidMonthFilter === '3+') return item.unpaidCount >= 3;
      return true;
    });
  }, [studentsUnpaidRecords, unpaidMonthFilter]);

  return (
    <div className="space-y-4 pb-16">
      {/* Institute Badge & Offline toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3730A3] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {institute.type === 'school'
              ? 'School Campus'
              : institute.type === 'tutor'
              ? 'Private Tutor'
              : 'Coaching Center'}
          </span>
          <h2 className="text-lg font-bold text-stone-900 mt-1 leading-tight">
            {institute.name}
          </h2>
        </div>

        {/* Quick Offline toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
            isOnline
              ? 'bg-white border-stone-200 text-stone-700'
              : 'bg-amber-100 border-amber-300 text-amber-900'
          }`}
          title="Toggle online/offline to test spotty 2G network"
        >
          {isOnline ? (
            <span className="inline-block w-2 h-2 rounded-full bg-[#15803D]"></span>
          ) : (
            <WifiOff size={13} className="text-amber-700" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </button>
      </div>

      {/* 3 BIG NUMBERS - Ledger Calm */}
      <div className={`grid ${isAttendanceEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5`}>
        {/* Card 1: Collected vs Due */}
        <div 
          onClick={() => setActiveTab('fees')}
          className="bg-white border border-stone-200 rounded-lg p-3.5 flex flex-col justify-between cursor-pointer active:scale-98 transition-transform border-l-4 border-l-[#15803D]"
        >
          <div className="text-xs font-semibold text-stone-500 flex items-center justify-between">
            <span>Collected</span>
            <TrendingUp size={14} className="text-[#15803D]" />
          </div>
          <div className="my-1.5">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 tabular-nums leading-tight">
              ₹{(totalCollectedThisMonth / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-stone-500 font-medium truncate tabular-nums">
              Due: ₹{((totalPendingThisMonth + totalOverdueThisMonth) / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="text-xs text-[#3730A3] font-semibold flex items-center gap-0.5">
            <span>View dues</span>
            <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 2: Attendance Rate Today (conditionally rendered) */}
        {isAttendanceEnabled && (
          <div 
            onClick={() => setActiveTab('attendance')}
            className="bg-white border border-stone-200 rounded-lg p-3.5 flex flex-col justify-between cursor-pointer active:scale-98 transition-transform border-l-4 border-l-[#3730A3]"
          >
            <div className="text-xs font-semibold text-stone-500 flex items-center justify-between">
              <span>Attendance</span>
              <CheckCircle2 size={14} className="text-[#15803D]" />
            </div>
            <div className="my-1.5">
              <div className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight leading-tight tabular-nums">
                {attendanceRateToday}%
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                Today's Rate
              </div>
            </div>
            <div className="text-xs text-[#3730A3] font-semibold flex items-center gap-0.5">
              <span>Mark roll</span>
              <ChevronRight size={12} />
            </div>
          </div>
        )}

        {/* Card 3: Defaulter Count */}
        <div 
          onClick={() => setActiveTab('defaulters')}
          className="bg-white border border-stone-200 rounded-lg p-3.5 flex flex-col justify-between cursor-pointer active:scale-98 transition-transform border-l-4 border-l-[#DC2626]"
        >
          <div className="text-xs font-semibold text-[#DC2626] flex items-center justify-between">
            <span>Defaulters</span>
            <AlertCircle size={14} className="text-[#DC2626]" />
          </div>
          <div className="my-1.5">
            <div className="text-lg sm:text-xl font-bold text-[#DC2626] tracking-tight leading-tight tabular-nums">
              {defaulterCount}
            </div>
            <div className="text-[11px] text-stone-500 font-medium truncate tabular-nums">
              ₹{(totalOverdueAmount / 1000).toFixed(1)}k due
            </div>
          </div>
          <div className="text-xs text-[#DC2626] font-bold flex items-center gap-0.5">
            <span>Remind all</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE ANALYTICS & PIE CHARTS SECTION                    */}
      {/* ============================================================ */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-50 border border-indigo-100 text-[#3730A3] flex items-center justify-center">
              <PieChartIcon size={16} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Visual Analytics & Distribution
              </h3>
              <p className="text-[11px] text-stone-500">
                Interactive breakdowns with percentages and ₹ amounts
              </p>
            </div>
          </div>
        </div>

        {/* Chart Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-stone-100">
          <button
            onClick={() => setActiveChartTab('fees')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              currentChartTab === 'fees'
                ? 'bg-[#3730A3] text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Fee Collection
          </button>
          <button
            onClick={() => setActiveChartTab('unpaidMonths')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              currentChartTab === 'unpaidMonths'
                ? 'bg-[#3730A3] text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Unpaid Months
          </button>
          <button
            onClick={() => setActiveChartTab('batches')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              currentChartTab === 'batches'
                ? 'bg-[#3730A3] text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {terms.classesOrBatches}
          </button>
          {isAttendanceEnabled && (
            <button
              onClick={() => setActiveChartTab('attendance')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                currentChartTab === 'attendance'
                  ? 'bg-[#15803D] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Attendance
            </button>
          )}
        </div>

        {/* Selected Chart Rendering */}
        <div className="pt-3">
          {currentChartTab === 'fees' && (
            <PieChart
              data={feeStatusChartData}
              size={190}
              donut={true}
              centerLabel="This Month"
              centerValue={`₹${(totalCollectedThisMonth + totalPendingThisMonth + totalOverdueThisMonth).toLocaleString('en-IN')}`}
              title="October 2026 Fee Collection Breakdown"
              subtitle="Tap or hover slices to inspect percentages and exact collection values"
            />
          )}

          {currentChartTab === 'unpaidMonths' && (
            <PieChart
              data={unpaidMonthsChartData}
              size={190}
              donut={true}
              centerLabel="Total Students"
              centerValue={`${students.length}`}
              title="Unpaid Months Frequency Distribution"
              subtitle="Breakdown of students owing 0, 1, 2, or 3+ months of tuition"
            />
          )}

          {currentChartTab === 'batches' && (
            <PieChart
              data={batchFeeChartData}
              size={190}
              donut={true}
              centerLabel="Pending Dues"
              centerValue={`₹${batchFeeChartData.reduce((acc, c) => acc + c.value, 0).toLocaleString('en-IN')}`}
              title={`Pending Fees by ${terms.classOrBatch}`}
              subtitle="Outstanding dues distribution across classroom batches"
            />
          )}

          {currentChartTab === 'attendance' && isAttendanceEnabled && (
            <PieChart
              data={attendanceChartData}
              size={190}
              donut={true}
              centerLabel="Marked Today"
              centerValue={`${totalMarkedToday}`}
              title="Today's Attendance Status (07 Oct 2026)"
              subtitle="Present vs Absent vs Late roll-call distribution"
            />
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* UNPAID MONTHS RECORD CARD                                     */}
      {/* ============================================================ */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-50 border border-amber-100 text-[#D97706] flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Unpaid Months Record
              </h3>
              <p className="text-[11px] text-stone-500">
                Multi-month dues with 1-click cumulative WhatsApp reminder
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('defaulters')}
            className="text-xs font-semibold text-[#3730A3] hover:underline"
          >
            Defaulter Hub
          </button>
        </div>

        {/* Filter Badges: All, 1 Month Due, 2 Months Due, 3+ Months Due */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Unpaid', count: unpaidBins.one + unpaidBins.two + unpaidBins.threePlus },
            { id: '1', label: '1 Month Due', count: unpaidBins.one },
            { id: '2', label: '2 Months Due', count: unpaidBins.two },
            { id: '3+', label: '3+ Months Due', count: unpaidBins.threePlus }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setUnpaidMonthFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                unpaidMonthFilter === f.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* List of students with multi-month unpaid status */}
        <div className="space-y-2 mt-2">
          {filteredUnpaidStudents.length === 0 ? (
            <div className="py-6 text-center text-stone-500 text-xs">
              <CheckCircle size={24} className="mx-auto text-[#15803D] mb-1" />
              <span>No students matching this unpaid month filter!</span>
            </div>
          ) : (
            filteredUnpaidStudents.map((record) => {
              const { student, unpaidCount, unpaidMonths, totalAmount } = record;
              const batch = getBatch(student.class_batch_id);

              return (
                <div
                  key={student.id}
                  className="p-3 bg-white border border-stone-200 border-l-[5px] border-l-[#DC2626] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm truncate">
                        {student.name}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          unpaidCount >= 3
                            ? 'bg-rose-100 text-[#DC2626]'
                            : unpaidCount === 2
                            ? 'bg-amber-100 text-[#D97706]'
                            : 'bg-indigo-50 text-[#3730A3]'
                        }`}
                      >
                        {unpaidCount} {unpaidCount === 1 ? 'Month Unpaid' : 'Months Unpaid'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-1">
                      <span>{batch?.name || 'Class'}</span>
                      <span>•</span>
                      <span className="font-medium text-stone-700">
                        {unpaidMonths.join(', ')}
                      </span>
                    </div>

                    <div className="text-xs text-[#DC2626] font-bold mt-0.5 tabular-nums">
                      ₹{totalAmount.toLocaleString('en-IN')} pending
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCumulativeWhatsApp(record)}
                      title={`Send 1-Click WhatsApp Reminder for all ${unpaidCount} unpaid months with UPI deep link`}
                      className="w-full sm:w-auto min-h-[48px] px-3.5 bg-[#D97706] hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                    >
                      <Send size={14} />
                      <span>WhatsApp ({unpaidCount} mos)</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white border border-stone-200 rounded-lg p-3.5">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 px-0.5">
          Quick Actions
        </h3>
        <div className={`grid ${isAttendanceEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {/* Quick Action 1: Mark Attendance (if enabled) */}
          {isAttendanceEnabled && (
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors border border-stone-200 min-h-[56px]"
            >
              <CalendarCheck size={20} className="text-[#3730A3] mb-1" />
              <span className="text-xs font-semibold text-center leading-tight">
                Mark Attendance
              </span>
            </button>
          )}

          {/* Quick Action 2: Record Payment */}
          <button
            onClick={() => setActiveTab('fees')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors border border-stone-200 min-h-[56px]"
          >
            <CreditCard size={20} className="text-[#15803D] mb-1" />
            <span className="text-xs font-semibold text-center leading-tight">
              Record Fee
            </span>
          </button>

          {/* Quick Action 3: Send Reminder */}
          <button
            onClick={() => setActiveTab('defaulters')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors border border-stone-200 min-h-[56px]"
          >
            <Send size={20} className="text-[#D97706] mb-1" />
            <span className="text-xs font-semibold text-center leading-tight">
              Send Reminders
            </span>
          </button>
        </div>
      </div>

      {/* URGENT PENDING FEES / REMINDERS LIST */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            <h3 className="font-bold text-stone-900 text-sm">
              Urgent Fee Defaulters ({overdueDues.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('defaulters')}
            className="text-xs font-semibold text-[#3730A3] hover:underline"
          >
            See All
          </button>
        </div>

        <div className="space-y-2.5">
          {overdueDues.slice(0, 3).map((due) => {
            const student = getStudent(due.student_id);
            if (!student) return null;
            return (
              <div
                key={due.id}
                className="p-3 bg-white border border-stone-200 border-l-[5px] border-l-[#DC2626] rounded-lg flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-sm truncate">
                      {student.name}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-[#DC2626] font-bold px-1.5 py-0.5 rounded">
                      Overdue
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <span>{due.month}</span>
                    <span>•</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      ₹{Number(due.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* WhatsApp Reminder Button (Min 48px touch target) */}
                  <button
                    onClick={() => handleQuickWhatsApp(due)}
                    title="Send WhatsApp Reminder with UPI Deep Link"
                    className="min-h-[48px] min-w-[48px] p-3 bg-[#D97706] hover:bg-amber-700 text-white rounded-lg flex items-center justify-center active:scale-98 transition-transform"
                  >
                    <Send size={16} />
                  </button>

                  {/* Record Payment Button */}
                  <button
                    onClick={() => setSelectedDue(due)}
                    title="Record Payment / Show QR"
                    className="min-h-[48px] px-3.5 bg-[#3730A3] hover:bg-indigo-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-98 transition-transform"
                  >
                    <span>Pay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment / QR Modal */}
      {selectedDue && (
        <PaymentModal
          due={selectedDue}
          student={getStudent(selectedDue.student_id)}
          institute={institute}
          onClose={() => setSelectedDue(null)}
          onRecordPayment={recordPayment}
        />
      )}

      {/* Send WhatsApp Reminder with Exact Amount QR Photo Modal */}
      {reminderModalData && (
        <SendReminderModal
          isOpen={Boolean(reminderModalData)}
          due={reminderModalData.due}
          student={reminderModalData.student}
          institute={institute}
          unpaidMonths={reminderModalData.unpaidMonths}
          totalAmount={reminderModalData.totalAmount}
          onClose={() => setReminderModalData(null)}
        />
      )}
    </div>
  );
};

export default DashboardScreen;
