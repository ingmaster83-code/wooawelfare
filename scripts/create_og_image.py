"""
create_og_image.py — OG 이미지 생성 (1200x630)
링크 공유 시 카카오톡·디스코드·슬랙 등에서 보이는 미리보기 이미지
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = Path(__file__).parent.parent / "assets"

# 색상 (우아복지관 테마 - 그린/복지)
BG        = (240, 253, 244)   # #F0FDF4  green-50
ACCENT    = (21,  128, 61)    # #15803D  primary green
ACCENT2   = (22,  163, 74)    # #16A34A  accent green
DARK      = (17,  24,  39)    # #111827
GRAY      = (107, 114, 128)   # #6B7280
WHITE     = (255, 255, 255)

W, H = 1200, 630


def load_font(size, bold=False):
    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
        "C:/Windows/Fonts/malgunbd.ttf",
        "C:/Windows/Fonts/malgun.ttf",
        "C:/Windows/Fonts/NanumGothicBold.ttf",
        "C:/Windows/Fonts/NanumGothic.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.ellipse([x0, y0, x0 + radius * 2, y0 + radius * 2], fill=fill)
    draw.ellipse([x1 - radius * 2, y0, x1, y0 + radius * 2], fill=fill)
    draw.ellipse([x0, y1 - radius * 2, x0 + radius * 2, y1], fill=fill)
    draw.ellipse([x1 - radius * 2, y1 - radius * 2, x1, y1], fill=fill)


def create_og_image():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw.ellipse([820, -120, 1380, 440], fill=(187, 247, 208))   # green-200
    draw.ellipse([900, 340, 1300, 740], fill=(134, 239, 172))    # green-300

    draw_rounded_rect(draw, (60, 60, 72, 570), 6, ACCENT)

    badge_font = load_font(22, bold=True)
    badge_text = "보건복지부·사회보장정보원"
    bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    bw = bbox[2] - bbox[0] + 32
    bh = bbox[3] - bbox[1] + 14
    draw_rounded_rect(draw, (100, 110, 100 + bw, 110 + bh), 8, ACCENT)
    draw.text((116, 117), badge_text, fill=WHITE, font=badge_font)

    title_font = load_font(68, bold=True)
    title1 = "우리 동네 복지관,"
    title2 = "어디 있을까요?"
    draw.text((100, 178), title1, fill=DARK, font=title_font)
    draw.text((100, 268), title2, fill=ACCENT2, font=title_font)

    sub_font = load_font(32)
    draw.text((100, 390), "지역·이름으로 복지시설을 검색하세요", fill=GRAY, font=sub_font)

    icon_font = load_font(24, bold=True)
    boxes = [
        ("사회복지관·장애인복지관", ACCENT2),
        ("지역자활센터", (37, 99, 235)),
        ("노인일자리지원기관", (234, 88, 12)),
    ]
    cx, y = 100, 456
    for label, color in boxes:
        lbbox = draw.textbbox((0, 0), label, font=icon_font)
        lw = lbbox[2] - lbbox[0]
        bw = lw + 36
        draw_rounded_rect(draw, (cx, y, cx + bw, y + 50), 10, color)
        draw.text((cx + 18, y + 11), label, fill=WHITE, font=icon_font)
        cx += bw + 14

    domain_font = load_font(30, bold=True)
    draw.text((100, 550), "wooawelfare.wooahouse.com", fill=ACCENT, font=domain_font)

    ASSETS_DIR.mkdir(exist_ok=True)
    out = ASSETS_DIR / "og-image.png"
    img.save(str(out), "PNG", optimize=True)
    print(f"OG image created: {out} ({W}x{H})")


if __name__ == "__main__":
    create_og_image()
