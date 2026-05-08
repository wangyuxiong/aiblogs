#!/usr/bin/env python3
"""
AI 新闻自动抓取 → 草稿生成系统 v2
每天运行一次，扫描 AI 新闻源，生成博客草稿供审核发布。

流程:
1. 解析各 RSS/Atom 源（feedparser）
2. 对比历史记录，找出新文章
3. 相关性过滤（AI/编程关键词）
4. 生成中文博客草稿 (MDX)
5. 保存到 content/blog/drafts/

使用: python3 scripts/news-crawler.py [--limit N] [--dry-run]
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    import feedparser
except ImportError:
    print("❌ 需要安装 feedparser: pip3 install feedparser")
    sys.exit(1)

# 配置
BLOG_DIR = Path(os.path.expanduser("~/workspace/aiblogs"))
DRAFTS_DIR = BLOG_DIR / "content" / "_drafts" / "news"
HISTORY_FILE = BLOG_DIR / "scripts" / ".news-history.json"

# 新闻源配置
SOURCES = [
    # AI 大厂
    {"name": "OpenAI Blog", "url": "https://openai.com/blog/rss.xml", "category": "ai-news"},
    {"name": "Anthropic News", "url": "https://www.anthropic.com/news.xml", "category": "ai-news"},
    {"name": "Google AI Blog", "url": "https://blog.google/technology/ai/rss/", "category": "ai-news"},
    {"name": "Meta AI Blog", "url": "https://ai.meta.com/blog/rss.xml", "category": "ai-news"},
    {"name": "Microsoft AI", "url": "https://blogs.microsoft.com/ai/feed/", "category": "ai-news"},
    
    # AI 技术社区
    {"name": "Hugging Face", "url": "https://huggingface.co/blog/feed.xml", "category": "ai-tutorial"},
    {"name": "Lilian Weng", "url": "https://lilianweng.github.io/index.xml", "category": "ai-tutorial"},
    {"name": "Sebastian Raschka", "url": "https://sebastianraschka.com/blog/", "category": "ai-tutorial"},
    
    # 技术新闻
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "category": "ai-news"},
    {"name": "The Verge AI", "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "category": "ai-news"},
    {"name": "Ars Technica AI", "url": "https://feeds.arstechnica.com/arstechnica/technology-lab", "category": "ai-news"},
]

# 过滤关键词
INTEREST_KEYWORDS = [
    "claude", "gpt", "gemini", "llm", "agent", "multi-agent",
    "model", "training", "fine-tune", "rag", "embedding",
    "open source", "open-source", "release", "launch",
    "anthropic", "openai", "deepmind", "hugging face",
    "vllm", "langchain", "crew", "autonomous",
    "coding", "code generation", "dev tool",
    "token", "inference", "benchmark", "swe-bench",
    "claude code", "cursor", "copilot",
    "code review", "static analysis", "sast",
    "diffusion", "transformer", "mixture of experts", "moe",
    "reinforcement learning", "rlhf", "dpo", "grpo",
    "multimodal", "vision", "speech", "audio",
]

# 排除关键词（过滤不相关内容）
EXCLUDE_KEYWORDS = [
    "crypto", "bitcoin", "nft", "blockchain",
    "earnings", "revenue", "quarterly",  # 财报类
    "stock price", "shareholder",
]


def load_history():
    """加载已处理的文章历史"""
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return {"processed_urls": [], "last_run": None}


def save_history(history):
    """保存处理历史（保留最近 1000 条）"""
    history["processed_urls"] = history["processed_urls"][-1000:]
    history["last_run"] = datetime.now().isoformat()
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


def is_relevant(title, summary=""):
    """判断文章是否与 AI/编程相关"""
    text = (title + " " + summary).lower()
    
    # 排除不相关
    if any(kw in text for kw in EXCLUDE_KEYWORDS):
        return False
    
    # 匹配兴趣关键词
    return any(kw in text for kw in INTEREST_KEYWORDS)


def fetch_source(source):
    """抓取一个 RSS 源"""
    try:
        feed = feedparser.parse(source["url"])
        if feed.bozo and not feed.entries:
            # 尝试修复：有些源的 XML 不规范，feedparser 仍能部分解析
            if hasattr(feed, 'entries') and len(feed.entries) > 0:
                pass  # 继续处理
            else:
                print(f"  ⚠️  {source['name']}: 抓取失败 ({feed.bozo_exception})")
                return []
        
        articles = []
        for entry in feed.entries[:20]:  # 每个源最多取 20 篇
            article = {
                "title": entry.get("title", "").strip(),
                "url": entry.get("link", "").strip(),
                "summary": entry.get("summary", entry.get("description", "")),
                "published": entry.get("published", entry.get("updated", "")),
                "source": source["name"],
                "category": source["category"],
            }
            # 清理 summary 中的 HTML
            article["summary"] = re.sub(r'<[^>]+>', '', article["summary"])[:500]
            if article["title"] and article["url"]:
                articles.append(article)
        return articles
    except Exception as e:
        print(f"  ❌ {source['name']}: {e}")
        return []


def generate_draft(article):
    """生成中文博客草稿"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 生成 slug
    slug = re.sub(r'[^a-z0-9]+', '-', article["title"].lower().strip('-'))
    slug = slug[:80].rstrip('-')
    if not slug:
        slug = "ai-news-" + today
    
    filename = f"{slug_date_prefix(today)}-{slug}.mdx"
    
    # 确保文件名不重复
    filepath = DRAFTS_DIR / filename
    counter = 1
    while filepath.exists():
        filename = f"{slug_date_prefix(today)}-{slug}-{counter}.mdx"
        filepath = DRAFTS_DIR / filename
        counter += 1
    
    # 标签
    category_tags = {
        "ai-news": ["AI新闻", "行业动态"],
        "ai-tutorial": ["AI教程", "技术分享"],
    }
    tags = category_tags.get(article["category"], ["AI新闻"])
    
    # 标题翻译提示
    title = article["title"]
    
    frontmatter = f"""---
title: "{title}"
excerpt: "本文来自 {article['source']}，报道了 AI 领域的最新进展。"
date: {today}
category: {article["category"]}
tags: {json.dumps(tags, ensure_ascii=False)}
isDraft: true
isFeatured: false
source_url: "{article['url']}"
source_name: "{article['source']}"
---

"""
    
    body = f"""> 本文编译自 [{article['source']}]({article['url']})，原文链接: {article['url']}

# {title}

## 核心要点

（待补充：用 3-5 个要点概括文章核心内容）

## 详细内容

（待补充：基于原文展开详细分析，加入自己的技术解读）

## 我的看法

（待补充：这个进展对行业意味着什么？对我们的工作有什么影响？）

---

*编译自 {article['source']}。*
"""
    
    return filepath, frontmatter + body


def slug_date_prefix(date_str):
    """生成带日期的 slug 前缀"""
    return date_str


def main():
    limit = 5
    dry_run = False
    
    if '--limit' in sys.argv:
        idx = sys.argv.index('--limit')
        if idx + 1 < len(sys.argv):
            limit = int(sys.argv[idx + 1])
    
    if '--dry-run' in sys.argv:
        dry_run = True
    
    print("=" * 60)
    print(f"🤖 AI 新闻爬虫 v2 — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)
    
    # 加载历史
    history = load_history()
    processed = set(history["processed_urls"])
    
    # 抓取所有源
    all_articles = []
    for source in SOURCES:
        print(f"\n📡 抓取: {source['name']}")
        articles = fetch_source(source)
        print(f"   找到 {len(articles)} 篇")
        all_articles.extend(articles)
        time.sleep(1)  # 礼貌延迟
    
    # 去重 + 过滤
    new_articles = []
    for article in all_articles:
        if article["url"] in processed:
            continue
        if not is_relevant(article["title"], article["summary"]):
            continue
        new_articles.append(article)
        processed.add(article["url"])
    
    print(f"\n📰 相关新文章: {len(new_articles)} 篇")
    
    if not new_articles:
        print("📭 没有需要处理的新文章")
        save_history({"processed_urls": list(processed), "last_run": datetime.now().isoformat()})
        return
    
    # 生成草稿
    count = 0
    for article in new_articles[:limit]:
        print(f"\n📝 [{article['source']}] {article['title']}")
        
        if dry_run:
            print("   (dry-run mode, skip)")
            count += 1
            continue
        
        filepath, content = generate_draft(article)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(content, encoding='utf-8')
        
        print(f"   ✅ → {filepath.name}")
        count += 1
    
    # 保存历史
    save_history({"processed_urls": list(processed), "last_run": datetime.now().isoformat()})
    
    print(f"\n{'=' * 60}")
    print(f"✅ 本次生成 {count} 篇草稿")
    print(f"📁 目录: {DRAFTS_DIR}")
    print(f"🔗 历史: {HISTORY_FILE}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
