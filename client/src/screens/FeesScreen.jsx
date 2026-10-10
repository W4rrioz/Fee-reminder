import React, { useState } from 'react';
import {
  CreditCard,
  Send,
  QrCode,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { SendReminderModal } from '../components/SendReminderModal';
import { generateWhatsAppReminder, generateUpiLink } from '../utils/upi';

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
    <div className="space-y-4 pb-20">
      {/* Header & Stats Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-slate-900">Fee Management</h2>
          <span className="text-xs font-bold text-slate-500">
            {filteredDues.length} Records
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">
              Collected
            </span>
            <span className="text-base font-black text-emerald-800">
              ₹{collectedAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">
              Remaining Due
            </span>
            <span className="text-base font-black text-rose-800">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Search & Batch Filter */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search student, roll number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedBatchFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedBatchFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All {terms.classesOrBatches}
            </button>
            {classesBatches.map((cb) => (
              <button
                key={cb.id}
                onClick={() => setSelectedBatchFilter(cb.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedBatchFilter === cb.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cb.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Chips */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {[
            { id: 'all', label: 'All' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'pending', label: 'Pending' },
            { id: 'paid', label: 'Paid' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                activeFilter === chip.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">
              No fee dues found matching criteria.
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
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                  isPaid
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : isOverdue
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: Name and Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {student.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        (#{student.roll_no})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {batch?.name || terms.classOrBatch} • Parent: {student.guardian_name}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-slate-900">
                      ₹{Number(due.amount).toLocaleString('en-IN')}
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
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
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>{due.fee_head || due.month}</span>
                  {isPaid ? (
                    <span className="text-emerald-700 font-medium font-mono">
                      Paid on {due.paid_at} ({due.payment_method?.toUpperCase()})
                    </span>
                  ) : (
                    <span className="font-medium text-slate-600">
                      Due: {due.due_date}
                    </span>
                  )}
                </div>

                {/* ACTION BUTTONS (48px+ touch targets) */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {!isPaid ? (
                    <>
                      {/* Button 1: WhatsApp Reminder with UPI Deep Link */}
                      <button
                        onClick={() => handleSendReminder(due)}
                        className="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
                      >
                        <Send size={15} />
                        <span>WhatsApp Reminder</span>
                      </button>

                      {/* Button 2: Record Payment / Dynamic QR Code */}
                      <button
                        onClick={() => setActivePaymentDue(due)}
                        className="min-h-[46px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
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
                        className="min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 col-span-2 border border-slate-200 active:scale-98"
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                Payment Receipt
              </span>
              <h3 className="text-base font-black text-slate-900 mt-2">
                {institute.name}
              </h3>
              <p className="text-xs text-slate-500">{institute.city}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">
                  {getStudent(activeReceiptDue.student_id)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Head:</span>
                <span className="font-semibold text-slate-800">
                  {activeReceiptDue.fee_head}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-black text-emerald-700 text-sm">
                  ₹{Number(activeReceiptDue.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="font-bold uppercase text-slate-800">
                  {activeReceiptDue.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ref ID:</span>
                <span className="font-mono text-slate-700">
                  {activeReceiptDue.reference_id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Date:</span>
                <span className="text-slate-800">{activeReceiptDue.paid_at}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveReceiptDue(null)}
              className="w-full min-h-[46px] bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Payment / Counter QR Modal */}
      {activePaymentDue && (
        <PaymentModal
          due={activePaymentDue}
          student={getStudent(activePaymentDue.student_id)}
          institute={institute}
          onClose={() => setActivePaymentDue(null)}
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
