#!/usr/bin/env python3
"""
一次性内容规范化脚本：统一 AI 日刊 frontmatter 与正文。

1. category 统一为 ai-daily（AI Daily / AI日报 / AI 日报 / ai-news 的日报文件）
2. coverImage 统一为 /images/ai-daily-cover.svg（替换 .png、缺失则补齐）
3. 去除正文中与 frontmatter title 重复的首个 h1
4. Bugcrawl 文章：category 改为 ai-news、补封面

用法: python3 scripts/normalize-content.py
"""

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
POSTS = REPO / "content" / "blog"

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.S)


def get_field(fm: str, key: str):
    m = re.search(rf'^{key}:\s*(.+)$', fm, re.M)
    return m.group(1).strip() if m else None


def set_field(fm: str, key: str, value: str) -> str:
    if re.search(rf'^{key}:\s*.+$', fm, re.M):
        return re.sub(rf'^{key}:\s*.+$', f'{key}: {value}', fm, flags=re.M)
    return fm + f"\n{key}: {value}"


def clean_h1_text(text: str) -> str:
    """去掉 emoji/首尾空白，便于标题比对"""
    text = re.sub(r'[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]', '', text)
    return text.strip().strip('。"\'"').strip()


def process_daily(path: Path):
    raw = path.read_text(encoding="utf-8")
    m = FM_RE.match(raw)
    if not m:
        print(f"  ⚠️ {path.name}: 无 frontmatter，跳过")
        return False
    fm, body = m.group(1), raw[m.end():]
    changed = []

    # 1. category -> ai-daily
    if get_field(fm, "category") != "ai-daily":
        fm = set_field(fm, "category", "ai-daily")
        changed.append("category")

    # 2. coverImage -> /images/ai-daily-cover.svg
    cover = get_field(fm, "coverImage")
    if cover != '"/images/ai-daily-cover.svg"':
        fm = set_field(fm, "coverImage", '"/images/ai-daily-cover.svg"')
        changed.append("coverImage")

    # 3. 去除与标题重复的首个 h1
    title = clean_h1_text(get_field(fm, "title") or "")
    lines = body.split("\n")
    for idx, line in enumerate(lines):
        if line.startswith("# "):
            h1 = clean_h1_text(line[2:])
            if h1 and h1 == title:
                lines[idx : idx + 2] = [] if idx + 1 < len(lines) and lines[idx + 1].strip() == "" else lines[idx : idx + 1]
                changed.append("dup-h1")
            break

    body = "\n".join(lines)
    path.write_text(f"---\n{fm}\n---\n{body}", encoding="utf-8")
    return changed


def process_bugcrawl(path: Path):
    raw = path.read_text(encoding="utf-8")
    m = FM_RE.match(raw)
    if not m:
        return
    fm, body = m.group(1), raw[m.end():]
    changed = []
    if get_field(fm, "category") != "ai-news":
        fm = set_field(fm, "category", "ai-news")
        changed.append("category")
    if get_field(fm, "coverImage") != '"/images/anthropic-bugcrawl-deep-dive-cover.svg"':
        fm = set_field(fm, "coverImage", '"/images/anthropic-bugcrawl-deep-dive-cover.svg"')
        changed.append("coverImage")
    path.write_text(f"---\n{fm}\n---\n{body}", encoding="utf-8")
    return changed


def main():
    dailies = sorted(POSTS.glob("ai-daily-*.mdx")) + [POSTS / "ai-hot-daily-2026-05-25.mdx"]
    total = 0
    for path in dailies:
        if not path.exists():
            continue
        changed = process_daily(path)
        if changed:
            total += 1
            print(f"  ✅ {path.name}: {', '.join(changed)}")
        else:
            print(f"  · {path.name}: 无变化")

    bugcrawl = POSTS / "2026-05-07-anthropic-bugcrawl-deep-dive.mdx"
    changed = process_bugcrawl(bugcrawl)
    if changed:
        total += 1
        print(f"  ✅ {bugcrawl.name}: {', '.join(changed)}")

    print(f"\n处理完成，共修改 {total} 个文件")


if __name__ == "__main__":
    main()
