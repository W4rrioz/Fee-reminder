import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def add_run_text(paragraph, text, bold=False, size=Pt(12), color=None):
    r = paragraph.add_run()
    r.text = text
    r.font.bold = bold
    r.font.size = size
    if color:
        r.font.color.rgb = color
    return r

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Brand Colors
    C_CRIMSON = RGBColor(139, 38, 30)      # #8B261E
    C_DARK = RGBColor(28, 25, 23)          # #1C1917
    C_WARM = RGBColor(250, 247, 242)       # #FAF7F2
    C_WHITE = RGBColor(255, 255, 255)
    C_INDIGO = RGBColor(55, 48, 163)       # #3730A3
    C_EMERALD = RGBColor(21, 128, 61)      # #15803D
    C_GOLD = RGBColor(217, 119, 6)         # #D97706
    C_GRAY = RGBColor(100, 100, 100)
    C_LIGHT_GRAY = RGBColor(230, 225, 220)

    def add_bg(slide, color):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    def add_card(slide, left, top, width, height, fill_color, border_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Editorial Crimson)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, C_CRIMSON)

    tb_sub = s1.shapes.add_textbox(Inches(1.0), Inches(1.1), Inches(11.3), Inches(0.5))
    p = tb_sub.text_frame.paragraphs[0]
    p.text = "AI GENESIS CHALLENGE 2026 · ALTA SCHOOL OF TECHNOLOGY"
    p.font.name = 'Calibri'
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 205, 211)

    tb_title = s1.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.3), Inches(1.8))
    p = tb_title.text_frame.paragraphs[0]
    p.text = "EduManage Bharat"
    p.font.name = 'Georgia'
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    tb_tag = s1.shapes.add_textbox(Inches(1.0), Inches(3.3), Inches(11.3), Inches(1.0))
    p = tb_tag.text_frame.paragraphs[0]
    p.text = "Zero-Commission Direct Bank UPI Fee Engine, 2G Offline Register & AI Operations Copilot"
    p.font.name = 'Calibri'
    p.font.size = Pt(21)
    p.font.color.rgb = RGBColor(254, 243, 199)

    pillars = [
        ("0% Gateway Commission", "Direct NPCI UPI bank links bypass 2.36% Razorpay tax"),
        ("1-Tap WhatsApp Receipts", "Polite bilingual reminders & official digital vouchers"),
        ("2G Offline Resilience", "Log 35-student classroom attendance in 0ms blackout")
    ]
    for i, (title, desc) in enumerate(pillars):
        left = Inches(1.0 + i * 3.85)
        add_card(s1, left, Inches(4.6), Inches(3.6), Inches(1.6), RGBColor(114, 28, 22), border_color=RGBColor(248, 113, 113))
        tb_p = s1.shapes.add_textbox(left + Inches(0.2), Inches(4.75), Inches(3.2), Inches(1.3))
        p0 = tb_p.text_frame.paragraphs[0]
        p0.text = f"✦ {title}"
        p0.font.name = 'Calibri'
        p0.font.size = Pt(15)
        p0.font.bold = True
        p0.font.color.rgb = C_WHITE
        p1 = tb_p.text_frame.add_paragraph()
        p1.text = desc
        p1.font.name = 'Calibri'
        p1.font.size = Pt(12)
        p1.font.color.rgb = RGBColor(254, 226, 226)

    tb_foot = s1.shapes.add_textbox(Inches(1.0), Inches(6.55), Inches(11.3), Inches(0.5))
    p = tb_foot.text_frame.paragraphs[0]
    p.text = "Presented by Aman · Live Production: feeremindersupabasedeploy.vercel.app"
    p.font.name = 'Calibri'
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(254, 205, 211)

    # =========================================================================
    # SLIDE 2: THE PROBLEM
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2, C_WARM)

    tb_h = s2.shapes.add_textbox(Inches(1.0), Inches(0.6), Inches(11.3), Inches(0.4))
    p = tb_h.text_frame.paragraphs[0]
    p.text = "THE PROBLEM: BHARAT'S TIER-2/3 EDUCATION CRISIS"
    p.font.name = 'Calibri'
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CRIMSON

    tb_ht = s2.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.3), Inches(0.7))
    p = tb_ht.text_frame.paragraphs[0]
    p.text = "Why Traditional ERPs & Payment Gateways Fail Educators"
    p.font.name = 'Georgia'
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_DARK

    # Problem Card 1: The Gateway Tax
    add_card(s2, Inches(1.0), Inches(1.8), Inches(5.4), Inches(4.9), C_WHITE, border_color=C_CRIMSON)
    tb_p1 = s2.shapes.add_textbox(Inches(1.3), Inches(2.0), Inches(4.8), Inches(4.5))
    tf1 = tb_p1.text_frame
    p0 = tf1.paragraphs[0]
    p0.text = "💸 The 2.36% Gateway Tax Siphon"
    p0.font.name = 'Calibri'
    p0.font.size = Pt(18)
    p0.font.bold = True
    p0.font.color.rgb = C_CRIMSON

    bullets1 = [
        ("₹84,960 Siphoned Annually:", " Commercial payment gateways (Razorpay, Cashfree) deduct 2.0% + 18% GST (2.36%) on every transaction."),
        ("Mandatory GST & Merchant KYC:", " Independent tutors and unaccredited coaching institutes are rejected due to lack of corporate incorporation."),
        ("T+2 Delayed Settlement:", " Educators teaching in rented basements wait 48-72 hours to access their own tuition money.")
    ]
    for b_title, b_desc in bullets1:
        p_b = tf1.add_paragraph()
        p_b.space_before = Pt(12)
        add_run_text(p_b, f"• {b_title}", bold=True, size=Pt(13), color=C_DARK)
        add_run_text(p_b, b_desc, bold=False, size=Pt(12), color=C_GRAY)

    # Problem Card 2: Behavioral Discomfort & 2G Reality
    add_card(s2, Inches(6.9), Inches(1.8), Inches(5.4), Inches(4.9), C_WHITE, border_color=C_INDIGO)
    tb_p2 = s2.shapes.add_textbox(Inches(7.2), Inches(2.0), Inches(4.8), Inches(4.5))
    tf2 = tb_p2.text_frame
    p0 = tf2.paragraphs[0]
    p0.text = "📞 Behavioral Awkwardness & 2G Chaos"
    p0.font.name = 'Calibri'
    p0.font.size = Pt(18)
    p0.font.bold = True
    p0.font.color.rgb = C_INDIGO

    bullets2 = [
        ("Awkward Phone Calls:", " Educators spend 10+ hours a week dialing respected parents asking for overdue money, feeling demeaned and uncomfortable."),
        ("Bahi-Khata & Paper Register:", " Scratched diaries cause multi-month installment confusion and chronic defaulter dropouts."),
        ("2G Network Blackouts:", " Concrete basement classrooms experience total signal loss, causing standard cloud ERP portals to freeze and crash.")
    ]
    for b_title, b_desc in bullets2:
        p_b = tf2.add_paragraph()
        p_b.space_before = Pt(12)
        add_run_text(p_b, f"• {b_title}", bold=True, size=Pt(13), color=C_DARK)
        add_run_text(p_b, b_desc, bold=False, size=Pt(12), color=C_GRAY)

    # =========================================================================
    # SLIDE 3: THE SOLUTION & ARCHITECTURE
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3, C_WARM)

    tb_h = s3.shapes.add_textbox(Inches(1.0), Inches(0.6), Inches(11.3), Inches(0.4))
    p = tb_h.text_frame.paragraphs[0]
    p.text = "THE ARCHITECTURE: 0% COMMISSION DIRECT BANK UPI"
    p.font.name = 'Calibri'
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CRIMSON

    tb_ht = s3.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.3), Inches(0.7))
    p = tb_ht.text_frame.paragraphs[0]
    p.text = "Bypassing Intermediaries via Native NPCI Protocol"
    p.font.name = 'Georgia'
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_DARK

    arch_cards = [
        ("Direct NPCI Bank UPI", "Generates standard upi://pay intent strings directly to teacher's existing bank account. T+0 instant credit, 0% fees, zero merchant setup."),
        ("Dynamic Overdue QR", "Client-side HTML5 canvas generates dynamic QR codes embedded with exact overdue balance and student roll number in transaction note."),
        ("Shielded AI Copilot", "Gemini Pro operations proxy isolated behind Vercel serverless layer (/api/ai-chat) protecting API keys and providing live debt synthesis.")
    ]
    for i, (title, desc) in enumerate(arch_cards):
        left = Inches(1.0 + i * 3.85)
        add_card(s3, left, Inches(1.8), Inches(3.6), Inches(4.9), C_WHITE, border_color=C_EMERALD if i == 0 else C_INDIGO)
        tb_a = s3.shapes.add_textbox(left + Inches(0.25), Inches(2.1), Inches(3.1), Inches(4.3))
        p0 = tb_a.text_frame.paragraphs[0]
        p0.text = f"0{i+1}. {title}"
        p0.font.name = 'Calibri'
        p0.font.size = Pt(17)
        p0.font.bold = True
        p0.font.color.rgb = C_EMERALD if i == 0 else C_INDIGO
        p1 = tb_a.text_frame.add_paragraph()
        p1.space_before = Pt(14)
        p1.text = desc
        p1.font.name = 'Calibri'
        p1.font.size = Pt(13)
        p1.font.color.rgb = C_DARK

    # =========================================================================
    # SLIDE 4: 5 REAL PERSONA EVALUATIONS
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4, C_WARM)

    tb_h = s4.shapes.add_textbox(Inches(1.0), Inches(0.6), Inches(11.3), Inches(0.4))
    p = tb_h.text_frame.paragraphs[0]
    p.text = "PRIMARY FIELD RESEARCH: 5 DIVERSE USER EVALUATIONS"
    p.font.name = 'Calibri'
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CRIMSON

    tb_ht = s4.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.3), Inches(0.7))
    p = tb_ht.text_frame.paragraphs[0]
    p.text = "Uncovering the 'Post-Payment Receipt Void' Across Bharat"
    p.font.name = 'Georgia'
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_DARK

    users = [
        ("Pt. Harishankar Dwivedi", "Coaching Director, Varanasi", "Low (Traditional)", "Loved 1-tap polite Hindi WhatsApp reminder; confused by modal closing at 0ms with no receipt slip!"),
        ("Priya Deshmukh", "STEM Tutor, Pune", "High (Gen-Z UPI)", "Loved dynamic UPI QR with roll note (tn=); confused by lack of post-payment WhatsApp share sheet."),
        ("Ramanathan Iyer", "Accounts Clerk, Madurai", "Mid (Desktop Tally)", "Loved instant Fee Ledger search; confused by absence of sequential voucher numbers (REC-xxxx) and print CSS."),
        ("Ananya Mukhopadhyay", "Batch Teacher, Durgapur", "Mid-Low (2G Class)", "Loved 2G offline register (35 students in 4s); panicked during 10m break when receipt couldn't be sent immediately."),
        ("Qasim Ali Khan", "Managing Trustee, Aligarh", "Executive (Non-Tech)", "Loved Unpaid Months debt aging; demanded tamper-evident digital receipts to prevent clerk cash theft.")
    ]

    for i, (name, role, level, quote) in enumerate(users):
        top = Inches(1.8 + i * 0.98)
        add_card(s4, Inches(1.0), top, Inches(11.333), Inches(0.88), C_WHITE, border_color=C_LIGHT_GRAY)
        tb_u = s4.shapes.add_textbox(Inches(1.2), top + Inches(0.08), Inches(11.0), Inches(0.75))
        tf = tb_u.text_frame
        p0 = tf.paragraphs[0]
        add_run_text(p0, f"{name} ", bold=True, size=Pt(13), color=C_DARK)
        add_run_text(p0, f"({role} · {level})", bold=False, size=Pt(11), color=C_INDIGO)
        p1 = tf.add_paragraph()
        p1.text = f"Feedback: {quote}"
        p1.font.name = 'Calibri'
        p1.font.size = Pt(11)
        p1.font.color.rgb = C_GRAY

    # =========================================================================
    # SLIDE 5: THE REFINEMENT
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5, C_WARM)

    tb_h = s5.shapes.add_textbox(Inches(1.0), Inches(0.6), Inches(11.3), Inches(0.4))
    p = tb_h.text_frame.paragraphs[0]
    p.text = "THE REFINEMENT: DIGITAL FEE RECEIPT VOUCHER & UNIVERSAL SEARCH"
    p.font.name = 'Calibri'
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CRIMSON

    tb_ht = s5.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.3), Inches(0.7))
    p = tb_ht.text_frame.paragraphs[0]
    p.text = "Fixing the Core Friction Identified Across All 5 Personas"
    p.font.name = 'Georgia'
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_DARK

    # Feature 1 Box
    add_card(s5, Inches(1.0), Inches(1.8), Inches(5.4), Inches(4.9), C_WHITE, border_color=C_EMERALD)
    tb_r1 = s5.shapes.add_textbox(Inches(1.3), Inches(2.0), Inches(4.8), Inches(4.5))
    tf1 = tb_r1.text_frame
    p0 = tf1.paragraphs[0]
    p0.text = "🧾 FeeReceiptModal.jsx (Digital Voucher Engine)"
    p0.font.name = 'Calibri'
    p0.font.size = Pt(17)
    p0.font.bold = True
    p0.font.color.rgb = C_EMERALD

    r_bullets = [
        ("Instant Post-Payment Transition:", " When teacher clicks 'Confirm & Mark as Paid', the modal seamlessly opens the official receipt."),
        ("Sequential Voucher Numbering:", " Automatically generates audit-ready reference IDs (e.g. REC-2026-08412)."),
        ("1-Tap WhatsApp Receipt (wa.me):", " Formats a polite bilingual confirmation with full voucher breakdown directly to parent's phone."),
        ("Watermark & Print CSS:", " Includes 'PAID • रसीद' stamp, amount in Indian currency words, and @media print for 80mm thermal receipt printers.")
    ]
    for b_title, b_desc in r_bullets:
        p_b = tf1.add_paragraph()
        p_b.space_before = Pt(8)
        add_run_text(p_b, f"• {b_title}", bold=True, size=Pt(12.5), color=C_DARK)
        add_run_text(p_b, b_desc, bold=False, size=Pt(11.5), color=C_GRAY)

    # Feature 2 Box
    add_card(s5, Inches(6.9), Inches(1.8), Inches(5.4), Inches(4.9), C_WHITE, border_color=C_INDIGO)
    tb_r2 = s5.shapes.add_textbox(Inches(7.2), Inches(2.0), Inches(4.8), Inches(4.5))
    tf2 = tb_r2.text_frame
    p0 = tf2.paragraphs[0]
    p0.text = "🔍 Universal Quick Student Search (Dashboard)"
    p0.font.name = 'Calibri'
    p0.font.size = Pt(17)
    p0.font.bold = True
    p0.font.color.rgb = C_INDIGO

    s_bullets = [
        ("Sub-Millisecond Multi-Search:", " Searches student name, roll number, or parent mobile instantly on the Dashboard overview."),
        ("Live Debt Aging Card:", " Shows batch, guardian contact, and pending amount (e.g. '₹2,500 Due · 1 month')."),
        ("1-Tap 'Pay & Receipt' Action:", " Teachers can collect fee, show dynamic QR, and generate official voucher without leaving home screen."),
        ("Zero Tab Navigation Friction:", " Eliminates the 5-step navigation sequence previously required during busy classroom breaks.")
    ]
    for b_title, b_desc in s_bullets:
        p_b = tf2.add_paragraph()
        p_b.space_before = Pt(8)
        add_run_text(p_b, f"• {b_title}", bold=True, size=Pt(12.5), color=C_DARK)
        add_run_text(p_b, b_desc, bold=False, size=Pt(11.5), color=C_GRAY)

    # =========================================================================
    # SLIDE 6: LIVE DEMO TRANSITION
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6, C_DARK)

    tb_dt = s6.shapes.add_textbox(Inches(1.0), Inches(1.3), Inches(11.3), Inches(0.5))
    p = tb_dt.text_frame.paragraphs[0]
    p.text = "LIVE PRODUCT DEMONSTRATION"
    p.font.name = 'Calibri'
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 205, 211)

    tb_dmain = s6.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.3), Inches(1.8))
    p = tb_dmain.text_frame.paragraphs[0]
    p.text = "Switching to Live Application Demo"
    p.font.name = 'Georgia'
    p.font.size = Pt(46)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    tb_dlink = s6.shapes.add_textbox(Inches(1.0), Inches(3.6), Inches(11.3), Inches(0.8))
    p = tb_dlink.text_frame.paragraphs[0]
    p.text = "Production URL: https://feeremindersupabasedeploy.vercel.app/"
    p.font.name = 'Calibri'
    p.font.size = Pt(20)
    p.font.color.rgb = RGBColor(147, 197, 253)

    stops = [
        ("1. Dashboard Universal Search", "Type 'Aarav' -> instant match in 0ms"),
        ("2. Instant Fee Receipt Voucher", "Record payment -> official voucher & WhatsApp"),
        ("3. 2G Offline Attendance", "'Mark All Present' logs 35 students in 0ms"),
        ("4. Shielded Gemini AI Copilot", "Natural language financial intelligence queries")
    ]
    for i, (st_t, st_d) in enumerate(stops):
        left = Inches(1.0 + i * 2.85)
        add_card(s6, left, Inches(4.7), Inches(2.7), Inches(1.7), RGBColor(45, 40, 38), border_color=C_EMERALD)
        tb_st = s6.shapes.add_textbox(left + Inches(0.15), Inches(4.85), Inches(2.4), Inches(1.4))
        p0 = tb_st.text_frame.paragraphs[0]
        p0.text = st_t
        p0.font.name = 'Calibri'
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = C_WHITE
        p1 = tb_st.text_frame.add_paragraph()
        p1.text = st_d
        p1.font.name = 'Calibri'
        p1.font.size = Pt(11)
        p1.font.color.rgb = RGBColor(200, 200, 200)

    # =========================================================================
    # SLIDE 7: ECONOMIC IMPACT & CLOSING
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7, C_CRIMSON)

    tb_cl = s7.shapes.add_textbox(Inches(1.0), Inches(0.7), Inches(11.3), Inches(0.5))
    p = tb_cl.text_frame.paragraphs[0]
    p.text = "MEASURABLE IMPACT FOR BHARAT'S EDUCATORS"
    p.font.name = 'Calibri'
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 205, 211)

    tb_clt = s7.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.3), Inches(1.2))
    p = tb_clt.text_frame.paragraphs[0]
    p.text = "Turning Fee Collection from an Awkward Chore into a 10-Second Digital Habit"
    p.font.name = 'Georgia'
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    metrics = [
        ("₹84,960", "Direct Annual Savings", "Saved per 185 students by eliminating Razorpay 2.36% gateway commission taxes"),
        ("10h ➔ 30m", "Admin Time Reduced", "Weekly fee tracking and phone calls reduced from 10+ hours to under 30 minutes"),
        ("25d ➔ 7d", "Default Cycle Shortened", "Polite WhatsApp reminders cut average fee delay from 25 days to under 7 days")
    ]
    for i, (m_val, m_title, m_desc) in enumerate(metrics):
        left = Inches(1.0 + i * 3.85)
        add_card(s7, left, Inches(2.9), Inches(3.6), Inches(2.9), RGBColor(114, 28, 22), border_color=RGBColor(248, 113, 113))
        tb_m = s7.shapes.add_textbox(left + Inches(0.2), Inches(3.1), Inches(3.2), Inches(2.5))
        p0 = tb_m.text_frame.paragraphs[0]
        p0.text = m_val
        p0.font.name = 'Georgia'
        p0.font.size = Pt(40)
        p0.font.bold = True
        p0.font.color.rgb = RGBColor(254, 243, 199)
        p1 = tb_m.text_frame.add_paragraph()
        p1.text = m_title
        p1.font.name = 'Calibri'
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = C_WHITE
        p2 = tb_m.text_frame.add_paragraph()
        p2.space_before = Pt(6)
        p2.text = m_desc
        p2.font.name = 'Calibri'
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = RGBColor(254, 226, 226)

    tb_sig = s7.shapes.add_textbox(Inches(1.0), Inches(6.45), Inches(11.3), Inches(0.5))
    p = tb_sig.text_frame.paragraphs[0]
    p.text = "EduManage Bharat · AI Genesis Challenge 2026 · Aman · Alta School of Technology"
    p.font.name = 'Calibri'
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 205, 211)

    out_file = "EduManage_Bharat_Hackathon_Pitch.pptx"
    out_path = os.path.abspath(out_file)
    prs.save(out_path)
    print(f"Presentation saved successfully to: {out_path}")

    docs_path = os.path.abspath(f"docs/{out_file}")
    artifact_dir = r"C:\Users\amanm\.gemini\antigravity\brain\a4541b06-2c7c-46e1-8da5-5804293eb341"
    artifact_path = os.path.join(artifact_dir, out_file)
    try:
        shutil.copyfile(out_path, docs_path)
        print(f"Copied to docs: {docs_path}")
    except Exception as e:
        print(f"Docs copy error: {e}")
    try:
        shutil.copyfile(out_path, artifact_path)
        print(f"Copied to artifact dir: {artifact_path}")
    except Exception as e:
        print(f"Artifact copy error: {e}")

if __name__ == '__main__':
    create_presentation()
