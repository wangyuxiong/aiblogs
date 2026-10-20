#!/usr/bin/env python3
"""
生成 og-default.png（1200x630 社交分享卡）。

用法:
    python3 scripts/generate-og-image.py

说明:
    - 纯 Pillow 绘制，无需网络素材
    - 中文使用系统字体（PingFang / Hiragino / STHeiti），找不到则退化为英文
    - 产物提交到仓库（public/images/og-default.png），CI 无需重新生成
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "public" / "images" / "og-default.png"

W, H = 1200, 630

# 深蓝渐变 (slate-950 -> indigo-950)
TOP = (2, 6, 23)
BOTTOM = (30, 27, 75)

FONT_CANDIDATES = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]


def load_font(size: int):
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(w, h):
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        px[0, y] = lerp(TOP, BOTTOM, y / (h - 1))
    return base.resize((w, h))


def main():
    img = vertical_gradient(W, H)
    draw = ImageDraw.Draw(img)

    # 网格
    grid_color = lerp((255, 255, 255), TOP, 0.06)
    for x in range(0, W, 100):
        draw.line([(x, 0), (x, H)], fill=grid_color, width=1)
    for y in range(0, H, 105):
        draw.line([(0, y), (W, y)], fill=grid_color, width=1)

    # 顶部光斑（蓝色→紫色）
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx1, cy1, r1 = 950, 120, 320
    cx2, cy2, r2 = 200, 520, 280
    for i in range(r1, 0, -4):
        alpha = int(42 * (i / r1) ** 2)
        gdraw.ellipse(
            [cx1 - i, cy1 - i, cx1 + i, cy1 + i], fill=(59, 130, 246, alpha)
        )
    for i in range(r2, 0, -4):
        alpha = int(36 * (i / r2) ** 2)
        gdraw.ellipse(
            [cx2 - i, cy2 - i, cx2 + i, cy2 + i], fill=(139, 92, 246, alpha)
        )
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    font_title = load_font(88)
    font_sub = load_font(40)
    font_brand = load_font(30)

    # 标题
    draw.text((100, 220), "Mind Keeper", font=font_title, fill=(255, 255, 255))

    # 渐变分隔线（蓝→紫）
    for x in range(100, 500):
        t = (x - 100) / 400
        color = lerp((59, 130, 246), (139, 92, 246), t)
        draw.line([(x, 360), (x, 366)], fill=color, width=1)

    # 副标题（含中文，若系统无中文字体会显示为方块，可接受降级）
    draw.text((100, 400), "AI 学习日刊 · 每日更新", font=font_sub, fill=(203, 213, 225))

    # 品牌标识
    draw.text((100, 520), "mind-keeper.com", font=font_brand, fill=(148, 163, 184))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"✅ 生成 {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
