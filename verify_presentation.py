import os
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

def verify():
    pptx_path = "EduManage_Bharat_Master_Deck.pptx"
    if not os.path.exists(pptx_path):
        print(f"Error: {pptx_path} not found")
        return
        
    prs = Presentation(pptx_path)
    print("=================================================================")
    print("PPT-MASTER PRESENTATION QUALITY VERIFICATION REPORT")
    print("=================================================================")
    print(f"File: {pptx_path} (Size: {os.path.getsize(pptx_path):,} bytes)")
    print(f"Total Slides: {len(prs.slides)}")
    print(f"Canvas Aspect Ratio: Widescreen 16:9 ({prs.slide_width.inches:.3f}\" x {prs.slide_height.inches:.3f}\")")
    print("-----------------------------------------------------------------")
    
    total_shapes = 0
    total_images = 0
    total_paragraphs = 0
    issues = []
    
    slide_titles = [
        "Hero Title & Value Proposition",
        "The Real-World Problem (2-Card Comparative)",
        "System Architecture & Direct Bank UPI",
        "Primary Field Research (5 User Personas)",
        "Product Refinements (Receipt Modal & Search)",
        "Offline Infrastructure (2G Attendance Register)",
        "Live Production Demo Workflows",
        "Economic Impact & Closing Summary"
    ]
    
    for idx, slide in enumerate(prs.slides, 1):
        shapes = list(slide.shapes)
        total_shapes += len(shapes)
        slide_images = 0
        slide_paras = 0
        slide_title = slide_titles[idx-1] if idx <= len(slide_titles) else f"Slide {idx}"
        
        # Check notes
        notes_text = ""
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes_text = slide.notes_slide.notes_text_frame.text.strip()
            
        for s in shapes:
            # Check bounds within slide canvas
            if s.left < 0 or s.top < 0:
                issues.append(f"Slide {idx}: Shape {s.name} has negative coordinates ({s.left.inches:.2f}\", {s.top.inches:.2f}\")")
            if (s.left + s.width) > (prs.slide_width + 1000) or (s.top + s.height) > (prs.slide_height + 1000):
                issues.append(f"Slide {idx}: Shape {s.name} exceeds slide canvas ({s.left.inches:.2f}\" + {s.width.inches:.2f}\" > {prs.slide_width.inches:.2f}\")")
                
            if s.shape_type == MSO_SHAPE_TYPE.PICTURE:
                slide_images += 1
                total_images += 1
                # Check picture part size
                if len(s.image.blob) == 0:
                    issues.append(f"Slide {idx}: Picture {s.name} has 0 bytes")
                    
            if s.has_text_frame:
                slide_paras += len(s.text_frame.paragraphs)
                total_paragraphs += len(s.text_frame.paragraphs)
                
        print(f"✓ Slide {idx:02d}: {slide_title}")
        print(f"   - Shapes: {len(shapes):2d} | Images: {slide_images} | Paragraphs: {slide_paras:2d}")
        print(f"   - Speaker Notes: \"{notes_text[:60]}...\"")
        
    print("-----------------------------------------------------------------")
    print(f"SUMMARY: {len(prs.slides)} Slides, {total_shapes} Shapes, {total_images} Embedded Images, {total_paragraphs} Paragraphs")
    if not issues:
        print("RESULT: PERFECT VALIDATION (0 errors, 0 clipping issues, 0 broken images)")
    else:
        print(f"RESULT: Found {len(issues)} issues:")
        for iss in issues:
            print(f"   [!] {iss}")
    print("=================================================================")

if __name__ == "__main__":
    verify()
