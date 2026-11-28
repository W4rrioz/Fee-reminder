import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Send,
  CreditCard,
  CheckCircle,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { SendReminderModal } from '../components/SendReminderModal';
import { PieChart } from '../components/PieChart';
import { FeeReceiptModal } from '../components/FeeReceiptModal';

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
  const [activeReceiptDue, setActiveReceiptDue] = useState(null);
  const [reminderModalData, setReminderModalData] = useState(null);
  const [activeDefaulterTab, setActiveDefaulterTab] = useState('unpaidMonths'); // 'unpaidMonths' | 'allOverdue' | 'analytics'
  const [unpaidMonthFilter, setUnpaidMonthFilter] = useState('all'); // 'all' | '1' | '2' | '3+'

  const getStudent = (id) => students.find((s) => s.id === id);
  const getBatch = (id) => classesBatches.find((b) => b.id === id);

  // Filter overdue and pending dues
  const defaulterDues = useMemo(() => {
    return feeDues.filter((d) => {
      if (d.status !== 'overdue') return false;
      const student = students.find((s) => s.id === d.student_id);
      if (!student) return false;
      if (selectedBatchFilter !== 'all' && student.class_batch_id !== selectedBatchFilter) {
        return false;
      }
      return true;
    });
  }, [feeDues, students, selectedBatchFilter]);

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
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const batchLookup = new Map(classesBatches.map((b) => [b.id, b]));
    const batchMap = {};
    defaulterDues.forEach((due) => {
      const student = studentMap.get(due.student_id);
      const batchId = student?.class_batch_id || 'unassigned';
      const batch = batchLookup.get(batchId);
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

  // Send single due reminder with instant UPI QR photo
  const handleSendReminder = (due) => {
    const student = getStudent(due.student_id);
    if (!student) return;

    setReminderModalData({
      due,
      student,
      unpaidMonths: [due.month || 'Current Month'],
      totalAmount: Number(due.amount)
    });
  };

  // Cumulative WhatsApp reminder for all unpaid months of a student with instant UPI QR photo
  const handleCumulativeWhatsApp = (record) => {
    const { student, unpaidMonths, totalAmount, dues } = record;
    setReminderModalData({
      due: dues && dues[0] ? dues[0] : null,
      student,
      unpaidMonths,
      totalAmount
    });
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
    <div className="space-y-3.5 pb-20">
      {/* Overview Banner - Ledger Calm */}
      <div className="bg-white border border-stone-200 border-l-[5px] border-l-[#DC2626] rounded-lg p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
              Fee Recovery Center
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-0.5 tabular-nums">
              ₹{totalOverdue.toLocaleString('en-IN')} Outstanding
            </h2>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-[#DC2626]">
            <AlertTriangle size={20} />
          </div>
        </div>
        <p className="text-xs text-stone-500 mt-1.5">
          {defaulterDues.length} overdue records across {unpaidBins.one + unpaidBins.two + unpaidBins.threePlus} students. 1-tap WhatsApp reminders with 0% UPI link.
        </p>
      </div>

      {/* Tab Switcher: Unpaid Months Breakdown vs All Overdue List vs Analytics */}
      <div className="grid grid-cols-3 gap-1 bg-stone-200/80 p-1 rounded-lg">
        <button
          onClick={() => setActiveDefaulterTab('unpaidMonths')}
          className={`py-2 px-1 text-center rounded-md text-xs font-bold transition-all ${
            activeDefaulterTab === 'unpaidMonths'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          By Unpaid Mos
        </button>
        <button
          onClick={() => setActiveDefaulterTab('allOverdue')}
          className={`py-2 px-1 text-center rounded-md text-xs font-bold transition-all ${
            activeDefaulterTab === 'allOverdue'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Overdue ({defaulterDues.length})
        </button>
        <button
          onClick={() => setActiveDefaulterTab('analytics')}
          className={`py-2 px-1 text-center rounded-md text-xs font-bold transition-all ${
            activeDefaulterTab === 'analytics'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Batch Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedBatchFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
            selectedBatchFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-white border border-stone-200 text-stone-700'
          }`}
        >
          All {terms.classesOrBatches}
        </button>
        {classesBatches.map((cb) => (
          <button
            key={cb.id}
            onClick={() => setSelectedBatchFilter(cb.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              selectedBatchFilter === cb.id
                ? 'bg-[#3730A3] text-white'
                : 'bg-white border border-stone-200 text-stone-700'
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
          <div className="bg-white border border-stone-200 rounded-lg p-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Filter by Pending Period:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Due', count: unpaidBins.one + unpaidBins.two + unpaidBins.threePlus },
                { id: '1', label: '1 Month', count: unpaidBins.one },
                { id: '2', label: '2 Months', count: unpaidBins.two },
                { id: '3+', label: '3+ Months', count: unpaidBins.threePlus }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setUnpaidMonthFilter(f.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap border transition-all ${
                    unpaidMonthFilter === f.id
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
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
              <div className="bg-white rounded-lg p-8 text-center border border-stone-200">
                <CheckCircle size={32} className="mx-auto text-[#15803D] mb-2" />
                <h3 className="font-bold text-stone-900 text-sm">
                  No Unpaid Records in This Filter!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
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
                    className="bg-white border border-stone-200 border-l-[5px] border-l-[#DC2626] rounded-lg p-3.5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-sm">
                            {student.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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
                        <p className="text-xs text-stone-500 mt-0.5">
                          {batch?.name} • Parent: {student.guardian_name} ({student.guardian_phone})
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-[#DC2626] tabular-nums">
                          ₹{Number(totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">
                          Total Pending
                        </div>
                      </div>
                    </div>

                    {/* Pending Months breakdown badge display */}
                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                        <Clock size={13} className="text-[#DC2626]" />
                        <span>Unpaid Months: <b>{unpaidMonths.join(', ')}</b></span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Fees: {dues.map(d => `${d.month}: ₹${d.amount}`).join(' • ')}
                      </div>
                    </div>

                    {/* Action buttons (48px touch targets) */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCumulativeWhatsApp(record)}
                        className="min-h-[48px] bg-[#D97706] hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                      >
                        <Send size={15} />
                        <span>WhatsApp ({unpaidCount} Mos)</span>
                      </button>

                      <button
                        onClick={() => setSelectedDue(dues[0])}
                        className="min-h-[48px] bg-[#3730A3] hover:bg-indigo-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
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
            <div className="bg-white rounded-lg p-8 text-center border border-stone-200">
              <CheckCircle size={32} className="mx-auto text-[#15803D] mb-2" />
              <h3 className="font-bold text-stone-900 text-sm">
                Zero Overdue Defaulters!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
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
                  className="bg-white border border-stone-200 border-l-[5px] border-l-[#DC2626] rounded-lg p-3.5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">
                          {student.name}
                        </h4>
                        <span className="text-[10px] bg-rose-100 text-[#DC2626] font-bold px-1.5 py-0.5 rounded uppercase">
                          Overdue
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {batch?.name} • Parent: {student.guardian_name} ({student.guardian_phone})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-[#DC2626] tabular-nums">
                        ₹{Number(due.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-400 font-medium">
                        Due: {due.due_date}
                      </div>
                    </div>
                  </div>

                  {/* Pre-formatted message preview */}
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-600 flex items-start gap-2">
                    <MessageSquare size={14} className="text-[#15803D] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      "Namaste {student.guardian_name}, fee for {student.name} of ₹{due.amount} is due for {due.month}..."
                    </span>
                  </div>

                  {/* Action buttons (48px touch targets) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSendReminder(due)}
                      className="min-h-[48px] bg-[#D97706] hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                    >
                      <Send size={15} />
                      <span>WhatsApp with UPI</span>
                    </button>

                    <button
                      onClick={() => setSelectedDue(due)}
                      className="min-h-[48px] bg-[#3730A3] hover:bg-indigo-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
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
          <div className="bg-white border border-stone-200 rounded-lg p-4">
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
          <div className="bg-white border border-stone-200 rounded-lg p-4">
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
          batch={getBatch(getStudent(selectedDue.student_id)?.class_batch_id)}
          institute={institute}
          onClose={() => setSelectedDue(null)}
          onRecordPayment={recordPayment}
          onPaymentSuccess={(paidDue) => {
            setSelectedDue(null);
            setActiveReceiptDue(paidDue);
          }}
        />
      )}

      {/* Official Shareable & Printable Receipt Modal */}
      {activeReceiptDue && (
        <FeeReceiptModal
          isOpen={Boolean(activeReceiptDue)}
          due={activeReceiptDue}
          student={getStudent(activeReceiptDue.student_id)}
          batch={getBatch(getStudent(activeReceiptDue.student_id)?.class_batch_id)}
          institute={institute}
          onClose={() => setActiveReceiptDue(null)}
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

export default DefaultersScreen;

// EduManage Bharat · AI Genesis Challenge
