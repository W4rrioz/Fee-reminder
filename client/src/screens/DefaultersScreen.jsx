import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Send,
  CreditCard,
  Filter,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  PieChart as PieChartIcon,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { PieChart } from '../components/PieChart';
import { generateWhatsAppReminder, generateCumulativeWhatsAppReminder } from '../utils/upi';

export const DefaultersScreen = () => {
  const {
    institute,
    terms,
    feeDues,
    students,
    classesBatches,
    recordPayment
  } = useApp();

  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [selectedDue, setSelectedDue] = useState(null);
  const [activeDefaulterTab, setActiveDefaulterTab] = useState('unpaidMonths'); // 'unpaidMonths' | 'allOverdue' | 'analytics'
  const [unpaidMonthFilter, setUnpaidMonthFilter] = useState('all'); // 'all' | '1' | '2' | '3+'

  const getStudent = (id) => students.find((s) => s.id === id);
  const getBatch = (id) => classesBatches.find((b) => b.id === id);

  // Filter overdue and pending dues
  const defaulterDues = feeDues.filter((d) => {
    if (d.status !== 'overdue') return false;
    const student = getStudent(d.student_id);
    if (!student) return false;
    if (selectedBatchFilter !== 'all' && student.class_batch_id !== selectedBatchFilter) {
      return false;
    }
    return true;
  });

  const totalOverdue = defaulterDues.reduce((sum, d) => sum + Number(d.amount), 0);

  // Multi-Month Unpaid Records calculation per student
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

  // Chart Data: Unpaid Months Distribution Pie Chart
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

  // Chart Data: Batch-wise Defaulter Dues
  const batchDefaultersChartData = useMemo(() => {
    const batchMap = {};
    defaulterDues.forEach((due) => {
      const student = getStudent(due.student_id);
      const batchId = student?.class_batch_id || 'unassigned';
      const batch = getBatch(batchId);
      const batchName = batch ? batch.name.replace(/^Batch\s*/i, '') : 'Other';
      batchMap[batchName] = (batchMap[batchName] || 0) + Number(due.amount);
    });

    const colors = ['#EF4444', '#F97316', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
    return Object.entries(batchMap).map(([name, amount], idx) => ({
      label: name,
      value: amount,
      color: colors[idx % colors.length],
      formattedValue: `₹${amount.toLocaleString('en-IN')}`
    }));
  }, [defaulterDues, students, classesBatches]);

  // Send single due reminder
  const handleSendReminder = (due) => {
    const student = getStudent(due.student_id);
    if (!student) return;

    const { whatsappUrl } = generateWhatsAppReminder({
      studentName: student.name,
      guardianName: student.guardian_name,
      guardianPhone: student.guardian_phone,
      month: due.month,
      amount: due.amount,
      dueDate: due.due_date,
      instituteName: institute.name,
      upiId: institute.upi_id,
      upiName: institute.upi_name,
      dueId: due.id
    });

    window.open(whatsappUrl, '_blank');
  };

  // Cumulative WhatsApp reminder for all unpaid months of a student
  const handleCumulativeWhatsApp = (record) => {
    const { student, unpaidMonths, totalAmount } = record;
    const { whatsappUrl } = generateCumulativeWhatsAppReminder({
      studentName: student.name,
      guardianName: student.guardian_name,
      guardianPhone: student.guardian_phone,
      unpaidMonths,
      totalAmount,
      instituteName: institute.name,
      upiId: institute.upi_id,
      upiName: institute.upi_name,
      studentId: student.id
    });

    window.open(whatsappUrl, '_blank');
  };

  // Filtered unpaid students list based on unpaid month badges and batch filter
  const filteredUnpaidStudents = useMemo(() => {
    return studentsUnpaidRecords.filter((item) => {
      if (item.unpaidCount === 0) return false;
      if (selectedBatchFilter !== 'all' && item.student.class_batch_id !== selectedBatchFilter) {
        return false;
      }
      if (unpaidMonthFilter === 'all') return true;
      if (unpaidMonthFilter === '1') return item.unpaidCount === 1;
      if (unpaidMonthFilter === '2') return item.unpaidCount === 2;
      if (unpaidMonthFilter === '3+') return item.unpaidCount >= 3;
      return true;
    });
  }, [studentsUnpaidRecords, unpaidMonthFilter, selectedBatchFilter]);

  return (
    <div className="space-y-4 pb-20">
      {/* Overview Banner */}
      <div className="bg-linear-to-r from-rose-600 to-rose-700 text-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
              Fee Recovery & Defaulter Center
            </span>
            <h2 className="text-xl font-black mt-0.5">
              ₹{totalOverdue.toLocaleString('en-IN')} Outstanding
            </h2>
          </div>
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <AlertTriangle size={22} className="text-white" />
          </div>
        </div>
        <p className="text-xs text-rose-100 mt-2">
          {defaulterDues.length} overdue dues across {unpaidBins.one + unpaidBins.two + unpaidBins.threePlus} students. Send pre-composed WhatsApp reminders with UPI deep-link.
        </p>
      </div>

      {/* Tab Switcher: Unpaid Months Breakdown vs All Overdue List vs Analytics */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveDefaulterTab('unpaidMonths')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
            activeDefaulterTab === 'unpaidMonths'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📅 By Unpaid Mos
        </button>
        <button
          onClick={() => setActiveDefaulterTab('allOverdue')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
            activeDefaulterTab === 'allOverdue'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📋 Individual Dues ({defaulterDues.length})
        </button>
        <button
          onClick={() => setActiveDefaulterTab('analytics')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
            activeDefaulterTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📊 Pie Charts
        </button>
      </div>

      {/* Batch Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedBatchFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedBatchFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          All {terms.classesOrBatches}
        </button>
        {classesBatches.map((cb) => (
          <button
            key={cb.id}
            onClick={() => setSelectedBatchFilter(cb.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedBatchFilter === cb.id
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            {cb.name}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: UNPAID MONTHS RECORD BREAKDOWN                        */}
      {/* ============================================================ */}
      {activeDefaulterTab === 'unpaidMonths' && (
        <div className="space-y-3">
          {/* Unpaid Month Filter Badges */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Filter by Pending Period:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Due', count: unpaidBins.one + unpaidBins.two + unpaidBins.threePlus },
                { id: '1', label: '1 Month Due', count: unpaidBins.one, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                { id: '2', label: '2 Months Due', count: unpaidBins.two, color: 'text-orange-700 bg-orange-50 border-orange-200' },
                { id: '3+', label: '3+ Months Due', count: unpaidBins.threePlus, color: 'text-rose-700 bg-rose-50 border-rose-200' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setUnpaidMonthFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                    unpaidMonthFilter === f.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : `${f.color || 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Student Unpaid Records List */}
          <div className="space-y-2.5">
            {filteredUnpaidStudents.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
                <h3 className="font-bold text-slate-900 text-base">
                  No Unpaid Records in This Filter!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Students have cleared all dues for the selected criteria.
                </p>
              </div>
            ) : (
              filteredUnpaidStudents.map((record) => {
                const { student, unpaidCount, unpaidMonths, totalAmount, dues } = record;
                const batch = getBatch(student.class_batch_id);

                return (
                  <div
                    key={student.id}
                    className="bg-white border border-rose-200/90 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {student.name}
                          </h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              unpaidCount >= 3
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : unpaidCount === 2
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {unpaidCount} {unpaidCount === 1 ? 'Month Unpaid' : 'Months Unpaid'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {batch?.name} • Parent: {student.guardian_name} ({student.guardian_phone})
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-rose-700">
                          ₹{Number(totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Total Pending
                        </div>
                      </div>
                    </div>

                    {/* Pending Months breakdown badge display */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <Clock size={13} className="text-rose-500" />
                        <span>Unpaid Months: <b>{unpaidMonths.join(', ')}</b></span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Individual fees: {dues.map(d => `${d.month}: ₹${d.amount}`).join(' • ')}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCumulativeWhatsApp(record)}
                        className="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
                      >
                        <Send size={15} />
                        <span>WhatsApp ({unpaidCount} Mos)</span>
                      </button>

                      <button
                        onClick={() => setSelectedDue(dues[0])}
                        className="min-h-[46px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
                      >
                        <CreditCard size={15} />
                        <span>Collect / QR</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: INDIVIDUAL OVERDUE DUES LIST                          */}
      {/* ============================================================ */}
      {activeDefaulterTab === 'allOverdue' && (
        <div className="space-y-2.5">
          {defaulterDues.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
              <h3 className="font-bold text-slate-900 text-base">
                Zero Overdue Defaulters!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All students have cleared their scheduled fees.
              </p>
            </div>
          ) : (
            defaulterDues.map((due) => {
              const student = getStudent(due.student_id);
              if (!student) return null;
              const batch = getBatch(student.class_batch_id);

              return (
                <div
                  key={due.id}
                  className="bg-white border border-rose-200/90 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {student.name}
                        </h4>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                          OVERDUE
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {batch?.name} • Parent: {student.guardian_name} ({student.guardian_phone})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-rose-700">
                        ₹{Number(due.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Due: {due.due_date}
                      </div>
                    </div>
                  </div>

                  {/* Pre-formatted message preview */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
                    <MessageSquare size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      "Namaste {student.guardian_name}, fee for {student.name} of ₹{due.amount} is due for {due.month}..."
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSendReminder(due)}
                      className="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
                    >
                      <Send size={15} />
                      <span>WhatsApp with UPI</span>
                    </button>

                    <button
                      onClick={() => setSelectedDue(due)}
                      className="min-h-[46px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
                    >
                      <CreditCard size={15} />
                      <span>Collect / QR</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: VISUAL PIE CHARTS ANALYTICS                           */}
      {/* ============================================================ */}
      {activeDefaulterTab === 'analytics' && (
        <div className="space-y-4">
          {/* Chart 1: Unpaid Months Frequency */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <PieChart
              data={unpaidMonthsChartData}
              size={190}
              donut={true}
              centerLabel="All Students"
              centerValue={`${students.length}`}
              title="Students by Unpaid Months Count"
              subtitle="Shows how many students are clear vs owing 1, 2, or 3+ months"
            />
          </div>

          {/* Chart 2: Defaulter Dues by Batch */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <PieChart
              data={batchDefaultersChartData}
              size={190}
              donut={true}
              centerLabel="Overdue Dues"
              centerValue={`₹${totalOverdue.toLocaleString('en-IN')}`}
              title={`Overdue Dues Breakdown by ${terms.classOrBatch}`}
              subtitle="Identify which batch or classroom has the highest unpaid amount"
            />
          </div>
        </div>
      )}

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
    </div>
  );
};

export default DefaultersScreen;
