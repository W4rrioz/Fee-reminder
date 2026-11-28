import os
import shutil
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def append_run(p, text, bold=False, font_name='Segoe UI', size=Pt(11), color=None):
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

def add_contained_image(slide, img_path, card_left, card_top, card_width, card_height, padding=Inches(0.15)):
    """
    Fits and centers an image inside a container card maintaining exact aspect ratio.
    Guarantees no distortion, no stretching, and zero clipping outside the card.
    """
    if not os.path.exists(img_path):
        return None
    
    with Image.open(img_path) as im:
        img_w, img_h = im.size
    
    ar = img_w / float(img_h)
    
    avail_w = card_width - 2 * padding
    avail_h = card_height - 2 * padding
    
    if (avail_w / avail_h) > ar:
        # Constrained by height
        target_h = avail_h
        target_w = target_h * ar
    else:
        # Constrained by width
        target_w = avail_w
        target_h = target_w / ar
        
    img_left = card_left + (card_width - target_w) / 2
    img_top = card_top + (card_height - target_h) / 2
    
    pic = slide.shapes.add_picture(img_path, img_left, img_top, width=target_w, height=target_h)
    return pic

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Brand Color Palette
    C_CRIMSON = RGBColor(139, 38, 30)        # #8B261E Brand Crimson
    C_DARK = RGBColor(24, 24, 27)            # #18181B Zinc-900
    C_WARM = RGBColor(250, 247, 242)         # #FAF7F2 Warm Paper
    C_WHITE = RGBColor(255, 255, 255)
    C_INDIGO = RGBColor(55, 48, 163)         # #3730A3 Royal Indigo
    C_EMERALD = RGBColor(21, 128, 61)        # #15803D Forest Emerald
    C_AMBER = RGBColor(217, 119, 6)          # #D97706 Warm Amber
    C_GRAY = RGBColor(82, 82, 91)            # #52525B Zinc-600
    C_LIGHT_BORDER = RGBColor(228, 228, 231) # #E4E4E7 Zinc-200
    C_CARD_BG = RGBColor(255, 255, 255)
    C_GOLD = RGBColor(254, 243, 199)         # #FEF3C7
    C_ROSE_TINT = RGBColor(254, 205, 211)    # #FECDD3

    FONT_HEAD = 'Trebuchet MS'
    FONT_BODY = 'Segoe UI'

    def add_bg(slide, color):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    def add_card(slide, left, top, width, height, fill_color=C_CARD_BG, border_color=C_LIGHT_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

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
        p1.font.size = Pt(25)
        p1.font.bold = True
        p1.font.color.rgb = C_DARK

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Hero Layout with Phone Mockup Frame)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, C_CRIMSON)

    # Left Column: Brand & Value Pitch (Inches 0.8 to 8.0, width 7.2)
    tb_s1_left = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(7.2), Inches(5.8))
    tf1 = tb_s1_left.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_badge = tf1.paragraphs[0]
    p_badge.text = "AI GENESIS CHALLENGE 2026 · ALTA SCHOOL OF TECHNOLOGY"
    p_badge.font.name = FONT_HEAD
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = C_ROSE_TINT

    p_title = tf1.add_paragraph()
    p_title.space_before = Pt(10)
    p_title.text = "EduManage Bharat"
    p_title.font.name = FONT_HEAD
    p_title.font.size = Pt(44)
    p_title.font.bold = True
    p_title.font.color.rgb = C_WHITE

    p_tag = tf1.add_paragraph()
    p_tag.space_before = Pt(8)
    p_tag.text = "Zero-Commission Direct Bank UPI Fee Engine,\n2G Offline Attendance Register & AI Operations Copilot"
    p_tag.font.name = FONT_BODY
    p_tag.font.size = Pt(16)
    p_tag.font.bold = True
    p_tag.font.color.rgb = C_GOLD

    p_sub = tf1.add_paragraph()
    p_sub.space_before = Pt(10)
    p_sub.text = "Built for India's 250,000+ budget coaching institutes and independent tutors."
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(12.5)
    p_sub.font.color.rgb = RGBColor(254, 226, 226)

    p_badges = tf1.add_paragraph()
    p_badges.space_before = Pt(18)
    p_badges.text = "✦ 0% Commission Bank UPI    ✦ 1-Tap WhatsApp Receipts    ✦ 2G Offline Register"
    p_badges.font.name = FONT_HEAD
    p_badges.font.size = Pt(11.5)
    p_badges.font.bold = True
    p_badges.font.color.rgb = C_WHITE

    p_pres = tf1.add_paragraph()
    p_pres.space_before = Pt(26)
    p_pres.text = "Presented by Aman  |  Live App: feeremindersupabasedeploy.vercel.app"
    p_pres.font.name = FONT_BODY
    p_pres.font.size = Pt(11)
    p_pres.font.color.rgb = C_ROSE_TINT

    # Right Column: Phone Mockup Container Card
    card_s1_w = Inches(4.3)
    card_s1_h = Inches(5.8)
    card_s1_l = Inches(8.2)
    card_s1_t = Inches(0.8)
    add_card(s1, card_s1_l, card_s1_t, card_s1_w, card_s1_h, fill_color=RGBColor(114, 28, 22), border_color=RGBColor(248, 113, 113))
    
    phone_frame_path = 'docs/UI/stitch_feereminder_mobile_app/dashboard/screen_phone_frame.png'
    if not os.path.exists(phone_frame_path):
        phone_frame_path = 'docs/UI/stitch_feereminder_mobile_app/send_fee_reminder/screen.png'
    add_contained_image(s1, phone_frame_path, card_s1_l, card_s1_t, card_s1_w, card_s1_h, padding=Inches(0.18))

    # =========================================================================
    # SLIDE 2: THE PROBLEM (2-Column Comparative Cards with Zero Text Overflow)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2, C_WARM)
    add_slide_header(s2, "The Real-World Problem", "Tier-2 & Tier-3 Bharat's Dual Education Dilemma")

    # Card 1: The Gateway Tax (Left Column)
    c1_left, c1_top, c1_w, c1_h = Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1)
    add_card(s2, c1_left, c1_top, c1_w, c1_h, C_WHITE, border_color=C_CRIMSON)
    
    tb_c1 = s2.shapes.add_textbox(c1_left + Inches(0.25), c1_top + Inches(0.22), c1_w - Inches(0.5), c1_h - Inches(0.44))
    tfc1 = tb_c1.text_frame
    tfc1.word_wrap = True
    tfc1.margin_left = tfc1.margin_top = tfc1.margin_right = tfc1.margin_bottom = 0

    p_c1_h = tfc1.paragraphs[0]
    p_c1_h.text = "💸  The 2.36% Gateway Tax Siphon"
    p_c1_h.font.name = FONT_HEAD
    p_c1_h.font.size = Pt(17)
    p_c1_h.font.bold = True
    p_c1_h.font.color.rgb = C_CRIMSON

    bullets1 = [
        ("₹84,960 Lost Yearly", "Commercial gateways (Razorpay, Cashfree) deduct 2.0% + 18% GST on every tuition fee payment."),
        ("Mandatory GST / KYC Barrier", "Independent tutors and unaccredited coaching academies are rejected without corporate registration."),
        ("T+2 Delayed Settlement", "Educators in rented classrooms wait 48 to 72 hours for funds to clear into their accounts.")
    ]
    for b_title, b_desc in bullets1:
        p_t = tfc1.add_paragraph()
        p_t.space_before = Pt(12)
        append_run(p_t, f"• {b_title}: ", bold=True, font_name=FONT_HEAD, size=Pt(12), color=C_DARK)
        append_run(p_t, b_desc, bold=False, font_name=FONT_BODY, size=Pt(11), color=C_GRAY)

    # Card 2: Behavioral Discomfort & 2G Reality (Right Column)
    c2_left, c2_top, c2_w, c2_h = Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1)
    add_card(s2, c2_left, c2_top, c2_w, c2_h, C_WHITE, border_color=C_INDIGO)
    
    tb_c2 = s2.shapes.add_textbox(c2_left + Inches(0.25), c2_top + Inches(0.22), c2_w - Inches(0.5), c2_h - Inches(0.44))
    tfc2 = tb_c2.text_frame
    tfc2.word_wrap = True
    tfc2.margin_left = tfc2.margin_top = tfc2.margin_right = tfc2.margin_bottom = 0

    p_c2_h = tfc2.paragraphs[0]
    p_c2_h.text = "📞  Behavioral Friction & 2G Chaos"
    p_c2_h.font.name = FONT_HEAD
    p_c2_h.font.size = Pt(17)
    p_c2_h.font.bold = True
    p_c2_h.font.color.rgb = C_INDIGO

    bullets2 = [
        ("10+ Hours Chasing Fees", "Teachers spend awkward Sunday evenings making uncomfortable calls to parents asking for money."),
        ("Bahi-Khata Paper Chaos", "Scratched paper diaries lead to multi-month fee disputes and chronic student dropouts."),
        ("Basement 2G Blackouts", "Network signals drop in concrete classrooms, causing heavy enterprise ERP portals to freeze.")
    ]
    for b_title, b_desc in bullets2:
        p_t = tfc2.add_paragraph()
        p_t.space_before = Pt(12)
        append_run(p_t, f"• {b_title}: ", bold=True, font_name=FONT_HEAD, size=Pt(12), color=C_DARK)
        append_run(p_t, b_desc, bold=False, font_name=FONT_BODY, size=Pt(11), color=C_GRAY)

    # =========================================================================
    # SLIDE 3: SYSTEM ARCHITECTURE & DIRECT BANK UPI (With Sized Modal Image)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3, C_WARM)
    add_slide_header(s3, "System Architecture", "Direct Bank UPI & Dynamic QR Engine (0% Gateway Cut)")

    arch_specs = [
        ("Direct NPCI Bank UPI Protocol", "Generates native upi://pay intent links straight to teacher's savings account. T+0 instant credit, 0% fees, zero merchant setup."),
        ("Dynamic Balance QR Codes", "HTML5 canvas embeds exact overdue balance and student roll number in transaction note (tn=Roll1003_OctFee) to prevent mystery bank credits."),
        ("Shielded Gemini AI Operations Proxy", "Proxied behind Vercel serverless layer (/api/ai-chat) protecting API keys and providing live debt aging and financial synthesis.")
    ]

    for i, (spec_h, spec_d) in enumerate(arch_specs):
        top_pos = Inches(1.8 + i * 1.7)
        card_h = Inches(1.52)
        add_card(s3, Inches(0.8), top_pos, Inches(7.4), card_h, C_WHITE, border_color=C_EMERALD if i == 0 else C_LIGHT_BORDER)
        
        tb_s = s3.shapes.add_textbox(Inches(1.05), top_pos + Inches(0.16), Inches(6.9), card_h - Inches(0.32))
        tf = tb_s.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p0 = tf.paragraphs[0]
        p0.text = f"0{i+1}. {spec_h}"
        p0.font.name = FONT_HEAD
        p0.font.size = Pt(14)
        p0.font.bold = True
        p0.font.color.rgb = C_EMERALD if i == 0 else C_INDIGO
        
        p1 = tf.add_paragraph()
        p1.space_before = Pt(3)
        p1.text = spec_d
        p1.font.name = FONT_BODY
        p1.font.size = Pt(10.5)
        p1.font.color.rgb = C_GRAY

    # Right: Mobile UI Screen Mockup Container Card
    c3_img_l, c3_img_t, c3_img_w, c3_img_h = Inches(8.5), Inches(1.8), Inches(4.0), Inches(5.1)
    add_card(s3, c3_img_l, c3_img_t, c3_img_w, c3_img_h, C_WHITE, border_color=C_INDIGO)
    ui_send_reminder = 'docs/UI/stitch_feereminder_mobile_app/send_fee_reminder/screen.png'
    add_contained_image(s3, ui_send_reminder, c3_img_l, c3_img_t, c3_img_w, c3_img_h, padding=Inches(0.18))

    # =========================================================================
    # SLIDE 4: 5 DIVERSE USER EVALUATIONS (Strict Table Hierarchy, No Cutoffs)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4, C_WARM)
    add_slide_header(s4, "Primary Field Research", "Tested with 5 Diverse Real-World Personas Across Bharat")

    users_data = [
        ("1. Pt. Harishankar Dwivedi", "Coaching Director, Varanasi", "Low Tech (Traditional)",
         "Loved 1-tap polite Hindi WhatsApp reminder.", "Modal closed at 0ms with no receipt generated!"),
        ("2. Priya Deshmukh", "STEM Tutor, Pune", "High Tech (Gen-Z UPI)",
         "Loved dynamic QR with roll note (tn=).", "No post-payment confirmation or WhatsApp share sheet."),
        ("3. Ramanathan Iyer", "Accounts Clerk, Madurai", "Mid Tech (Desktop Tally)",
         "Loved instant multi-parameter search filtering.", "No sequential voucher numbers (REC-xxxx) or print slip CSS."),
        ("4. Ananya Mukhopadhyay", "Batch Teacher, Durgapur", "Mid-Low Tech (2G Class)",
         "Loved 2G offline register (35 students in 4s).", "Could not send instant WhatsApp receipt during 10m break."),
        ("5. Qasim Ali Khan", "Managing Trustee, Aligarh", "Executive (Non-Tech)",
         "Loved Unpaid Months debt aging breakdown.", "Lacked tamper-evident receipts to prevent clerk cash theft.")
    ]

    for i, (name, role, level, liked, confused) in enumerate(users_data):
        top_u = Inches(1.8 + i * 1.04)
        c_h = Inches(0.94)
        add_card(s4, Inches(0.8), top_u, Inches(11.733), c_h, C_WHITE, border_color=C_LIGHT_BORDER)
        
        tb_u = s4.shapes.add_textbox(Inches(1.05), top_u + Inches(0.09), Inches(11.2), c_h - Inches(0.18))
        tf = tb_u.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        append_run(p0, f"{name}  ", bold=True, font_name=FONT_HEAD, size=Pt(12), color=C_DARK)
        append_run(p0, f"({role} · {level})", bold=False, font_name=FONT_BODY, size=Pt(10.5), color=C_INDIGO)

        p1 = tf.add_paragraph()
        p1.space_before = Pt(2.5)
        append_run(p1, "✓ LIKED: ", bold=True, font_name=FONT_HEAD, size=Pt(9.5), color=C_EMERALD)
        append_run(p1, f"{liked}   ", bold=False, font_name=FONT_BODY, size=Pt(9.5), color=C_DARK)
        append_run(p1, "✗ CONFUSED: ", bold=True, font_name=FONT_HEAD, size=Pt(9.5), color=C_CRIMSON)
        append_run(p1, confused, bold=False, font_name=FONT_BODY, size=Pt(9.5), color=C_DARK)

    # =========================================================================
    # SLIDE 5: THE REFINEMENT (With Correctly Scaled Modal Screenshot)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5, C_WARM)
    add_slide_header(s5, "Product Refinement", "Official Digital Fee Receipt Engine & Universal Search")

    # Left: 2 Detailed Feature Cards
    rf1_h = Inches(2.45)
    add_card(s5, Inches(0.8), Inches(1.8), Inches(7.4), rf1_h, C_WHITE, border_color=C_EMERALD)
    tb_rf1 = s5.shapes.add_textbox(Inches(1.05), Inches(1.92), Inches(6.9), rf1_h - Inches(0.24))
    tf1 = tb_rf1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_rf1_h = tf1.paragraphs[0]
    p_rf1_h.text = "🧾  FeeReceiptModal.jsx (Digital Voucher Engine)"
    p_rf1_h.font.name = FONT_HEAD
    p_rf1_h.font.size = Pt(14.5)
    p_rf1_h.font.bold = True
    p_rf1_h.font.color.rgb = C_EMERALD

    rf_bullets = [
        "Instant Transition: Clicking 'Confirm & Mark as Paid' launches the voucher modal at once.",
        "Sequential Voucher No: Generates audit-ready IDs (REC-2026-xxxxx) with 'PAID • रसीद' stamp.",
        "1-Tap WhatsApp Receipt: Formats official bilingual confirmation with Indian words via wa.me.",
        "Thermal & A4 Print CSS: Built-in print stylesheet isolates receipt for 1-click POS slip printing."
    ]
    for b in rf_bullets:
        p_b = tf1.add_paragraph()
        p_b.space_before = Pt(2.5)
        p_b.text = f"• {b}"
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_DARK

    # Feature 2 Card
    rf2_h = Inches(2.45)
    add_card(s5, Inches(0.8), Inches(4.45), Inches(7.4), rf2_h, C_WHITE, border_color=C_INDIGO)
    tb_rf2 = s5.shapes.add_textbox(Inches(1.05), Inches(4.57), Inches(6.9), rf2_h - Inches(0.24))
    tf2 = tb_rf2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p_rf2_h = tf2.paragraphs[0]
    p_rf2_h.text = "🔍  Universal Quick Student Search (Dashboard)"
    p_rf2_h.font.name = FONT_HEAD
    p_rf2_h.font.size = Pt(14.5)
    p_rf2_h.font.bold = True
    p_rf2_h.font.color.rgb = C_INDIGO

    s_bullets = [
        "1ms Multi-Search: Searches student name, roll number, or parent mobile on Dashboard.",
        "Live Debt Status: Shows batch, parent phone, and debt aging (e.g. '₹2,500 Due · 1 mo').",
        "1-Tap 'Pay & Receipt': Collect fee and generate official voucher without leaving home screen.",
        "Zero Navigation Friction: Eliminates 5-step navigation sequence during 10-minute breaks."
    ]
    for b in s_bullets:
        p_b = tf2.add_paragraph()
        p_b.space_before = Pt(2.5)
        p_b.text = f"• {b}"
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_DARK

    # Right: Mobile UI Screen Mockup Container Card
    c5_img_l, c5_img_t, c5_img_w, c5_img_h = Inches(8.5), Inches(1.8), Inches(4.0), Inches(5.1)
    add_card(s5, c5_img_l, c5_img_t, c5_img_w, c5_img_h, C_WHITE, border_color=C_EMERALD)
    ui_mark_paid = 'docs/UI/stitch_feereminder_mobile_app/mark_fee_as_paid/screen.png'
    add_contained_image(s5, ui_mark_paid, c5_img_l, c5_img_t, c5_img_w, c5_img_h, padding=Inches(0.18))

    # =========================================================================
    # SLIDE 6: LIVE DEMO TRANSITION (Dark Mode with Mobile App Frame)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6, C_DARK)

    # Left Column: Demo Cues
    tb_d_left = s6.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(7.4), Inches(5.8))
    tfd = tb_d_left.text_frame
    tfd.word_wrap = True
    tfd.margin_left = tfd.margin_top = tfd.margin_right = tfd.margin_bottom = 0

    p_dt = tfd.paragraphs[0]
    p_dt.text = "LIVE PRODUCT DEMONSTRATION"
    p_dt.font.name = FONT_HEAD
    p_dt.font.size = Pt(11)
    p_dt.font.bold = True
    p_dt.font.color.rgb = C_ROSE_TINT

    p_dm = tfd.add_paragraph()
    p_dm.space_before = Pt(8)
    p_dm.text = "Switching to Live Application Demo"
    p_dm.font.name = FONT_HEAD
    p_dm.font.size = Pt(32)
    p_dm.font.bold = True
    p_dm.font.color.rgb = C_WHITE

    p_dl = tfd.add_paragraph()
    p_dl.space_before = Pt(8)
    p_dl.text = "Production URL: https://feeremindersupabasedeploy.vercel.app/"
    p_dl.font.name = FONT_HEAD
    p_dl.font.size = Pt(14)
    p_dl.font.color.rgb = RGBColor(147, 197, 253)

    stops = [
        ("1. Dashboard Universal Search", "Instant student filtering in 0ms on home screen"),
        ("2. Instant Fee Receipt Voucher", "Payment recorded ➔ official voucher & WhatsApp dispatch"),
        ("3. 2G Offline Attendance Register", "35 students marked present in 0.4 seconds"),
        ("4. Shielded Gemini AI Copilot", "Plain English & Hindi conversational debt analytics")
    ]
    for st_t, st_d in stops:
        p_st = tfd.add_paragraph()
        p_st.space_before = Pt(12)
        append_run(p_st, f"✓ {st_t}: ", bold=True, font_name=FONT_HEAD, size=Pt(12), color=RGBColor(52, 211, 153))
        append_run(p_st, st_d, bold=False, font_name=FONT_BODY, size=Pt(11), color=RGBColor(212, 212, 216))

    # Right Column: Phone Mockup Frame Container Card
    c6_img_l, c6_img_t, c6_img_w, c6_img_h = Inches(8.5), Inches(0.8), Inches(4.0), Inches(5.8)
    add_card(s6, c6_img_l, c6_img_t, c6_img_w, c6_img_h, RGBColor(39, 39, 42), border_color=RGBColor(52, 211, 153))
    add_contained_image(s6, phone_frame_path, c6_img_l, c6_img_t, c6_img_w, c6_img_h, padding=Inches(0.18))

    # =========================================================================
    # SLIDE 7: ECONOMIC IMPACT & CLOSING (3 Giant Impact Metric Cards)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7, C_CRIMSON)

    tb_cl = s7.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(11.733), Inches(0.35))
    p = tb_cl.text_frame.paragraphs[0]
    p.text = "MEASURABLE IMPACT FOR BHARAT'S EDUCATORS"
    p.font.name = FONT_HEAD
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_ROSE_TINT

    tb_clt = s7.shapes.add_textbox(Inches(0.8), Inches(0.95), Inches(11.733), Inches(0.85))
    p = tb_clt.text_frame.paragraphs[0]
    p.text = "Turning Fee Collection from an Awkward Chore into a 10-Second Habit"
    p.font.name = FONT_HEAD
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    # 3 Giant Aligned Impact Cards
    impacts = [
        ("₹84,960", "Direct Annual Savings", "Saved per 185 students by completely bypassing 2.36% commercial gateway cuts."),
        ("10h ➔ 30m", "Admin Time Slashed", "Weekly fee tracking, ledger updates, and parent calls reduced from 10+ hours to under 30 minutes."),
        ("25d ➔ 7d", "Default Cycle Cut", "Polite bilingual WhatsApp reminders cut average fee delay from 25 days to under 7 days.")
    ]

    for i, (m_val, m_title, m_desc) in enumerate(impacts):
        left_m = Inches(0.8 + i * 4.0)
        c7_w = Inches(3.7)
        c7_h = Inches(4.5)
        add_card(s7, left_m, Inches(2.05), c7_w, c7_h, fill_color=RGBColor(114, 28, 22), border_color=RGBColor(248, 113, 113))
        
        tb_m = s7.shapes.add_textbox(left_m + Inches(0.25), Inches(2.25), c7_w - Inches(0.5), c7_h - Inches(0.4))
        tf = tb_m.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = m_val
        p0.font.name = FONT_HEAD
        p0.font.size = Pt(36)
        p0.font.bold = True
        p0.font.color.rgb = C_GOLD

        p1 = tf.add_paragraph()
        p1.space_before = Pt(8)
        p1.text = m_title
        p1.font.name = FONT_HEAD
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = C_WHITE

        p2 = tf.add_paragraph()
        p2.space_before = Pt(8)
        p2.text = m_desc
        p2.font.name = FONT_BODY
        p2.font.size = Pt(11)
        p2.font.color.rgb = RGBColor(254, 226, 226)

    # Output paths
    out_master = "EduManage_Bharat_Pitch_Deck_Master.pptx"
    prs.save(out_master)
    print(f"Successfully saved Master Presentation to {out_master}")

    # Copy to artifacts directory
    artifact_dir = r"C:\Users\amanm\.gemini\antigravity\brain\a4541b06-2c7c-46e1-8da5-5804293eb341"
    if os.path.exists(artifact_dir):
        shutil.copy2(out_master, os.path.join(artifact_dir, out_master))
        print("Copied to artifact directory")

    # Attempt to copy to standard names if not locked
    for alt_name in ["EduManage_Bharat_Pitch_Deck_Pro.pptx", "EduManage_Bharat_Hackathon_Presentation.pptx"]:
        try:
            shutil.copy2(out_master, alt_name)
            if os.path.exists(artifact_dir):
                shutil.copy2(out_master, os.path.join(artifact_dir, alt_name))
            print(f"Updated {alt_name}")
        except Exception as e:
            print(f"Notice: {alt_name} is currently open in PowerPoint ({e}). {out_master} is fresh and ready.")

if __name__ == '__main__':
    create_presentation()
