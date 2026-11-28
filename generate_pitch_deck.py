import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def append_run(p, text, bold=False, font_name='Segoe UI', size=Pt(12), color=None):
    r = p.add_run()
    r.text = text
    r.font.bold = bold
    if font_name:
        r.font.name = font_name
    if size:
        r.font.size = size
    if color:
        r.font.color.rgb = color
    return r

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Color Palette
    C_CRIMSON = RGBColor(139, 38, 30)        # #8B261E Brand Crimson
    C_DARK = RGBColor(24, 24, 27)            # #18181B Zinc-900
    C_WARM = RGBColor(250, 247, 242)         # #FAF7F2 Warm Paper
    C_WHITE = RGBColor(255, 255, 255)
    C_INDIGO = RGBColor(55, 48, 163)         # #3730A3 Royal Indigo
    C_EMERALD = RGBColor(21, 128, 61)        # #15803D Forest Emerald
    C_AMBER = RGBColor(217, 119, 6)          # #D97706 Warm Amber
    C_GRAY = RGBColor(82, 82, 91)            # #52525B Zinc-600
    C_LIGHT_BORDER = RGBColor(228, 228, 231) # #E4E4E7 Zinc-200

    FONT_HEAD = 'Trebuchet MS'
    FONT_BODY = 'Segoe UI'

    # Background helper
    def add_bg(slide, color):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    # Card container helper
    def add_card(slide, left, top, width, height, fill_color=C_WHITE, border_color=C_LIGHT_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # Standard Slide Header helper for Slides 2-5 & 7
    def add_slide_header(slide, category_text, title_text):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.733), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = category_text.upper()
        p0.font.name = FONT_HEAD
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.color.rgb = C_CRIMSON

        p1 = tf.add_paragraph()
        p1.space_before = Pt(3)
        p1.text = title_text
        p1.font.name = FONT_HEAD
        p1.font.size = Pt(26)
        p1.font.bold = True
        p1.font.color.rgb = C_DARK

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Hero Layout with Real App Screenshot Graphic)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, C_CRIMSON)

    # Left Column: Brand & Value Pitch (Inches 0.8 to 7.8)
    tb_s1_left = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(7.2), Inches(5.8))
    tf1 = tb_s1_left.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_badge = tf1.paragraphs[0]
    p_badge.text = "AI GENESIS CHALLENGE 2026 · ALTA SCHOOL OF TECHNOLOGY"
    p_badge.font.name = FONT_HEAD
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = RGBColor(254, 205, 211)

    p_title = tf1.add_paragraph()
    p_title.space_before = Pt(10)
    p_title.text = "EduManage Bharat"
    p_title.font.name = FONT_HEAD
    p_title.font.size = Pt(46)
    p_title.font.bold = True
    p_title.font.color.rgb = C_WHITE

    p_tag = tf1.add_paragraph()
    p_tag.space_before = Pt(8)
    p_tag.text = "Zero-Commission Direct Bank UPI Fee Engine,\n2G Offline Attendance Register & AI Operations Copilot"
    p_tag.font.name = FONT_BODY
    p_tag.font.size = Pt(17)
    p_tag.font.bold = True
    p_tag.font.color.rgb = RGBColor(254, 243, 199)

    p_sub = tf1.add_paragraph()
    p_sub.space_before = Pt(10)
    p_sub.text = "Built for India's 250,000+ budget coaching institutes and independent tutors."
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(13)
    p_sub.font.color.rgb = RGBColor(254, 226, 226)

    p_badges = tf1.add_paragraph()
    p_badges.space_before = Pt(20)
    p_badges.text = "✦ 0% Commission Bank UPI    ✦ 1-Tap WhatsApp Receipts    ✦ 2G Offline Register"
    p_badges.font.name = FONT_HEAD
    p_badges.font.size = Pt(12)
    p_badges.font.bold = True
    p_badges.font.color.rgb = C_WHITE

    p_pres = tf1.add_paragraph()
    p_pres.space_before = Pt(28)
    p_pres.text = "Presented by Aman  |  Live App: feeremindersupabasedeploy.vercel.app"
    p_pres.font.name = FONT_BODY
    p_pres.font.size = Pt(11.5)
    p_pres.font.color.rgb = RGBColor(254, 205, 211)

    # Right Column: High-Res App Preview Card
    promo_img_path = 'client/public/videos/test_upi_still.png'
    if not os.path.exists(promo_img_path):
        promo_img_path = 'remotion-video/out/test_upi_still.png'

    add_card(s1, Inches(8.3), Inches(0.8), Inches(4.3), Inches(5.9), fill_color=RGBColor(114, 28, 22), border_color=RGBColor(248, 113, 113))
    if os.path.exists(promo_img_path):
        s1.shapes.add_picture(promo_img_path, Inches(8.45), Inches(0.95), Inches(4.0), Inches(5.6))

    # =========================================================================
    # SLIDE 2: THE PROBLEM (Aligned Cards with Clean Spacing)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2, C_WARM)
    add_slide_header(s2, "The Real-World Problem", "Tier-2 & Tier-3 Bharat's Dual Education Dilemma")

    # Card 1: The Gateway Tax
    add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1), C_WHITE, border_color=C_CRIMSON)
    tb_c1 = s2.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.1), Inches(4.6))
    tfc1 = tb_c1.text_frame
    tfc1.word_wrap = True
    tfc1.margin_left = tfc1.margin_top = tfc1.margin_right = tfc1.margin_bottom = 0

    p_c1_h = tfc1.paragraphs[0]
    p_c1_h.text = "💸  The 2.36% Gateway Tax Siphon"
    p_c1_h.font.name = FONT_HEAD
    p_c1_h.font.size = Pt(18)
    p_c1_h.font.bold = True
    p_c1_h.font.color.rgb = C_CRIMSON

    bullets1 = [
        ("₹84,960 Lost Yearly", "Commercial gateways (Razorpay, Cashfree) deduct 2.0% + 18% GST on every tuition fee payment."),
        ("Mandatory GST / KYC Barrier", "Independent tutors and unaccredited coaching academies are rejected without corporate registration."),
        ("T+2 Delayed Settlement", "Educators in rented classrooms wait 48 to 72 hours for funds to clear into their accounts.")
    ]
    for b_title, b_desc in bullets1:
        p_t = tfc1.add_paragraph()
        p_t.space_before = Pt(14)
        append_run(p_t, f"• {b_title}: ", bold=True, font_name=FONT_HEAD, size=Pt(13), color=C_DARK)
        append_run(p_t, b_desc, bold=False, font_name=FONT_BODY, size=Pt(12), color=C_GRAY)

    # Card 2: Behavioral Discomfort & 2G Reality
    add_card(s2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), C_WHITE, border_color=C_INDIGO)
    tb_c2 = s2.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(4.6))
    tfc2 = tb_c2.text_frame
    tfc2.word_wrap = True
    tfc2.margin_left = tfc2.margin_top = tfc2.margin_right = tfc2.margin_bottom = 0

    p_c2_h = tfc2.paragraphs[0]
    p_c2_h.text = "📞  Behavioral Friction & 2G Chaos"
    p_c2_h.font.name = FONT_HEAD
    p_c2_h.font.size = Pt(18)
    p_c2_h.font.bold = True
    p_c2_h.font.color.rgb = C_INDIGO

    bullets2 = [
        ("10+ Hours Chasing Fees", "Teachers spend awkward Sunday evenings making uncomfortable calls to parents asking for money."),
        ("Bahi-Khata Paper Chaos", "Scratched paper diaries lead to multi-month fee disputes and chronic student dropouts."),
        ("Basement 2G Blackouts", "Network signals drop in concrete classrooms, causing heavy enterprise ERP portals to freeze.")
    ]
    for b_title, b_desc in bullets2:
        p_t = tfc2.add_paragraph()
        p_t.space_before = Pt(14)
        append_run(p_t, f"• {b_title}: ", bold=True, font_name=FONT_HEAD, size=Pt(13), color=C_DARK)
        append_run(p_t, b_desc, bold=False, font_name=FONT_BODY, size=Pt(12), color=C_GRAY)

    # =========================================================================
    # SLIDE 3: THE ARCHITECTURE & SYSTEM (With Real UI Image)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3, C_WARM)
    add_slide_header(s3, "System Architecture", "Direct Bank UPI & Dynamic QR Engine (0% Tax)")

    arch_specs = [
        ("Direct NPCI Bank UPI Protocol", "Generates native upi://pay intent links straight to teacher's savings account. T+0 instant credit, 0% fees, zero merchant setup."),
        ("Dynamic Balance QR Codes", "HTML5 canvas embeds exact overdue balance and student roll number in transaction note (tn=Roll1003_OctFee) to prevent mystery bank credits."),
        ("Shielded Gemini AI Operations Proxy", "Proxied behind Vercel serverless layer (/api/ai-chat) protecting API keys and providing live debt aging and financial synthesis.")
    ]

    for i, (spec_h, spec_d) in enumerate(arch_specs):
        top_pos = Inches(1.8 + i * 1.7)
        add_card(s3, Inches(0.8), top_pos, Inches(7.4), Inches(1.5), C_WHITE, border_color=C_EMERALD if i == 0 else C_LIGHT_BORDER)
        tb_s = s3.shapes.add_textbox(Inches(1.05), top_pos + Inches(0.18), Inches(6.9), Inches(1.15))
        tf = tb_s.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p0 = tf.paragraphs[0]
        p0.text = f"0{i+1}. {spec_h}"
        p0.font.name = FONT_HEAD
        p0.font.size = Pt(15)
        p0.font.bold = True
        p0.font.color.rgb = C_EMERALD if i == 0 else C_INDIGO
        p1 = tf.add_paragraph()
        p1.space_before = Pt(4)
        p1.text = spec_d
        p1.font.name = FONT_BODY
        p1.font.size = Pt(11.5)
        p1.font.color.rgb = C_GRAY

    # Right: Mobile UI Screen Mockup
    ui_send_reminder = 'docs/UI/stitch_feereminder_mobile_app/send_fee_reminder/screen.png'
    add_card(s3, Inches(8.5), Inches(1.8), Inches(4.0), Inches(5.1), C_WHITE, border_color=C_INDIGO)
    if os.path.exists(ui_send_reminder):
        s3.shapes.add_picture(ui_send_reminder, Inches(8.65), Inches(1.95), Inches(3.7), Inches(4.8))

    # =========================================================================
    # SLIDE 4: 5 DIVERSE USER EVALUATIONS (Aligned Table Cards)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4, C_WARM)
    add_slide_header(s4, "Primary Field Research", "Tested with 5 Diverse Real-World Personas Across Bharat")

    users_data = [
        ("1. Pt. Harishankar Dwivedi", "Coaching Director, Varanasi", "Low (Traditional)",
         "Loved 1-tap polite Hindi WhatsApp reminder.", "Modal closed at 0ms with no receipt generated!"),
        ("2. Priya Deshmukh", "STEM Tutor, Pune", "High (Gen-Z UPI)",
         "Loved dynamic QR with roll note (tn=).", "No post-payment confirmation or WhatsApp share sheet."),
        ("3. Ramanathan Iyer", "Accounts Clerk, Madurai", "Mid (Desktop Tally)",
         "Loved instant multi-parameter search filtering.", "No sequential voucher numbers (REC-xxxx) or print slip CSS."),
        ("4. Ananya Mukhopadhyay", "Batch Teacher, Durgapur", "Mid-Low (2G Class)",
         "Loved 2G offline register (35 students in 4s).", "Could not send instant WhatsApp receipt during 10m break."),
        ("5. Qasim Ali Khan", "Managing Trustee, Aligarh", "Executive (Non-Tech)",
         "Loved Unpaid Months debt aging breakdown.", "Lacked tamper-evident receipts to prevent clerk cash theft.")
    ]

    for i, (name, role, level, liked, confused) in enumerate(users_data):
        top_u = Inches(1.8 + i * 1.02)
        add_card(s4, Inches(0.8), top_u, Inches(11.733), Inches(0.92), C_WHITE, border_color=C_LIGHT_BORDER)
        tb_u = s4.shapes.add_textbox(Inches(1.0), top_u + Inches(0.08), Inches(11.3), Inches(0.76))
        tf = tb_u.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        append_run(p0, f"{name}  ", bold=True, font_name=FONT_HEAD, size=Pt(13), color=C_DARK)
        append_run(p0, f"({role} · {level})", bold=False, font_name=FONT_BODY, size=Pt(11), color=C_INDIGO)

        p1 = tf.add_paragraph()
        p1.space_before = Pt(3)
        append_run(p1, "✓ LIKED: ", bold=True, font_name=FONT_HEAD, size=Pt(10.5), color=C_EMERALD)
        append_run(p1, f"{liked}   ", bold=False, font_name=FONT_BODY, size=Pt(10.5), color=C_DARK)
        append_run(p1, "✗ CONFUSED: ", bold=True, font_name=FONT_HEAD, size=Pt(10.5), color=C_CRIMSON)
        append_run(p1, confused, bold=False, font_name=FONT_BODY, size=Pt(10.5), color=C_DARK)

    # =========================================================================
    # SLIDE 5: THE REFINEMENT (With Payment Screen Image)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5, C_WARM)
    add_slide_header(s5, "Product Refinement", "Official Digital Fee Receipt Engine & Universal Search")

    # Left: 2 Detailed Feature Cards
    add_card(s5, Inches(0.8), Inches(1.8), Inches(7.5), Inches(2.45), C_WHITE, border_color=C_EMERALD)
    tb_rf1 = s5.shapes.add_textbox(Inches(1.05), Inches(1.95), Inches(7.0), Inches(2.15))
    tf1 = tb_rf1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_rf1_h = tf1.paragraphs[0]
    p_rf1_h.text = "🧾  FeeReceiptModal.jsx (Digital Voucher Engine)"
    p_rf1_h.font.name = FONT_HEAD
    p_rf1_h.font.size = Pt(15.5)
    p_rf1_h.font.bold = True
    p_rf1_h.font.color.rgb = C_EMERALD

    rf_bullets = [
        "Instant Transition: Clicking 'Confirm & Mark as Paid' immediately triggers onPaymentSuccess, launching the receipt.",
        "Sequential Voucher No: Automatically creates audit-ready IDs (e.g. REC-2026-08412) with 'PAID • रसीद' stamp.",
        "1-Tap WhatsApp Receipt: Formats official bilingual confirmation with amount in Indian words straight to parent via wa.me.",
        "Thermal & A4 Print CSS: Built-in @media print stylesheet isolates receipt for 1-click POS slip printing."
    ]
    for b in rf_bullets:
        p_b = tf1.add_paragraph()
        p_b.space_before = Pt(3)
        p_b.text = f"• {b}"
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(11)
        p_b.font.color.rgb = C_DARK

    # Feature 2 Card
    add_card(s5, Inches(0.8), Inches(4.45), Inches(7.5), Inches(2.45), C_WHITE, border_color=C_INDIGO)
    tb_rf2 = s5.shapes.add_textbox(Inches(1.05), Inches(4.6), Inches(7.0), Inches(2.15))
    tf2 = tb_rf2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p_rf2_h = tf2.paragraphs[0]
    p_rf2_h.text = "🔍  Universal Quick Student Search (Dashboard)"
    p_rf2_h.font.name = FONT_HEAD
    p_rf2_h.font.size = Pt(15.5)
    p_rf2_h.font.bold = True
    p_rf2_h.font.color.rgb = C_INDIGO

    s_bullets = [
        "1ms Multi-Search: Searches student name, roll number, or parent mobile number right on the Dashboard overview.",
        "Live Debt Status: Displays batch, parent contact, and debt aging (e.g. '₹2,500 Due · 1 month').",
        "1-Tap 'Pay & Receipt': Collect fee and generate official voucher without leaving the home screen.",
        "Zero Navigation Friction: Eliminates the 5-step navigation sequence previously required during short breaks."
    ]
    for b in s_bullets:
        p_b = tf2.add_paragraph()
        p_b.space_before = Pt(3)
        p_b.text = f"• {b}"
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(11)
        p_b.font.color.rgb = C_DARK

    # Right: Mobile UI Screen Mockup
    ui_mark_paid = 'docs/UI/stitch_feereminder_mobile_app/mark_fee_as_paid/screen.png'
    add_card(s5, Inches(8.6), Inches(1.8), Inches(3.9), Inches(5.1), C_WHITE, border_color=C_EMERALD)
    if os.path.exists(ui_mark_paid):
        s5.shapes.add_picture(ui_mark_paid, Inches(8.75), Inches(1.95), Inches(3.6), Inches(4.8))

    # =========================================================================
    # SLIDE 6: LIVE DEMO TRANSITION (Dark Mode with Real Dashboard Preview)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6, C_DARK)

    # Left Column: Demo Cues
    tb_d_left = s6.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(7.5), Inches(5.8))
    tfd = tb_d_left.text_frame
    tfd.word_wrap = True
    tfd.margin_left = tfd.margin_top = tfd.margin_right = tfd.margin_bottom = 0

    p_dt = tfd.paragraphs[0]
    p_dt.text = "LIVE PRODUCT DEMONSTRATION"
    p_dt.font.name = FONT_HEAD
    p_dt.font.size = Pt(12)
    p_dt.font.bold = True
    p_dt.font.color.rgb = RGBColor(254, 205, 211)

    p_dm = tfd.add_paragraph()
    p_dm.space_before = Pt(8)
    p_dm.text = "Switching to Live Application Demo"
    p_dm.font.name = FONT_HEAD
    p_dm.font.size = Pt(36)
    p_dm.font.bold = True
    p_dm.font.color.rgb = C_WHITE

    p_dl = tfd.add_paragraph()
    p_dl.space_before = Pt(8)
    p_dl.text = "Production URL: https://feeremindersupabasedeploy.vercel.app/"
    p_dl.font.name = FONT_HEAD
    p_dl.font.size = Pt(16)
    p_dl.font.color.rgb = RGBColor(147, 197, 253)

    stops = [
        ("1. Dashboard Universal Search", "Type 'Aarav' ➔ instant match in 0ms on home screen"),
        ("2. Instant Fee Receipt Voucher", "Record payment ➔ official voucher & 1-tap WhatsApp"),
        ("3. 2G Offline Attendance Register", "Tap 'Mark All Present' ➔ 35 students marked in 0.4s"),
        ("4. Shielded Gemini AI Copilot", "Ask financial debt queries in plain English or Hindi")
    ]
    for st_t, st_d in stops:
        p_st = tfd.add_paragraph()
        p_st.space_before = Pt(14)
        append_run(p_st, f"✓ {st_t}: ", bold=True, font_name=FONT_HEAD, size=Pt(13), color=RGBColor(52, 211, 153))
        append_run(p_st, st_d, bold=False, font_name=FONT_BODY, size=Pt(12), color=RGBColor(212, 212, 216))

    # Right Column: Dashboard UI Preview
    ui_dashboard = 'docs/UI/stitch_feereminder_mobile_app/dashboard/screen.png'
    add_card(s6, Inches(8.6), Inches(0.8), Inches(3.9), Inches(5.8), RGBColor(39, 39, 42), border_color=RGBColor(52, 211, 153))
    if os.path.exists(ui_dashboard):
        s6.shapes.add_picture(ui_dashboard, Inches(8.75), Inches(0.95), Inches(3.6), Inches(5.5))

    # =========================================================================
    # SLIDE 7: ECONOMIC IMPACT & CLOSING
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7, C_CRIMSON)

    tb_cl = s7.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(0.4))
    p = tb_cl.text_frame.paragraphs[0]
    p.text = "MEASURABLE IMPACT FOR BHARAT'S EDUCATORS"
    p.font.name = FONT_HEAD
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 205, 211)

    tb_clt = s7.shapes.add_textbox(Inches(0.8), Inches(1.0), Inches(11.733), Inches(1.0))
    p = tb_clt.text_frame.paragraphs[0]
    p.text = "Turning Fee Collection from an Awkward Chore into a 10-Second Digital Habit"
    p.font.name = FONT_HEAD
    p.font.size = Pt(30)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    # 3 Giant Aligned Impact Cards
    impacts = [
        ("₹84,960", "Direct Annual Savings", "Saved per 185 students by completely bypassing 2.36% commercial gateway cuts."),
        ("10h ➔ 30m", "Admin Time Reduced", "Weekly fee tracking, ledger updates, and parent calls reduced from 10+ hours to under 30 minutes."),
        ("25d ➔ 7d", "Default Cycle Shortened", "Polite bilingual WhatsApp reminders cut the average fee delay from 25 days past due to under 7 days.")
    ]

    for i, (m_val, m_title, m_desc) in enumerate(impacts):
        left_m = Inches(0.8 + i * 4.0)
        add_card(s7, left_m, Inches(2.2), Inches(3.7), Inches(4.3), fill_color=RGBColor(114, 28, 22), border_color=RGBColor(248, 113, 113))
        tb_m = s7.shapes.add_textbox(left_m + Inches(0.25), Inches(2.4), Inches(3.2), Inches(3.9))
        tf = tb_m.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = m_val
        p0.font.name = FONT_HEAD
        p0.font.size = Pt(38)
        p0.font.bold = True
        p0.font.color.rgb = RGBColor(254, 243, 199)

        p1 = tf.add_paragraph()
        p1.space_before = Pt(8)
        p1.text = m_title
        p1.font.name = FONT_HEAD
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = C_WHITE

        p2 = tf.add_paragraph()
        p2.space_before = Pt(12)
        p2.text = m_desc
        p2.font.name = FONT_BODY
        p2.font.size = Pt(12.5)
        p2.font.color.rgb = RGBColor(254, 226, 226)

    tb_sig = s7.shapes.add_textbox(Inches(0.8), Inches(6.75), Inches(11.733), Inches(0.4))
    p = tb_sig.text_frame.paragraphs[0]
    p.text = "EduManage Bharat · AI Genesis Challenge 2026 · Aman · Alta School of Technology"
    p.font.name = FONT_HEAD
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 205, 211)

    out_files = [
        "EduManage_Bharat_Pitch_Deck_Pro.pptx",
        "EduManage_Bharat_Hackathon_Presentation.pptx"
    ]
    for fn in out_files:
        p_out = os.path.abspath(fn)
        prs.save(p_out)
        print(f"Presentation saved successfully to: {p_out}")
        # copy to docs
        try:
            shutil.copyfile(p_out, os.path.abspath(f"docs/{fn}"))
        except Exception as e:
            print(f"Docs copy error: {e}")
        # copy to artifact
        try:
            shutil.copyfile(p_out, os.path.join(r"C:\Users\amanm\.gemini\antigravity\brain\a4541b06-2c7c-46e1-8da5-5804293eb341", fn))
        except Exception as e:
            print(f"Artifact copy error: {e}")

    # Also try original filename if unlocked
    try:
        prs.save(os.path.abspath("EduManage_Bharat_Hackathon_Pitch.pptx"))
        print("Also updated EduManage_Bharat_Hackathon_Pitch.pptx")
    except Exception as e:
        print(f"Note: EduManage_Bharat_Hackathon_Pitch.pptx is open in PowerPoint: {e}")

if __name__ == '__main__':
    create_presentation()
