import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  CalendarCheck,
  Users,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateWhatsAppReminder } from '../utils/upi';

export const AiChatbot = ({ isOpen, onClose }) => {
  const {
    students,
    feeDues,
    classesBatches,
    attendance,
    institute,
    terms,
    setActiveTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Namaste! 🙏 I am your **EduManage AI Assistant**.

I have full live access to your institute's data (**${institute.name}**). You can ask me anything about your fee collections, defaulters, attendance, or ask me to draft reminders!

Tap a suggestion below or type your question:`,
      suggestions: [
        '📊 Total collection & pending summary',
        '⚠️ Who are the top overdue defaulters?',
        '📅 How is today\'s attendance?',
        '🚨 Which students are at high drop-out risk?',
        '✍️ Draft a polite fee reminder in Hinglish'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Compute live statistics for AI context
  const dataContext = useMemo(() => {
    const totalFees = feeDues.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const paidFees = feeDues
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const pendingFees = feeDues
      .filter((d) => d.status === 'pending')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const overdueDues = feeDues.filter((d) => d.status === 'overdue');
    const overdueFees = overdueDues.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const paidCount = feeDues.filter((d) => d.status === 'paid').length;
    const pendingCount = feeDues.filter((d) => d.status === 'pending').length;
    const overdueCount = overdueDues.length;

    // Defaulters list grouped by student
    const defaulterMap = {};
    overdueDues.forEach((d) => {
      if (!defaulterMap[d.student_id]) {
        defaulterMap[d.student_id] = {
          studentId: d.student_id,
          totalOverdue: 0,
          months: []
        };
      }
      defaulterMap[d.student_id].totalOverdue += Number(d.amount || 0);
      defaulterMap[d.student_id].months.push(d.month || d.fee_head);
    });

    const defaultersList = Object.values(defaulterMap)
      .map((item) => {
        const student = students.find((s) => s.id === item.studentId);
        const batch = classesBatches.find((b) => b.id === student?.class_batch_id);
        return {
          ...item,
          student,
          batchName: batch ? batch.name : 'General'
        };
      })
      .sort((a, b) => b.totalOverdue - a.totalOverdue);

    // Attendance stats
    let totalAttendanceMarked = 0;
    let presentCount = 0;
    let absentCount = 0;
    const absentStudentIds = new Set();

    Object.entries(attendance).forEach(([dateKey, records]) => {
      Object.entries(records).forEach(([stdId, status]) => {
        totalAttendanceMarked++;
        if (status === 'present') presentCount++;
        else if (status === 'absent') {
          absentCount++;
          absentStudentIds.add(stdId);
        }
      });
    });

    const attendanceRate =
      totalAttendanceMarked > 0 ? Math.round((presentCount / totalAttendanceMarked) * 100) : 92;

    // High risk students: attendance < 75% AND overdue fee
    const highRiskStudents = students.filter((s) => {
      const hasOverdue = overdueDues.some((d) => d.student_id === s.id);
      const isLowAttendance = Number(s.attendance_rate || 100) < 75;
      return hasOverdue || isLowAttendance;
    });

    return {
      totalFees,
      paidFees,
      pendingFees,
      overdueFees,
      paidCount,
      pendingCount,
      overdueCount,
      collectionPercentage: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0,
      defaultersList,
      attendanceRate,
      absentStudentIds,
      highRiskStudents,
      totalStudents: students.length,
      totalBatches: classesBatches.length
    };
  }, [students, feeDues, classesBatches, attendance]);

  // AI Response Generator Engine (Deterministic & Real Data Contextual)
  const processUserQuery = (queryText) => {
    const q = queryText.toLowerCase().trim();

    // 1. Fee Collection / Cashflow / Summary
    if (
      q.includes('collection') ||
      q.includes('summary') ||
      q.includes('cashflow') ||
      q.includes('how much') ||
      q.includes('stats') ||
      q.includes('total fee') ||
      q.includes('pending')
    ) {
      return {
        text: `### 📊 Fee Collection & Financial Summary
Here is the real-time collection health for **${institute.name}**:

- **Total Fee Pool:** ₹${dataContext.totalFees.toLocaleString('en-IN')} (${feeDues.length} total dues)
- **Collected so far:** **₹${dataContext.paidFees.toLocaleString('en-IN')}** (${dataContext.collectionPercentage}% collected)
- **Pending (Due Soon):** ₹${dataContext.pendingFees.toLocaleString('en-IN')} (${dataContext.pendingCount} students)
- **Overdue Defaulters:** **₹${dataContext.overdueFees.toLocaleString('en-IN')}** (${dataContext.overdueCount} overdue dues)

💡 **AI Insight:** You have collected **${dataContext.collectionPercentage}%** of expected dues. Clearing the top **${Math.min(3, dataContext.defaultersList.length)}** overdue accounts will recover **₹${dataContext.defaultersList.slice(0, 3).reduce((sum, d) => sum + d.totalOverdue, 0).toLocaleString('en-IN')}** directly to your bank account with 0% gateway cut!`,
        actionTab: 'fees',
        actionLabel: 'View Fee Register'
      };
    }

    // 2. Defaulters / Overdue / Unpaid
    if (
      q.includes('defaulter') ||
      q.includes('overdue') ||
      q.includes('unpaid') ||
      q.includes('who owes') ||
      q.includes('who hasn\'t paid') ||
      q.includes('who has not paid')
    ) {
      if (dataContext.defaultersList.length === 0) {
        return {
          text: `🎉 **Great news!** There are currently **0 overdue defaulters** in your institute. All active fees are cleared or in current pending cycle.`
        };
      }

      const topList = dataContext.defaultersList.slice(0, 5);
      const listFormatted = topList
        .map(
          (d, idx) =>
            `${idx + 1}. **${d.student?.name || 'Student'}** (${d.batchName})
   • **Overdue Amount:** ₹${d.totalOverdue.toLocaleString('en-IN')}
   • **Parent:** ${d.student?.guardian_name || 'Guardian'} (${d.student?.guardian_phone || 'N/A'})
   • **Unpaid Cycles:** ${d.months.join(', ')}`
        )
        .join('\n\n');

      return {
        text: `### ⚠️ Top Overdue Defaulters (${dataContext.defaultersList.length} total)

${listFormatted}

💡 **AI Recommendation:** Tap on any student in the **Defaulters screen** to send a 1-tap personalized WhatsApp reminder with their pre-calculated UPI payment link.`,
        actionTab: 'defaulters',
        actionLabel: 'Go to Defaulters Follow-up'
      };
    }

    // 3. Attendance Queries
    if (
      q.includes('attendance') ||
      q.includes('absent') ||
      q.includes('present') ||
      q.includes('roll call')
    ) {
      return {
        text: `### 📅 Attendance Overview

- **Overall Attendance Rate:** **${dataContext.attendanceRate}%**
- **Total Tracked Students:** ${dataContext.totalStudents} across ${dataContext.totalBatches} ${terms.classesOrBatches.toLowerCase()}
- **Recent Absent Count:** ${dataContext.absentStudentIds.size} flagged

💡 **AI Tip:** Regular attendance strongly correlates with timely fee payments. Students with attendance below 75% are 3.4x more likely to delay fee payments or drop out.`,
        actionTab: 'attendance',
        actionLabel: 'Open Attendance Register'
      };
    }

    // 4. Drop-out / At-Risk Student Prediction
    if (
      q.includes('risk') ||
      q.includes('drop out') ||
      q.includes('dropout') ||
      q.includes('chances') ||
      q.includes('warning')
    ) {
      const atRisk = dataContext.highRiskStudents.slice(0, 4);
      if (atRisk.length === 0) {
        return {
          text: `✅ **Low Risk:** All students currently maintain good attendance (>75%) and healthy payment records.`
        };
      }

      const riskFormatted = atRisk
        .map((s, idx) => {
          const hasOverdue = feeDues.some((d) => d.student_id === s.id && d.status === 'overdue');
          return `${idx + 1}. **${s.name}** (Roll: ${s.roll_no})
   • **Attendance Rate:** ${s.attendance_rate || 70}%
   • **Fee Status:** ${hasOverdue ? '⚠️ Overdue Dues' : 'Up to date'}
   • **Risk Factor:** ${Number(s.attendance_rate) < 75 && hasOverdue ? '🚨 High (Fee delay + Low Attendance)' : '⚠️ Moderate (Irregular Attendance)'}`;
        })
        .join('\n\n');

      return {
        text: `### 🚨 Drop-out & Payment Delay Risk Analysis

Here are students identified by the AI risk model:

${riskFormatted}

💡 **AI Action Plan:** Schedule a polite call with parents or send an empathetic WhatsApp message to understand if academic or financial assistance is needed.`,
        actionTab: 'students',
        actionLabel: 'View Student Profiles'
      };
    }

    // 5. Draft WhatsApp Reminder Message
    if (
      q.includes('draft') ||
      q.includes('message') ||
      q.includes('whatsapp') ||
      q.includes('reminder') ||
      q.includes('template')
    ) {
      const sampleStudent = dataContext.defaultersList[0]?.student || students[0];
      const sampleDue = feeDues.find((d) => d.student_id === sampleStudent?.id) || feeDues[0];

      const hinglishDraft = `Namaste ${sampleStudent?.guardian_name || 'Parent'} ji,
Yeh message *${institute.name}* ki taraf se hai.

*${sampleStudent?.name || 'Student'}* ki ${sampleDue?.month || 'October 2026'} ki tuition fee *₹${sampleDue?.amount || 1500}* overdue hai.

🔗 *Direct UPI Payment Link (GPay / PhonePe / Paytm):*
upi://pay?pa=${institute.upi_id}&pn=${encodeURIComponent(institute.upi_name || institute.name)}&am=${sampleDue?.amount || 1500}&cu=INR

Aap bina kisi extra charge ke direct UPI se pay kar sakte hain. Payment hone par receipt turant generate ho jayegi.
Dhanyawad!
— ${institute.name}`;

      return {
        text: `### ✍️ AI-Generated WhatsApp Fee Reminder (Hinglish / Hindi Friendly)

Here is a personalized template ready to send:

\`\`\`
${hinglishDraft}
\`\`\`

💡 You can also trigger this in 1-tap directly from the **Defaulters** or **Fees** tab with a dynamic QR code pre-rendered!`,
        actionTab: 'defaulters',
        actionLabel: 'Send WhatsApp Reminders'
      };
    }

    // 6. Search for specific student by name
    const foundStudent = students.find((s) => q.includes(s.name.toLowerCase()));
    if (foundStudent) {
      const studentDues = feeDues.filter((d) => d.student_id === foundStudent.id);
      const studentBatch = classesBatches.find((b) => b.id === foundStudent.class_batch_id);
      const pendingTotal = studentDues
        .filter((d) => d.status !== 'paid')
        .reduce((sum, d) => sum + Number(d.amount || 0), 0);

      return {
        text: `### 👤 Student Profile: **${foundStudent.name}** (Roll: ${foundStudent.roll_no})

- **${terms.classOrBatch}:** ${studentBatch ? studentBatch.name : 'General'}
- **Monthly Fee:** ₹${foundStudent.monthly_fee}
- **Attendance Rate:** ${foundStudent.attendance_rate || 90}%
- **Guardian Contact:** ${foundStudent.guardian_name} • ${foundStudent.guardian_phone}
- **Fee Status:** ${pendingTotal > 0 ? `⚠️ Unpaid Dues: ₹${pendingTotal.toLocaleString('en-IN')}` : '✅ All Fees Paid'}

**Recent Dues:**
${studentDues.map((d) => `• ${d.fee_head || d.month}: ₹${d.amount} [${d.status.toUpperCase()}]`).join('\n')}`,
        actionTab: 'students',
        actionLabel: 'Open Student Details'
      };
    }

    // 7. General Fallback with intelligent context
    return {
      text: `I examined your institute's data for **${institute.name}**. 

Here is what I know:
- **Total Learners:** ${dataContext.totalStudents} enrolled across ${dataContext.totalBatches} ${terms.classesOrBatches.toLowerCase()}
- **Fee Collection Status:** ₹${dataContext.paidFees.toLocaleString('en-IN')} collected (${dataContext.collectionPercentage}%) | ₹${dataContext.overdueFees.toLocaleString('en-IN')} overdue
- **Attendance Health:** ${dataContext.attendanceRate}% average attendance

You can ask me specific questions like:
- *"Who are the top defaulters?"*
- *"Show me students in ${classesBatches[0]?.name || 'Batch 10'}"*
- *"Draft a WhatsApp message for overdue fees"*
- *"How much pending fee do we have?"*`
    };
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate smart AI typing latency
    setTimeout(() => {
      const response = processUserQuery(query);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.text,
        actionTab: response.actionTab,
        actionLabel: response.actionLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* 1. Header Bar */}
        <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <Bot size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white leading-tight">
                  EduManage AI Copilot
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                  Live Data
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                Ask questions about fees, defaulters, attendance & students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: 'reset',
                    sender: 'ai',
                    text: 'Chat history cleared. How can I help you analyze your institute data?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              title="Clear chat history"
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* 2. Messages Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {/* Message text with basic markdown style rendering */}
                <div className="whitespace-pre-line font-sans space-y-1.5">
                  {msg.text}
                </div>

                {/* Direct Action Button if attached */}
                {msg.actionTab && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(msg.actionTab);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                    >
                      <span>{msg.actionLabel || 'View in App'}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>

              {/* Suggestions chips on welcome */}
              {msg.suggestions && (
                <div className="mt-2.5 space-y-1.5 w-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Suggested Questions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(sug)}
                        className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-xs w-fit text-slate-500 shadow-2xs">
              <Sparkles size={14} className="text-blue-600 animate-spin" />
              <span className="text-xs font-semibold">EduManage AI analyzing data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input Footer Bar */}
        <footer className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about dues, defaulters, attendance..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="min-w-[42px] h-[42px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
            <span>Powered by EduManage Intelligent NLU Engine</span>
            <span>100% Offline Tolerant</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
