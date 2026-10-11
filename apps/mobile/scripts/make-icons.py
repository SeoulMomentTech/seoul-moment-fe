"""앱 아이콘을 브랜드 마크("S.")에서 만든다.

마크의 출처는 뉴스 매거진 프로필 이미지(500x500)다 — 저장소에서 구할 수 있는
가장 큰 "S." 래스터다. 그 안에서 S 는 160x192 밖에 되지 않아 1024 로 그냥 키우면
가장자리가 뭉개지므로, 평면 흑백 아트를 선명하게 키우는 방법을 쓴다:
크게 보간 → 임계로 가장자리를 되살림 → 계단 없이 축소.

마침표는 원본의 "SEOUL MOMENT / EST. 2025" 가 박힌 사각형 대신 **민무늬 사각형**으로
다시 그린다. 그 미세 글자는 홈 화면 크기(60pt)에서 얼룩으로만 보이고, 민무늬 쪽도
이 브랜드의 공식 변형이다 — 웹 파비콘이 그것을 쓴다. 크기와 자리는 원본에서 잰 값이다.

벡터 원본이 생기면 이 스크립트는 버리고 그것으로 뽑는 편이 낫다.

사용법: python3 scripts/make-icons.py <마크원본.png>
"""

import sys
from PIL import Image, ImageDraw

# --- 원본에서 잰 값 (500x500 기준) ---------------------------------------
S_W, S_H = 160, 192
DOT = 60
GAP = 16
# 사각형 아랫변이 S 밑선보다 이만큼 위에 있다.
DOT_LIFT = 4

FOREGROUND = (23, 23, 23)  # --foreground
WHITE = (255, 255, 255)

CANVAS = 1024
# 아이콘 안에서 마크가 차지하는 가로 비율.
ICON_MARK_RATIO = 0.66
# 어댑티브 아이콘은 바깥 테두리가 깎인다. 마크가 안전한 원 안에 들어오도록 더 줄인다.
ADAPTIVE_MARK_RATIO = 0.51


def crisp(mask: Image.Image, target_w: int) -> Image.Image:
    """평면 흑백 마스크를 선명하게 키운다."""
    w, h = mask.size
    big = mask.resize((target_w * 4, round(h * target_w * 4 / w)), Image.LANCZOS)
    big = big.point(lambda v: 255 if v >= 128 else 0)
    return big.resize((target_w, round(h * target_w / w)), Image.LANCZOS)


def build_mark(width: int) -> Image.Image:
    """S + 민무늬 사각 마침표를 합친 알파 마스크."""
    src = Image.open(sys.argv[1]).convert("L")
    alpha = src.point(lambda v: 255 - v)
    bbox = alpha.getbbox()
    # 마크 왼쪽 위에서 S 만 잘라낸다(사각형은 다시 그린다).
    letter = alpha.crop((bbox[0], bbox[1], bbox[0] + S_W, bbox[1] + S_H))

    unit_w = S_W + GAP + DOT
    scale = width / unit_w
    mark = Image.new("L", (width, round(S_H * scale)), 0)
    mark.paste(crisp(letter, round(S_W * scale)), (0, 0))

    side = round(DOT * scale)
    left = round((S_W + GAP) * scale)
    top = round((S_H - DOT - DOT_LIFT) * scale)
    ImageDraw.Draw(mark).rectangle([left, top, left + side, top + side], fill=255)
    return mark


def compose(mark: Image.Image, background, ink, size: int = CANVAS) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    canvas.paste(
        Image.new("RGBA", mark.size, ink),
        ((size - mark.width) // 2, (size - mark.height) // 2),
        mark,
    )
    return canvas


def main() -> None:
    out = "assets/images"
    icon_mark = build_mark(round(CANVAS * ICON_MARK_RATIO))
    adaptive_mark = build_mark(round(CANVAS * ADAPTIVE_MARK_RATIO))

    compose(icon_mark, (*FOREGROUND, 255), (*WHITE, 255)).convert("RGB").save(
        f"{out}/icon.png"
    )
    compose(adaptive_mark, (0, 0, 0, 0), (*WHITE, 255)).save(
        f"{out}/android-icon-foreground.png"
    )
    Image.new("RGB", (CANVAS, CANVAS), FOREGROUND).save(
        f"{out}/android-icon-background.png"
    )
    # 안드로이드가 제 색으로 칠하므로 실루엣만 검게 둔다.
    compose(adaptive_mark, (0, 0, 0, 0), (0, 0, 0, 255)).save(
        f"{out}/android-icon-monochrome.png"
    )
    compose(build_mark(round(48 * ICON_MARK_RATIO)), (*FOREGROUND, 255), (*WHITE, 255), 48).convert(
        "RGB"
    ).save(f"{out}/favicon.png")
    print("wrote icon, adaptive foreground/background/monochrome, favicon")


main()
