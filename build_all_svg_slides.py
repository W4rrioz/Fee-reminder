import os
from PIL import Image

project_dir = "projects/EduManage_Bharat_Pitch_ppt169_20261128"
svg_out_dir = os.path.join(project_dir, "svg_output")
notes_dir = os.path.join(project_dir, "notes")
images_dir = os.path.join(project_dir, "images")

os.makedirs(svg_out_dir, exist_ok=True)
os.makedirs(notes_dir, exist_ok=True)

def get_centered_img_svg(img_filename, card_x, card_y, card_w, card_h, pad=20):
    full_path = os.path.join(images_dir, img_filename)
    if not os.path.exists(full_path):
        return f'<image href="../images/{img_filename}" x="{card_x+pad}" y="{card_y+pad}" width="{card_w-2*pad}" height="{card_h-2*pad}" preserveAspectRatio="xMidYMid meet"/>'
    
    with Image.open(full_path) as im:
        iw, ih = im.size
    
    ar = iw / float(ih)
    avail_w = card_w - 2 * pad
    avail_h = card_h - 2 * pad
    
    if (avail_w / avail_h) > ar:
        th = avail_h
        tw = th * ar
    else:
        tw = avail_w
        th = tw / ar
        
    ix = card_x + (card_w - tw) / 2
    iy = card_y + (card_h - th) / 2
    return f'<image href="../images/{img_filename}" x="{ix:.1f}" y="{iy:.1f}" width="{tw:.1f}" height="{th:.1f}" preserveAspectRatio="xMidYMid meet"/>'

# =============================================================================
# SLIDE 1: HERO TITLE SLIDE
# =============================================================================
s1_img = get_centered_img_svg("screen_phone_frame.png", 830, 80, 380, 560, pad=15)
s1_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#8B261E"/>
  
  <g id="brand-header">
    <text x="70" y="85" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#FECDD3" letter-spacing="1.5">AI GENESIS CHALLENGE 2026 · ALTA SCHOOL OF TECHNOLOGY</text>
    <text x="70" y="155" font-family="Trebuchet MS" font-size="50" font-weight="bold" fill="#FFFFFF">EduManage Bharat</text>
    <text x="70" y="205" font-family="Segoe UI" font-size="19" font-weight="bold" fill="#FEF3C7">Zero-Commission Direct Bank UPI Fee Engine,</text>
    <text x="70" y="235" font-family="Segoe UI" font-size="19" font-weight="bold" fill="#FEF3C7">2G Offline Attendance Register &amp; AI Operations Copilot</text>
    <text x="70" y="285" font-family="Segoe UI" font-size="14.5" fill="#FEE2E2">Built specifically for India's 250,000+ budget coaching centers</text>
    <text x="70" y="308" font-family="Segoe UI" font-size="14.5" fill="#FEE2E2">and independent tutors facing daily financial hurdles.</text>
  </g>

  <g id="value-pills">
    <rect x="70" y="340" width="710" height="48" rx="8" fill="#721C16" stroke="#F87171" stroke-width="1.5"/>
    <text x="90" y="370" font-family="Trebuchet MS" font-size="13.5" font-weight="bold" fill="#FFFFFF">✦ 0% Gateway Intermediary Cut    ✦ Official Digital Receipts    ✦ 0.4s Offline Attendance</text>
  </g>

  <g id="stats-row">
    <rect x="70" y="420" width="220" height="110" rx="10" fill="#FFFFFF"/>
    <text x="90" y="465" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#15803D">0%</text>
    <text x="90" y="500" font-family="Segoe UI" font-size="13" font-weight="bold" fill="#52525B">Platform &amp; Gateway Tax</text>

    <rect x="315" y="420" width="220" height="110" rx="10" fill="#FFFFFF"/>
    <text x="335" y="465" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#3730A3">0.4s</text>
    <text x="335" y="500" font-family="Segoe UI" font-size="13" font-weight="bold" fill="#52525B">Offline 35-Student Batch</text>

    <rect x="560" y="420" width="220" height="110" rx="10" fill="#FFFFFF"/>
    <text x="580" y="465" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#D97706">₹84,960</text>
    <text x="580" y="500" font-family="Segoe UI" font-size="13" font-weight="bold" fill="#52525B">Annual Savings / 185 Students</text>
  </g>

  <g id="presenter-footer">
    <text x="70" y="620" font-family="Segoe UI" font-size="14" font-weight="bold" fill="#FECDD3">Presented by Aman  |  Live Production App: feeremindersupabasedeploy.vercel.app</text>
  </g>

  <g id="phone-container">
    <rect x="830" y="80" width="380" height="560" rx="16" fill="#721C16" stroke="#F87171" stroke-width="2"/>
    {s1_img}
  </g>
</svg>'''

# =============================================================================
# SLIDE 2: THE REAL-WORLD PROBLEM
# =============================================================================
s2_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#FAF7F2"/>

  <g id="slide-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#8B261E" letter-spacing="1.5">THE REAL-WORLD PROBLEM</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#18181B">Tier-2 &amp; Tier-3 Bharat's Dual Education Dilemma</text>
  </g>

  <g id="problem-card-left">
    <rect x="70" y="150" width="550" height="510" rx="14" fill="#FFFFFF" stroke="#8B261E" stroke-width="2"/>
    <text x="100" y="195" font-family="Trebuchet MS" font-size="22" font-weight="bold" fill="#8B261E">💸  The 2.36% Gateway Tax Siphon</text>
    
    <rect x="100" y="215" width="490" height="65" rx="8" fill="#FEF2F2"/>
    <text x="120" y="246" font-family="Trebuchet MS" font-size="22" font-weight="bold" fill="#991B1B">₹84,960 Lost Every Year</text>
    <text x="120" y="268" font-family="Segoe UI" font-size="12" fill="#7F1D1D">Deducted from a modest 185-student coaching center by payment gateways.</text>

    <text x="100" y="320" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">• Commercial Gateway Deductions:
      <tspan x="100" dy="22" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">Razorpay and Cashfree deduct 2.0% + 18% GST on tuition fee payments,</tspan>
      <tspan x="100" dy="20" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">eroding thin margins in competitive coaching hubs.</tspan>
    </text>

    <text x="100" y="410" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">• Mandatory Corporate KYC Barrier:
      <tspan x="100" dy="22" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">Independent tutors and unaccredited coaching academies are rejected without</tspan>
      <tspan x="100" dy="20" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">formal corporate registration, GST certificates, and complex merchant audits.</tspan>
    </text>

    <text x="100" y="500" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">• T+2 Delayed Settlement:
      <tspan x="100" dy="22" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">Educators in rented classrooms wait 48 to 72 hours for funds to clear,</tspan>
      <tspan x="100" dy="20" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">crippling cash flow for rent, faculty stipends, and utility bills.</tspan>
    </text>
  </g>

  <g id="problem-card-right">
    <rect x="660" y="150" width="550" height="510" rx="14" fill="#FFFFFF" stroke="#3730A3" stroke-width="2"/>
    <text x="690" y="195" font-family="Trebuchet MS" font-size="22" font-weight="bold" fill="#3730A3">📞  Behavioral Friction &amp; 2G Reality</text>

    <rect x="690" y="215" width="490" height="65" rx="8" fill="#EEF2FF"/>
    <text x="710" y="246" font-family="Trebuchet MS" font-size="22" font-weight="bold" fill="#312E81">10+ Hours Chasing Overdue Fees</text>
    <text x="710" y="268" font-family="Segoe UI" font-size="12" fill="#3730A3">Wasted on awkward, repetitive phone calls every single weekend.</text>

    <text x="690" y="320" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">• Awkward Social Shaming:
      <tspan x="690" dy="22" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">Teachers spend uncomfortable Sunday evenings calling parents to ask for money,</tspan>
      <tspan x="690" dy="20" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">straining respectful educator-family relationships.</tspan>
    </text>

    <text x="690" y="410" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">• Bahi-Khata Paper Register Chaos:
      <tspan x="690" dy="22" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">Scratched paper diaries lead to multi-month fee disputes, missing receipts,</tspan>
      <tspan x="690" dy="20" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">and chronic student dropouts when records don't match.</tspan>
    </text>

    <text x="690" y="500" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">• Classroom 2G Blackouts:
      <tspan x="690" dy="22" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">Thick concrete basement walls block 4G/5G mobile signals;</tspan>
      <tspan x="690" dy="20" font-family="Segoe UI" font-size="13" font-weight="normal" fill="#52525B">heavy cloud enterprise ERP portals freeze and lose unsaved attendance.</tspan>
    </text>
  </g>
</svg>'''

# =============================================================================
# SLIDE 3: SYSTEM ARCHITECTURE & DIRECT BANK UPI
# =============================================================================
s3_img = get_centered_img_svg("send_fee_reminder.png", 820, 150, 390, 510, pad=15)
s3_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#FAF7F2"/>

  <g id="slide-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#8B261E" letter-spacing="1.5">SYSTEM ARCHITECTURE</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#18181B">Direct Bank UPI &amp; Dynamic QR Protocol (0% Intermediary Tax)</text>
  </g>

  <g id="arch-card-1">
    <rect x="70" y="150" width="720" height="150" rx="12" fill="#FFFFFF" stroke="#15803D" stroke-width="2"/>
    <text x="100" y="188" font-family="Trebuchet MS" font-size="18" font-weight="bold" fill="#15803D">01. Direct NPCI Bank UPI Protocol (Zero Commission)</text>
    <text x="100" y="218" font-family="Segoe UI" font-size="13.5" fill="#52525B">Generates native <tspan font-weight="bold" fill="#18181B">upi://pay</tspan> deep links that route payments straight to teacher's personal</text>
    <text x="100" y="240" font-family="Segoe UI" font-size="13.5" fill="#52525B">or institute savings account. Instant T+0 credit, 0% commission, and zero merchant setup.</text>
    <text x="100" y="272" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#15803D">✓ Instant Settlement   ✓ Zero Merchant KYC Gate   ✓ 100% Retained Revenue</text>
  </g>

  <g id="arch-card-2">
    <rect x="70" y="325" width="720" height="150" rx="12" fill="#FFFFFF" stroke="#3730A3" stroke-width="2"/>
    <text x="100" y="363" font-family="Trebuchet MS" font-size="18" font-weight="bold" fill="#3730A3">02. Dynamic Balance QR Codes &amp; Audit Notes</text>
    <text x="100" y="393" font-family="Segoe UI" font-size="13.5" fill="#52525B">HTML5 Canvas dynamically embeds student roll number and exact overdue amount in</text>
    <text x="100" y="415" font-family="Segoe UI" font-size="13.5" fill="#52525B">the UPI transaction note (<tspan font-weight="bold" fill="#18181B">tn=Roll1003_OctFee</tspan>). Completely prevents mystery bank deposits.</text>
    <text x="100" y="447" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#3730A3">✓ Tamper-Evident Notes   ✓ 1-Click Camera Scan   ✓ Error-Free Reconciliation</text>
  </g>

  <g id="arch-card-3">
    <rect x="70" y="500" width="720" height="150" rx="12" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
    <text x="100" y="538" font-family="Trebuchet MS" font-size="18" font-weight="bold" fill="#D97706">03. Shielded Gemini AI Operations Copilot</text>
    <text x="100" y="568" font-family="Segoe UI" font-size="13.5" fill="#52525B">Proxied serverless backend (<tspan font-weight="bold" fill="#18181B">/api/ai-chat</tspan>) shields Gemini API keys and synthesizes</text>
    <text x="100" y="590" font-family="Segoe UI" font-size="13.5" fill="#52525B">live institute debt aging, batch attendance patterns, and collections in English and Hindi.</text>
    <text x="100" y="622" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#D97706">✓ Bilingual Audio/Text   ✓ Zero API Key Exposure   ✓ Instant Debt Insights</text>
  </g>

  <g id="arch-screenshot-container">
    <rect x="820" y="150" width="390" height="510" rx="14" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    {s3_img}
  </g>
</svg>'''

# =============================================================================
# SLIDE 4: 5 DIVERSE USER EVALUATIONS (Crystal Clean Multi-Line Rows)
# =============================================================================
s4_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#FAF7F2"/>

  <g id="slide-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#8B261E" letter-spacing="1.5">PRIMARY FIELD RESEARCH</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#18181B">Tested with 5 Diverse Real-World Personas Across Bharat</text>
  </g>

  <g id="user-row-1">
    <rect x="70" y="145" width="1140" height="96" rx="10" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    <text x="95" y="172" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">1. Pt. Harishankar Dwivedi <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#3730A3">(Coaching Director, Varanasi · Low Tech Literacy)</tspan></text>
    <text x="95" y="198" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#15803D">✓ LIKED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Loved 1-tap polite Hindi WhatsApp reminder saving 10 hours of Sunday calls.</tspan></text>
    <text x="95" y="222" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#8B261E">✗ CONFUSED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Modal closed at 0ms with no physical or digital receipt voucher generated!</tspan></text>
  </g>

  <g id="user-row-2">
    <rect x="70" y="249" width="1140" height="96" rx="10" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    <text x="95" y="276" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">2. Priya Deshmukh <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#3730A3">(STEM Tutor, Pune · High Tech / Gen-Z UPI)</tspan></text>
    <text x="95" y="302" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#15803D">✓ LIKED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Loved dynamic QR embedding student roll note (tn=Roll1003_OctFee) for audit.</tspan></text>
    <text x="95" y="326" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#8B261E">✗ CONFUSED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">No post-payment confirmation voucher or WhatsApp share sheet triggered.</tspan></text>
  </g>

  <g id="user-row-3">
    <rect x="70" y="353" width="1140" height="96" rx="10" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    <text x="95" y="380" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">3. Ramanathan Iyer <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#3730A3">(Accounts Clerk, Madurai · Desktop Tally Native)</tspan></text>
    <text x="95" y="406" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#15803D">✓ LIKED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Loved instant multi-parameter filtering by batch, phone, and roll number.</tspan></text>
    <text x="95" y="430" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#8B261E">✗ CONFUSED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Lacked sequential voucher numbers (REC-xxxx) and @media print thermal slip CSS.</tspan></text>
  </g>

  <g id="user-row-4">
    <rect x="70" y="457" width="1140" height="96" rx="10" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    <text x="95" y="484" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">4. Ananya Mukhopadhyay <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#3730A3">(Batch Teacher, Durgapur · Low-Mid Tech 2G Class)</tspan></text>
    <text x="95" y="510" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#15803D">✓ LIKED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Loved 2G offline register marking 35 students in 0.4s without network lag.</tspan></text>
    <text x="95" y="534" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#8B261E">✗ CONFUSED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Could not send instant WhatsApp receipt during 10-minute break between classes.</tspan></text>
  </g>

  <g id="user-row-5">
    <rect x="70" y="561" width="1140" height="96" rx="10" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    <text x="95" y="588" font-family="Trebuchet MS" font-size="15" font-weight="bold" fill="#18181B">5. Qasim Ali Khan <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#3730A3">(Managing Trustee, Aligarh · Executive Non-Tech)</tspan></text>
    <text x="95" y="614" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#15803D">✓ LIKED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Loved Unpaid Months debt breakdown preventing end-of-term fee disputes.</tspan></text>
    <text x="95" y="638" font-family="Trebuchet MS" font-size="12.5" font-weight="bold" fill="#8B261E">✗ CONFUSED: <tspan font-family="Segoe UI" font-size="12.5" font-weight="normal" fill="#18181B">Needed tamper-evident receipts with institution watermarks to stop clerk theft.</tspan></text>
  </g>
</svg>'''

# =============================================================================
# SLIDE 5: PRODUCT REFINEMENTS
# =============================================================================
s5_img = get_centered_img_svg("mark_fee_as_paid.png", 820, 150, 390, 510, pad=15)
s5_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#FAF7F2"/>

  <g id="slide-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#8B261E" letter-spacing="1.5">PRODUCT REFINEMENT</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#18181B">Official Digital Fee Receipt Voucher Engine &amp; Universal Search</text>
  </g>

  <g id="refinement-card-1">
    <rect x="70" y="150" width="720" height="240" rx="12" fill="#FFFFFF" stroke="#15803D" stroke-width="2"/>
    <text x="100" y="190" font-family="Trebuchet MS" font-size="19" font-weight="bold" fill="#15803D">🧾  FeeReceiptModal.jsx (Digital Voucher Engine)</text>
    
    <text x="100" y="224" font-family="Segoe UI" font-size="13.5" fill="#18181B">• Instant Transition: <tspan fill="#52525B">Clicking 'Confirm &amp; Mark as Paid' launches the voucher modal at once.</tspan></text>
    <text x="100" y="254" font-family="Segoe UI" font-size="13.5" fill="#18181B">• Sequential Voucher No: <tspan fill="#52525B">Generates audit-ready IDs (REC-2026-xxxxx) with 'PAID • रसीद' stamp.</tspan></text>
    <text x="100" y="284" font-family="Segoe UI" font-size="13.5" fill="#18181B">• 1-Tap WhatsApp Receipt: <tspan fill="#52525B">Formats official bilingual confirmation with Indian words via wa.me.</tspan></text>
    <text x="100" y="314" font-family="Segoe UI" font-size="13.5" fill="#18181B">• Thermal &amp; A4 Print CSS: <tspan fill="#52525B">Built-in @media print stylesheet isolates receipt for 1-click POS printing.</tspan></text>
    <text x="100" y="352" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#15803D">✓ Solved Feedback from Pt. Harishankar, Ramanathan Iyer &amp; Qasim Ali Khan</text>
  </g>

  <g id="refinement-card-2">
    <rect x="70" y="420" width="720" height="240" rx="12" fill="#FFFFFF" stroke="#3730A3" stroke-width="2"/>
    <text x="100" y="460" font-family="Trebuchet MS" font-size="19" font-weight="bold" fill="#3730A3">🔍  Universal Quick Student Search (DashboardScreen.jsx)</text>

    <text x="100" y="494" font-family="Segoe UI" font-size="13.5" fill="#18181B">• 1ms Multi-Search: <tspan fill="#52525B">Searches student name, roll number, or parent mobile on Dashboard overview.</tspan></text>
    <text x="100" y="524" font-family="Segoe UI" font-size="13.5" fill="#18181B">• Live Debt Status: <tspan fill="#52525B">Shows batch, parent phone, and debt aging (e.g. '₹2,500 Due · 1 mo').</tspan></text>
    <text x="100" y="554" font-family="Segoe UI" font-size="13.5" fill="#18181B">• 1-Tap 'Pay &amp; Receipt': <tspan fill="#52525B">Collect fee and generate official voucher without leaving home screen.</tspan></text>
    <text x="100" y="584" font-family="Segoe UI" font-size="13.5" fill="#18181B">• Zero Navigation Friction: <tspan fill="#52525B">Eliminates 5-step navigation sequence during busy 10-minute breaks.</tspan></text>
    <text x="100" y="622" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#3730A3">✓ Solved Feedback from Priya Deshmukh &amp; Ananya Mukhopadhyay</text>
  </g>

  <g id="refinement-screenshot-container">
    <rect x="820" y="150" width="390" height="510" rx="14" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    {s5_img}
  </g>
</svg>'''

# =============================================================================
# SLIDE 6: OFFLINE 2G CLASSROOM RESILIENCE
# =============================================================================
s6_img = get_centered_img_svg("attendance.png", 70, 150, 560, 510, pad=15)
s6_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#FAF7F2"/>

  <g id="slide-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#8B261E" letter-spacing="1.5">OFFLINE INFRASTRUCTURE</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#18181B">2G Classroom Resilience &amp; Instant Attendance Register</text>
  </g>

  <g id="attendance-screenshot-card">
    <rect x="70" y="150" width="560" height="510" rx="14" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1.5"/>
    {s6_img}
  </g>

  <g id="attendance-features">
    <rect x="660" y="150" width="550" height="150" rx="12" fill="#FFFFFF" stroke="#15803D" stroke-width="2"/>
    <text x="690" y="188" font-family="Trebuchet MS" font-size="18" font-weight="bold" fill="#15803D">⚡  0.4s Batch Attendance</text>
    <text x="690" y="218" font-family="Segoe UI" font-size="13.5" fill="#52525B">Teachers tap 'Mark All Present' to record 35 students in under 400ms.</text>
    <text x="690" y="240" font-family="Segoe UI" font-size="13.5" fill="#52525B">Zero spinners, zero HTTP blocking, and zero classroom downtime.</text>
    <text x="690" y="272" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#15803D">✓ Instant Local State   ✓ 1-Tap Toggle   ✓ Real-Time Percent Counter</text>

    <rect x="660" y="325" width="550" height="150" rx="12" fill="#FFFFFF" stroke="#3730A3" stroke-width="2"/>
    <text x="690" y="363" font-family="Trebuchet MS" font-size="18" font-weight="bold" fill="#3730A3">🔄  Offline-First Sync Engine</text>
    <text x="690" y="393" font-family="Segoe UI" font-size="13.5" fill="#52525B">Designed for basement classrooms with concrete walls and zero signal.</text>
    <text x="690" y="415" font-family="Segoe UI" font-size="13.5" fill="#52525B">Changes buffer in IndexedDB/localStorage and sync automatically when online.</text>
    <text x="690" y="447" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#3730A3">✓ Conflict-Free Resolution   ✓ Zero Data Loss   ✓ 2G Optimized</text>

    <rect x="660" y="500" width="550" height="150" rx="12" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
    <text x="690" y="538" font-family="Trebuchet MS" font-size="18" font-weight="bold" fill="#D97706">📱  Automated Absence WhatsApp Alerts</text>
    <text x="690" y="568" font-family="Segoe UI" font-size="13.5" fill="#52525B">1-tap generates polite bilingual WhatsApp notification to parents of absentees.</text>
    <text x="690" y="590" font-family="Segoe UI" font-size="13.5" fill="#52525B">Builds trust with families and enforces student attendance discipline.</text>
    <text x="690" y="622" font-family="Trebuchet MS" font-size="12" font-weight="bold" fill="#D97706">✓ Bilingual Message Templates   ✓ Direct WhatsApp Intent Link</text>
  </g>
</svg>'''

# =============================================================================
# SLIDE 7: LIVE DEMO ROADMAP
# =============================================================================
s7_img = get_centered_img_svg("screen_phone_frame.png", 820, 160, 390, 500, pad=15)
s7_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#18181B"/>

  <g id="demo-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3" letter-spacing="1.5">LIVE PRODUCT DEMONSTRATION</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#FFFFFF">Production Verification &amp; Core Workflows</text>
    <text x="70" y="145" font-family="Segoe UI" font-size="15" font-weight="bold" fill="#93C5FD">Live Production App: https://feeremindersupabasedeploy.vercel.app/</text>
  </g>

  <g id="demo-milestones">
    <rect x="70" y="175" width="720" height="105" rx="10" fill="#27272A" stroke="#52525B" stroke-width="1.5"/>
    <text x="100" y="208" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#34D399">✓ 1. Dashboard Universal Quick Search</text>
    <text x="100" y="236" font-family="Segoe UI" font-size="13" fill="#D4D4D8">Type 'Aarav' ➔ Instant match in 0ms on home screen with balance &amp; batch details.</text>
    <text x="100" y="260" font-family="Trebuchet MS" font-size="11.5" font-weight="bold" fill="#A1A1AA">Target: Eliminate menu hopping during short class breaks.</text>

    <rect x="70" y="295" width="720" height="105" rx="10" fill="#27272A" stroke="#52525B" stroke-width="1.5"/>
    <text x="100" y="328" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#34D399">✓ 2. Instant Digital Fee Receipt Voucher</text>
    <text x="100" y="356" font-family="Segoe UI" font-size="13" fill="#D4D4D8">Click 'Pay &amp; Receipt' ➔ Generates REC-2026-xxxxx voucher with 'PAID' stamp &amp; WhatsApp link.</text>
    <text x="100" y="380" font-family="Trebuchet MS" font-size="11.5" font-weight="bold" fill="#A1A1AA">Target: Solves the #1 confusion reported in field tests.</text>

    <rect x="70" y="415" width="720" height="105" rx="10" fill="#27272A" stroke="#52525B" stroke-width="1.5"/>
    <text x="100" y="448" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#34D399">✓ 3. 2G Offline Attendance Register</text>
    <text x="100" y="476" font-family="Segoe UI" font-size="13" fill="#D4D4D8">Toggle attendance for 35 students in 0.4 seconds without network dependency.</text>
    <text x="100" y="500" font-family="Trebuchet MS" font-size="11.5" font-weight="bold" fill="#A1A1AA">Target: Bulletproof reliability in concrete basement classrooms.</text>

    <rect x="70" y="535" width="720" height="105" rx="10" fill="#27272A" stroke="#52525B" stroke-width="1.5"/>
    <text x="100" y="568" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#34D399">✓ 4. Shielded Gemini AI Operations Copilot</text>
    <text x="100" y="596" font-family="Segoe UI" font-size="13" fill="#D4D4D8">Ask plain English/Hindi queries: "Which batch has the highest overdue fees?"</text>
    <text x="100" y="620" font-family="Trebuchet MS" font-size="11.5" font-weight="bold" fill="#A1A1AA">Target: Executive intelligence for non-technical coaching founders.</text>
  </g>

  <g id="demo-phone-card">
    <rect x="820" y="160" width="390" height="500" rx="14" fill="#27272A" stroke="#34D399" stroke-width="2"/>
    {s7_img}
  </g>
</svg>'''

# =============================================================================
# SLIDE 8: ECONOMIC IMPACT SUMMARY (Strict 360px Bounded Cards)
# =============================================================================
s8_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#8B261E"/>

  <g id="closing-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3" letter-spacing="1.5">MEASURABLE IMPACT FOR BHARAT'S EDUCATORS</text>
    <text x="70" y="110" font-family="Trebuchet MS" font-size="32" font-weight="bold" fill="#FFFFFF">Turning Fee Collection into a 10-Second Digital Habit</text>
  </g>

  <g id="impact-card-1">
    <rect x="70" y="160" width="360" height="480" rx="14" fill="#721C16" stroke="#F87171" stroke-width="2"/>
    <text x="100" y="235" font-family="Trebuchet MS" font-size="48" font-weight="bold" fill="#FEF3C7">₹84,960</text>
    <text x="100" y="275" font-family="Trebuchet MS" font-size="19" font-weight="bold" fill="#FFFFFF">Direct Annual Savings</text>
    
    <text x="100" y="315" font-family="Segoe UI" font-size="13.5" fill="#FEE2E2">Saved annually for a typical 185-student
      <tspan x="100" dy="20">coaching center by bypassing 2.36%</tspan>
      <tspan x="100" dy="20">commercial gateway cuts and GST.</tspan>
    </text>
    
    <text x="100" y="400" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ 100% Retained Revenue</text>
    <text x="100" y="430" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ Instant Bank Settlement (T+0)</text>
    <text x="100" y="460" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ Zero Setup or Maintenance Fees</text>
  </g>

  <g id="impact-card-2">
    <rect x="460" y="160" width="360" height="480" rx="14" fill="#721C16" stroke="#F87171" stroke-width="2"/>
    <text x="490" y="235" font-family="Trebuchet MS" font-size="48" font-weight="bold" fill="#FEF3C7">10h ➔ 30m</text>
    <text x="490" y="275" font-family="Trebuchet MS" font-size="19" font-weight="bold" fill="#FFFFFF">Admin Time Slashed</text>
    
    <text x="490" y="315" font-family="Segoe UI" font-size="13.5" fill="#FEE2E2">Weekly fee tracking, ledger updates,
      <tspan x="490" dy="20">and parent calls reduced from 10+ hours</tspan>
      <tspan x="490" dy="20">to under 30 minutes.</tspan>
    </text>
    
    <text x="490" y="400" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ 95% Reduction in Admin Overhead</text>
    <text x="490" y="430" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ Teachers Regain Sunday Evenings</text>
    <text x="490" y="460" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ Automated Audit Logs</text>
  </g>

  <g id="impact-card-3">
    <rect x="850" y="160" width="360" height="480" rx="14" fill="#721C16" stroke="#F87171" stroke-width="2"/>
    <text x="880" y="235" font-family="Trebuchet MS" font-size="48" font-weight="bold" fill="#FEF3C7">25d ➔ 7d</text>
    <text x="880" y="275" font-family="Trebuchet MS" font-size="19" font-weight="bold" fill="#FFFFFF">Default Cycle Cut</text>
    
    <text x="880" y="315" font-family="Segoe UI" font-size="13.5" fill="#FEE2E2">Polite bilingual WhatsApp reminders
      <tspan x="880" dy="20">with dynamic UPI intent cut the average</tspan>
      <tspan x="880" dy="20">fee delay from 25 days to under 7 days.</tspan>
    </text>
    
    <text x="880" y="400" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ 72% Faster Cash Collections</text>
    <text x="880" y="430" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ No Social Shaming or Friction</text>
    <text x="880" y="460" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3">✦ Predictable Classroom Cash Flow</text>
  </g>
</svg>'''

# =============================================================================
# SLIDE 9: THANK YOU & PROJECT SUBMISSION CLOSING
# =============================================================================
s9_img = get_centered_img_svg("screen_phone_frame.png", 830, 160, 380, 480, pad=15)
s9_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="en">
  <rect width="1280" height="720" fill="#8B261E"/>

  <g id="thankyou-header">
    <text x="70" y="65" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#FECDD3" letter-spacing="1.5">AI GENESIS CHALLENGE 2026 · HACKATHON SUBMISSION</text>
    <text x="70" y="125" font-family="Trebuchet MS" font-size="52" font-weight="bold" fill="#FFFFFF">Thank You!</text>
    <text x="70" y="160" font-family="Segoe UI" font-size="18" font-weight="bold" fill="#FEF3C7">Empowering Bharat's Grassroots Educators, One Direct Settlement at a Time.</text>
  </g>

  <g id="resource-cards">
    <rect x="70" y="195" width="720" height="115" rx="12" fill="#721C16" stroke="#F87171" stroke-width="1.5"/>
    <text x="95" y="230" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#FEF3C7">🌐  Live Production Application</text>
    <text x="95" y="258" font-family="Segoe UI" font-size="14.5" font-weight="bold" fill="#FFFFFF">https://feeremindersupabasedeploy.vercel.app/</text>
    <text x="95" y="285" font-family="Segoe UI" font-size="12.5" fill="#FECDD3">Instant browser access · Multi-device responsive · Zero setup · Supabase DB</text>

    <rect x="70" y="325" width="720" height="115" rx="12" fill="#721C16" stroke="#F87171" stroke-width="1.5"/>
    <text x="95" y="360" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#FEF3C7">💻  Open-Source GitHub Repository</text>
    <text x="95" y="388" font-family="Segoe UI" font-size="14.5" font-weight="bold" fill="#FFFFFF">https://github.com/W4rrioz/Fee-reminder</text>
    <text x="95" y="415" font-family="Segoe UI" font-size="12.5" fill="#FECDD3">Full source code · React 18 frontend · Vercel serverless AI proxy · Comprehensive docs</text>

    <rect x="70" y="455" width="720" height="115" rx="12" fill="#721C16" stroke="#F87171" stroke-width="1.5"/>
    <text x="95" y="490" font-family="Trebuchet MS" font-size="17" font-weight="bold" fill="#FEF3C7">🎓  Author &amp; Project Track</text>
    <text x="95" y="518" font-family="Segoe UI" font-size="14.5" font-weight="bold" fill="#FFFFFF">Aman — Project Lead &amp; Full-Stack Architect</text>
    <text x="95" y="545" font-family="Segoe UI" font-size="12.5" fill="#FECDD3">Alta School of Technology · AI Genesis Challenge 2026 Official Submission</text>
  </g>

  <g id="bottom-feature-strip">
    <rect x="70" y="590" width="720" height="48" rx="8" fill="#FFFFFF"/>
    <text x="95" y="620" font-family="Trebuchet MS" font-size="13" font-weight="bold" fill="#8B261E">✦ 0% Commission UPI    ✦ 1-Tap WhatsApp Receipts    ✦ 2G Offline Register    ✦ Gemini AI</text>
  </g>

  <g id="thankyou-phone-card">
    <rect x="830" y="195" width="380" height="443" rx="16" fill="#721C16" stroke="#F87171" stroke-width="2"/>
    {s9_img}
  </g>
</svg>'''

slides = [
    ("01_title.svg", s1_svg, "01_title.md", "Welcome to EduManage Bharat. Today, India's 250,000+ budget coaching teachers face a silent financial crisis: losing ₹85,000 yearly to payment gateways and 10 hours every week chasing fees."),
    ("02_problem.svg", s2_svg, "02_problem.md", "Commercial gateways take 2.36% on tuition fees, and unaccredited tutors cannot pass corporate KYC. Meanwhile, paper registers lead to disputes and 2G basement classrooms cause cloud ERPs to freeze."),
    ("03_architecture.svg", s3_svg, "03_architecture.md", "EduManage Bharat bypasses intermediaries using native NPCI bank UPI links directly to the teacher's bank account with 0% tax, dynamic roll-number QR codes, and a shielded Gemini AI copilot."),
    ("04_field_research.svg", s4_svg, "04_field_research.md", "We field-tested our app with 5 distinct educators across Bharat: Pandit Harishankar, Priya Deshmukh, Ramanathan Iyer, Ananya Mukhopadhyay, and Qasim Ali Khan to uncover real friction points."),
    ("05_refinements.svg", s5_svg, "05_refinements.md", "Based on their feedback, we engineered our official Fee Receipt Voucher engine with sequential IDs and thermal print CSS, plus a 1ms dashboard universal search for busy 10-minute breaks."),
    ("06_offline_2g.svg", s6_svg, "06_offline_2g.md", "In concrete basement classrooms with zero signal, our 2G offline register marks 35 students in 0.4 seconds, buffers locally, and generates 1-tap absence alerts on WhatsApp."),
    ("07_live_demo.svg", s7_svg, "07_live_demo.md", "Now let's switch to the live production demo at feeremindersupabasedeploy.vercel.app to verify universal search, instant receipt generation, offline attendance, and Gemini AI queries."),
    ("08_economic_impact.svg", s8_svg, "08_economic_impact.md", "In summary: saving ₹84,960 annually, slashing admin time from 10 hours to 30 minutes, and shortening fee delays from 25 days to 7 days."),
    ("09_thank_you.svg", s9_svg, "09_thank_you.md", "Thank you for your time! EduManage Bharat is live right now at feeremindersupabasedeploy.vercel.app and fully open-source. We are happy to answer any questions.")
]

for svg_name, svg_content, note_name, note_content in slides:
    with open(os.path.join(svg_out_dir, svg_name), "w", encoding="utf-8") as f:
        f.write(svg_content.strip() + "\n")
    with open(os.path.join(notes_dir, note_name), "w", encoding="utf-8") as f:
        f.write(note_content.strip() + "\n")

print(f"Successfully generated all {len(slides)} SVG slides and speaker notes in {project_dir}")
