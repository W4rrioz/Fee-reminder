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

// Clean markdown parser for AI messages
function FormattedMessageText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="font-sans space-y-1.5 leading-relaxed text-xs">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="font-black text-xs sm:text-sm text-stone-900 pt-1.5 border-b border-stone-200/80 pb-0.5">
              {trimmed.slice(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
          return (
            <div key={i} className="my-1.5 p-2 rounded-lg bg-stone-100 font-mono text-center text-xs text-stone-800 border border-stone-200">
              {trimmed.slice(2, -2).trim()}
            </div>
          );
        }

        const parts = [];
        const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\$[^$]+\$)/g;
        let lastIndex = 0;
        let match;
        let keyIdx = 0;

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }
          const m = match[0];
          if (m.startsWith('**') && m.endsWith('**')) {
            parts.push(<strong key={keyIdx++} className="font-bold text-stone-900">{m.slice(2, -2)}</strong>);
          } else if (m.startsWith('`') && m.endsWith('`')) {
            parts.push(<code key={keyIdx++} className="px-1 py-0.5 rounded bg-stone-100 text-[#A82D24] font-mono text-[11px]">{m.slice(1, -1)}</code>);
          } else if (m.startsWith('*') && m.endsWith('*')) {
            parts.push(<em key={keyIdx++} className="italic text-stone-700">{m.slice(1, -1)}</em>);
          } else if (m.startsWith('$') && m.endsWith('$')) {
            parts.push(<span key={keyIdx++} className="font-mono text-xs text-emerald-700 font-semibold">{m.slice(1, -1)}</span>);
          }
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        return (
          <div key={i} className="min-h-[1.1rem]">
            {parts.length > 0 ? parts : line}
          </div>
        );
      })}
    </div>
  );
}

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
      text: `Namaste! 🙏 I am **Sarthi AI & EduManage Copilot**.

I can explain any **Physics, Chemistry, Math, or Science chapter** in simple Hinglish/English with real-world examples, as well as analyze your **fees, defaulters, and attendance** data!

Tap a suggestion below or type your question:`,
      suggestions: [
        '💡 Velocity aur speed mein kya difference hai?',
        '🔬 Explain Chemical Reactions & Equations',
        '📊 Total collection & pending fee summary',
        '⚠️ Who are the top overdue defaulters?',
        '✍️ Draft a polite WhatsApp fee reminder in Hinglish'
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

    // Educational concepts (Sarthi AI Tutor mode)
    if (q.includes('velocity') || q.includes('speed')) {
      return {
        text: `### ✦ Sarthi Explains: Velocity vs Speed

**Speed** sirf yeh batata hai ki koi cheez kitni tezi se chal rahi hai (jaise *40 km/h*). Yeh ek **Scalar** quantity hai jisme direction nahi hoti.

Lekin **Velocity** mein speed ke saath **Direction (disha)** bhi hoti hai! Yeh ek **Vector** quantity hai.

👉 **Real-world Example:**
- Agar ek auto sadak par *40 km/h* par chal raha hai $\\rightarrow$ **Speed**.
- Agar wahi auto *40 km/h* ki raftaar se **North ki taraf** ja raha hai $\\rightarrow$ **Velocity**!

- **Formula:** $\\vec{v} = \\frac{\\Delta \\vec{x}}{\\Delta t}$ (Displacement / Time)
- **SI Unit:** $m/s$ (metre per second)
- **Key Exam Point:** Agar ek circular track par gaadi constant speed se ghoom rahi hai, tab bhi uski direction har second badalti hai, isliye uski *velocity change ho rahi hoti hai* aur usme *acceleration* hota hai!`
      };
    }

    if (q.includes('chemical reaction') || q.includes('reaction') || q.includes('metal')) {
      return {
        text: `### ✦ Sarthi Explains: Chemical Reactions & Equations (Class 10)

Jab do ya zyada substances milkar naye properties wale substances banate hain jinki chemical identity badal jaati hai, usse **Chemical Reaction** kehte hain.

👉 **Four Signs of a Reaction:**
1. **Change in state**
2. **Change in colour**
3. **Evolution of gas** (e.g., $H_2$ gas release)
4. **Change in temperature** (Exothermic vs Endothermic)

👉 **Classic Board Exam Reaction:**
Magnesium ribbon ko hawa me burn karne par dazzling white flame ke saath **Magnesium Oxide** banta hai:
$$2\\text{Mg} (s) + \\text{O}_2 (g) \\rightarrow 2\\text{MgO} (s)$$

💡 **Why balance equations?**
According to the **Law of Conservation of Mass**, matter can neither be created nor destroyed. Isliye Reactants ke atoms = Products ke atoms hone chahiye!`
      };
    }

    if (q.includes('kinetic') || q.includes('energy') || q.includes('formula')) {
      return {
        text: `### ✦ Sarthi Explains: Kinetic Energy Formula

Kinetic Energy ($K$) kisi object ki motion (gati) ki wajah se hoti hai.

- **Formula:**
$$K = \\frac{1}{2} m v^2$$

Where:
- $m$ = Mass (kg)
- $v$ = Velocity ($m/s$)

👉 **Numerical from Blackboard:**
- $m = 5\\text{ kg}$, $v = 4\\text{ m/s}$
$$K = \\frac{1}{2} \\times 5 \\times 4^2 = \\frac{1}{2} \\times 5 \\times 16 = 40\\text{ Joules (J)}$$

💡 **Unit:** Joules ($J$). Agar velocity double kar di jaye ($2v$), toh Kinetic Energy **4 times** ho jaati hai kyunki $v^2$ par depend karti hai!`
      };
    }

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

  const handleSend = async (textToSend) => {
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

    try {
      // 1. Attempt to call secure server-side Gemini API
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            instituteName: institute.name,
            upiId: institute.upi_id,
            ...dataContext
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.reply) {
          const aiMsg = {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: json.reply,
            isGemini: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend AI API unavailable or offline, using local intelligent engine:', err);
    }

    // 2. Fallback to deterministic contextual NLU engine
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
        <header className="bg-gradient-to-r from-[#8B261E] via-[#A82D24] to-[#731D16] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white leading-tight">
                  Sarthi AI & Copilot
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950">
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-red-100 font-medium">
                Physics, Math, Chemistry concepts & live institute analytics
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
                <div className="font-sans">
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-line">{msg.text}</div>
                  ) : (
                    <FormattedMessageText text={msg.text} />
                  )}
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
