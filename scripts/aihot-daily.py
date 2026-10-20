#!/usr/bin/env python3
"""
AIHOT → 站点日报生成器

从 AIHOT 公开 API（匿名只读，无需 Key）抓取过去 24 小时的
技术与产品向动态，整理成一篇 content/blog/ai-daily-YYYY-MM-DD.mdx。

数据源: https://aihot.news/api/v1/items
文档:   https://aihot.news/agent
接口说明: https://aihot.news/api/v1/agent

用法:
    python3 scripts/aihot-daily.py            # 生成当天日报（已存在则跳过）
    python3 scripts/aihot-daily.py --force    # 覆盖当天文件
    python3 scripts/aihot-daily.py --dry-run  # 只打印，不写文件

退出码:
    0  成功生成 / 已存在跳过 / 数据不足跳过
    1  网络或接口错误
"""

import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
POSTS_DIR = REPO / "content" / "blog"

API_BASE = "https://aihot.news"
USER_AGENT = "mind-keeper-daily/1.0 (+https://mind-keeper.com)"

# 只取技术与产品向分类：(category, 章节标题, 最多条数)
CATEGORIES = [
    ("ai-models", "模型与技术", 6),
    ("ai-products", "产品与工具", 6),
    ("paper", "研究进展", 3),
    ("tip", "实用技巧", 3),
]

MIN_ITEMS = 3
GENERATED_MARKER = "{/* generated-by: scripts/aihot-daily.py */}"

try:
    from zoneinfo import ZoneInfo

    BEIJING = ZoneInfo("Asia/Shanghai")
except Exception:  # 兜底：无 tzdata 时按 UTC+8
    BEIJING = timezone(timedelta(hours=8))


def fetch_json(path: str) -> dict:
    """GET JSON，带一次重试；429 遵循 Retry-After。"""
    url = API_BASE + path
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        },
    )
    last_error = None
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as err:
            last_error = err
            if err.code == 429 and attempt == 0:
                retry_after = 5
                try:
                    retry_after = int(err.headers.get("Retry-After") or 5)
                except (TypeError, ValueError):
                    pass
                time.sleep(min(max(retry_after, 1), 30))
                continue
            if 500 <= err.code < 600 and attempt == 0:
                time.sleep(3)
                continue
            raise
        except (urllib.error.URLError, TimeoutError) as err:
            last_error = err
            if attempt == 0:
                time.sleep(3)
                continue
            raise
    raise last_error  # pragma: no cover


def fetch_category(category: str, limit: int = 30) -> list[dict]:
    query = urllib.parse.urlencode(
        {
            "window": "24h",
            "mode": "selected",
            "by": "timeline",
            "limit": limit,
            "category": category,
        }
    )
    data = fetch_json(f"/api/v1/items?{query}")
    return data.get("items") or []


def beijing_now() -> datetime:
    return datetime.now(BEIJING)


def md_escape(text: str, limit: int = 800) -> str:
    """把第三方文本处理成 MDX 安全的内联文本。"""
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", "", text)  # 去 HTML 标签
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[:limit].rstrip() + "…"
    text = text.replace("&", "&amp;")
    text = text.replace("\\", "\\\\")
    for ch in "[]{}<>*_`|~#":
        text = text.replace(ch, "\\" + ch)
    return text


def md_url(url: str) -> str | None:
    """校验并规范化链接；只允许 http(s)。"""
    if not url:
        return None
    parsed = urllib.parse.urlsplit(url.strip())
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None
    # 尖括号包裹目标地址，规避括号/空格破坏 Markdown 链接
    return urllib.parse.quote(url.strip(), safe=":/?#[]@!$&'+,;=%~")


def fmt_item(item: dict, sources: dict) -> list[str]:
    title = md_escape(item.get("title") or item.get("originalTitle") or "")
    original = md_url((item.get("links") or {}).get("original") or "")
    aihot_url = md_url((item.get("links") or {}).get("aihot") or "")
    source = md_escape((item.get("source") or {}).get("name") or "", limit=60)
    summary = md_escape(item.get("summary") or "", limit=400)
    reason = md_escape(item.get("reason") or "", limit=200)
    published = item.get("publishedAt") or ""

    when = ""
    if published:
        try:
            dt = datetime.fromisoformat(published.replace("Z", "+00:00")).astimezone(BEIJING)
            when = dt.strftime("%m-%d %H:%M")
        except ValueError:
            when = published[:10]

    heading = f"### [{title}](<{original}>)" if original else f"### {title}"
    lines = [heading, ""]
    if source:
        lines.append(f"- **来源**：{source}")
    if when:
        lines.append(f"- **发布**：{when}（北京时间）")
    if summary:
        lines.append(f"- **摘要**：{summary}")
    if reason:
        lines.append(f"- **推荐理由**：{reason}")
    if aihot_url:
        lines.append(f"- **收录**：[AIHOT 条目](<{aihot_url}>)")
    lines.append("")
    return lines


def build_excerpt(items: list[dict]) -> str:
    titles = [md_escape((it.get("title") or "").strip(), limit=60) for it in items[:3]]
    titles = [t for t in titles if t]
    head = "；".join(titles)
    excerpt = f"今日 {len(items)} 条技术与产品动态：{head}。"
    if len(excerpt) > 150:
        excerpt = excerpt[:149].rstrip() + "…"
    return excerpt


def build_daily(groups: list[tuple[str, list[dict]]], date_str: str) -> str:
    items = [item for _, group in groups for item in group]
    sections = []
    for label, group in groups:
        if not group:
            continue
        sections.append(f"## {label}")
        sections.append("")
        for item in group:
            sections.extend(fmt_item(item, {}))

    top_titles = "；".join(
        md_escape((it.get("title") or "").strip(), limit=80) for it in items[:2]
    )
    frontmatter = "\n".join(
        [
            "---",
            f"title: {json.dumps(f'AI 学习日刊 · {date_str}', ensure_ascii=False)}",
            f"excerpt: {json.dumps(build_excerpt(items), ensure_ascii=False)}",
            f"date: {json.dumps(date_str)}",
            "category: ai-daily",
            "tags: "
            + json.dumps(
                ["AI日报", "AI动态", "技术与产品"]
                + [label for label, group in groups if group],
                ensure_ascii=False,
            ),
            'coverImage: "/images/ai-daily-cover.svg"',
            "isDraft: false",
            "isFeatured: false",
            "---",
        ]
    )

    body = [
        frontmatter,
        "",
        f"> 今日聚焦：{top_titles}。",
        "",
        "---",
        "",
        *sections,
        "---",
        "",
        "## 📌 关于 AI 学习日刊",
        "",
        "**AI 学习日刊**每天从公开信息中筛选 AI 技术与产品动态，按主题整理，"
        "帮助你用最短时间了解行业前沿。",
        "",
        f"**数据来源**：[AIHOT](https://aihot.news) 公开 API（匿名只读），本期收录 {len(items)} 条。"
        "标题与摘要来自第三方信源，请以原文为准。",
        "",
        "- 🌐 网站：https://mind-keeper.com/daily",
        "- 📡 RSS：https://mind-keeper.com/feed.xml",
        "",
        "---",
        "",
        "*本文由脚本自动抓取整理，如有疏漏欢迎指正。*",
        "",
        GENERATED_MARKER,
        "",
    ]
    return "\n".join(body)


def collect() -> tuple[list[tuple[str, list[dict]]], dict]:
    groups = []
    stats = {}
    seen_ids: set[str] = set()
    seen_titles: set[str] = set()

    for category, label, cap in CATEGORIES:
        try:
            raw = fetch_category(category)
        except Exception as err:  # 单个分类失败不影响整体
            print(f"  ⚠️ {label} 抓取失败: {err}")
            groups.append((label, []))
            stats[label] = 0
            continue

        picked = []
        for item in raw:
            item_id = item.get("id")
            title_key = re.sub(r"\s+", "", (item.get("title") or "").lower())
            if not item_id or item_id in seen_ids or title_key in seen_titles:
                continue
            if not item.get("selected"):
                continue
            if not (item.get("title") and item.get("summary")):
                continue
            if not md_url((item.get("links") or {}).get("original") or ""):
                continue
            seen_ids.add(item_id)
            seen_titles.add(title_key)
            picked.append(item)

        picked.sort(key=lambda it: it.get("publishedAt") or "", reverse=True)
        picked = picked[:cap]
        groups.append((label, picked))
        stats[label] = len(picked)

    return groups, stats


def main() -> int:
    dry_run = "--dry-run" in sys.argv
    force = "--force" in sys.argv

    now = beijing_now()
    date_str = now.strftime("%Y-%m-%d")

    print(f"🤖 AI 日报生成 · {date_str}（北京时间 {now:%H:%M}）")

    try:
        groups, stats = collect()
    except Exception as err:
        print(f"❌ 抓取失败: {err}")
        return 1

    total = sum(len(g) for _, g in groups)
    print("   " + " | ".join(f"{label}: {n}" for label, n in stats.items()))
    if total < MIN_ITEMS:
        print(f"📭 今日精选不足 {MIN_ITEMS} 条，跳过生成")
        return 0

    content = build_daily(groups, date_str)

    if dry_run:
        print("-" * 60)
        print(content[:3000])
        print("...")
        print("-" * 60)
        return 0

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    target = POSTS_DIR / f"ai-daily-{date_str}.mdx"
    if target.exists():
        existing = target.read_text(encoding="utf-8")
        generated_by_script = GENERATED_MARKER in existing
        if not force:
            print(f"⏭️  已存在，跳过: {target.relative_to(REPO)}（用 --force 覆盖）")
            return 0
        if not generated_by_script:
            print(
                f"⚠️  已存在人工编辑的日报，拒绝覆盖: {target.relative_to(REPO)}"
            )
            return 0

    target.write_text(content, encoding="utf-8")
    print(f"✅ 已生成: {target.relative_to(REPO)}（{total} 条）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
