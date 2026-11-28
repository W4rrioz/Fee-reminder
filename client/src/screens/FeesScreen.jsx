import React, { useState } from 'react';
import {
  CreditCard,
  Send,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { SendReminderModal } from '../components/SendReminderModal';

export const FeesScreen = () => {
  const {
    institute,
    terms,
    feeDues,
    students,
    classesBatches,
    recordPayment
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'overdue' | 'paid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [activePaymentDue, setActivePaymentDue] = useState(null);
  const [activeReceiptDue, setActiveReceiptDue] = useState(null);
  const [reminderModalData, setReminderModalData] = useState(null);

  const getStudent = (studentId) => students.find((s) => s.id === studentId);
  const getBatch = (batchId) => classesBatches.find((b) => b.id === batchId);

  // Filter dues
  const filteredDues = feeDues.filter((due) => {
    const student = getStudent(due.student_id);
    if (!student) return false;

    // Status filter
    if (activeFilter !== 'all' && due.status !== activeFilter) return false;

    // Batch filter
    if (selectedBatchFilter !== 'all' && student.class_batch_id !== selectedBatchFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchRoll = String(student.roll_no).includes(q);
      const matchPhone = String(student.phone || '').includes(q);
      return matchName || matchRoll || matchPhone;
    }

    return true;
  });

  // Calculate totals
  const totalAmount = filteredDues.reduce((sum, d) => sum + Number(d.amount), 0);
  const pendingAmount = filteredDues
    .filter((d) => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const collectedAmount = filteredDues
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  // Send WhatsApp reminder with instant UPI QR photo
  const handleSendReminder = (due) => {
    const student = getStudent(due.student_id);
    if (!student) return;

    setReminderModalData({
      due,
      student,
      unpaidMonths: [due.fee_head || due.month || 'Current Month'],
      totalAmount: Number(due.amount)
    });
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* Header & Stats Banner - Ledger Calm */}
      <div className="bg-white border border-stone-200 rounded-lg p-3.5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-stone-900">Fee Ledger</h2>
          <span className="text-xs font-semibold text-stone-500">
            {filteredDues.length} Records
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-stone-600 uppercase block">
              Billed
            </span>
            <span className="text-sm sm:text-base font-bold text-stone-900 tabular-nums">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-[#15803D] uppercase block">
              Collected
            </span>
            <span className="text-sm sm:text-base font-bold text-[#15803D] tabular-nums">
              ₹{collectedAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-[#DC2626] uppercase block">
              Remaining
            </span>
            <span className="text-sm sm:text-base font-bold text-[#DC2626] tabular-nums">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Search & Batch Filter */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-stone-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search student, roll number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedBatchFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                selectedBatchFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cb.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Chips */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-stone-100">
          {[
            { id: 'all', label: 'All' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'pending', label: 'Pending' },
            { id: 'paid', label: 'Paid' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`py-1.5 rounded-md text-xs font-bold transition-all text-center ${
                activeFilter === chip.id
                  ? 'bg-[#3730A3] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* DUES LIST */}
      <div className="space-y-2.5">
        {filteredDues.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-stone-200">
            <p className="text-xs font-semibold text-stone-500">
              No fee records found matching criteria.
            </p>
          </div>
        ) : (
          filteredDues.map((due) => {
            const student = getStudent(due.student_id);
            if (!student) return null;
            const batch = getBatch(student.class_batch_id);

            const isPaid = due.status === 'paid';
            const isOverdue = due.status === 'overdue';

            return (
              <div
                key={due.id}
                className={`bg-white rounded-lg p-3.5 border transition-all ${
                  isPaid
                    ? 'border-stone-200 border-l-[5px] border-l-[#15803D]'
                    : isOverdue
                    ? 'border-stone-200 border-l-[5px] border-l-[#DC2626]'
                    : 'border-stone-200 border-l-[5px] border-l-[#D97706]'
                }`}
              >
                {/* Top Row: Name and Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-stone-900 text-sm truncate">
                        {student.name}
                      </h4>
                      <span className="text-[11px] text-stone-400 font-medium">
                        (#{student.roll_no})
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {batch?.name || terms.classOrBatch} • Parent: {student.guardian_name}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-stone-900 tabular-nums">
                      ₹{Number(due.amount).toLocaleString('en-IN')}
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 uppercase tracking-wide ${
                        isPaid
                          ? 'bg-emerald-100 text-[#15803D]'
                          : isOverdue
                          ? 'bg-rose-100 text-[#DC2626]'
                          : 'bg-amber-100 text-[#D97706]'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle size={10} /> Paid
                        </>
                      ) : isOverdue ? (
                        <>
                          <AlertTriangle size={10} /> Overdue
                        </>
                      ) : (
                        <>
                          <Clock size={10} /> Pending
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Sub details: Month and Due Date */}
                <div className="mt-2 text-xs text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
                  <span>{due.fee_head || due.month}</span>
                  {isPaid ? (
                    <span className="text-[#15803D] font-medium font-mono text-[11px]">
                      Paid on {due.paid_at} ({due.payment_method?.toUpperCase()})
                    </span>
                  ) : (
                    <span className="font-medium text-stone-600 text-[11px]">
                      Due: {due.due_date}
                    </span>
                  )}
                </div>

                {/* ACTION BUTTONS (48px minimum touch targets) */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {!isPaid ? (
                    <>
                      {/* Button 1: WhatsApp Reminder with UPI Deep Link */}
                      <button
                        onClick={() => handleSendReminder(due)}
                        className="min-h-[48px] bg-[#D97706] hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                      >
                        <Send size={15} />
                        <span>WhatsApp Reminder</span>
                      </button>

                      {/* Button 2: Record Payment / Dynamic QR Code */}
                      <button
                        onClick={() => setActivePaymentDue(due)}
                        className="min-h-[48px] bg-[#3730A3] hover:bg-indigo-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                      >
                        <CreditCard size={15} />
                        <span>Record / UPI QR</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* View Receipt */}
                      <button
                        onClick={() => setActiveReceiptDue(due)}
                        className="min-h-[48px] bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 col-span-2 border border-stone-200 active:scale-98"
                      >
                        <Receipt size={15} />
                        <span>View Shareable Receipt</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {activePaymentDue && (
        <PaymentModal
          due={activePaymentDue}
          student={getStudent(activePaymentDue.student_id)}
          institute={institute}
          onClose={() => setActivePaymentDue(null)}
          onRecordPayment={recordPayment}
        />
      )}

      {/* Simple Shareable Receipt Modal */}
      {activeReceiptDue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4 border border-stone-200">
            <div className="text-center border-b border-stone-100 pb-3">
              <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                Payment Receipt
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-2">
                {institute.name}
              </h3>
              <p className="text-xs text-stone-500">{institute.city}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Student:</span>
                <span className="font-bold text-stone-900">
                  {getStudent(activeReceiptDue.student_id)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Fee Head:</span>
                <span className="font-semibold text-stone-800">
                  {activeReceiptDue.fee_head}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Paid Amount:</span>
                <span className="font-bold text-[#15803D] text-sm tabular-nums">
                  ₹{Number(activeReceiptDue.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Mode:</span>
                <span className="font-bold uppercase text-stone-800">
                  {activeReceiptDue.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ref ID:</span>
                <span className="font-mono text-stone-700">
                  {activeReceiptDue.reference_id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Paid Date:</span>
                <span className="text-stone-800">{activeReceiptDue.paid_at}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveReceiptDue(null)}
              className="w-full min-h-[48px] bg-stone-900 hover:bg-black text-white font-bold rounded-lg text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
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

// EduManage Bharat · AI Genesis Challenge
