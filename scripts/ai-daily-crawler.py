#!/usr/bin/env python3
"""
AI 学习日刊 — 每日新闻汇总生成器 v3
每天运行一次，抓取 AI 新闻，汇总成一篇日刊文章。

参考: 阮一峰科技爱好者周刊 (https://www.ruanyifeng.com/blog/weekly/)
格式: 每日一期，包含多条 AI 新闻的精选摘要

流程:
1. 解析各 RSS/Atom 源（feedparser）
2. 对比历史记录，找出 24h 内的新文章
3. 相关性过滤（AI/编程关键词）
4. 按主题分类汇总，生成一篇日刊 MDX
5. 保存到 content/blog/ 目录，自动发布

使用: python3 scripts/ai-daily-crawler.py [--dry-run]
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

# 设置全局 socket 超时
import socket
socket.setdefaulttimeout(15)

# 配置
BLOG_DIR = Path(os.path.expanduser("~/workspace/aiblogs"))
POSTS_DIR = BLOG_DIR / "content" / "blog"
HISTORY_FILE = BLOG_DIR / "scripts" / ".ai-daily-history.json"

# 新闻源配置
SOURCES = [
    {"name": "OpenAI Blog", "url": "https://openai.com/news/rss.xml", "weight": 10},
    {"name": "Anthropic News", "url": "https://www.anthropic.com/news.xml", "weight": 10},
    {"name": "Google AI Blog", "url": "https://blog.google/technology/ai/rss/", "weight": 10},
    {"name": "Meta AI Blog", "url": "https://ai.meta.com/blog/rss.xml", "weight": 8},
    {"name": "Microsoft AI", "url": "https://blogs.microsoft.com/ai/feed/", "weight": 8},
    {"name": "Hugging Face", "url": "https://huggingface.co/blog/feed.xml", "weight": 8},
    {"name": "Lilian Weng", "url": "https://lilianweng.github.io/index.xml", "weight": 7},
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "weight": 6},
    {"name": "The Verge AI", "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "weight": 6},
    {"name": "Ars Technica AI", "url": "https://feeds.arstechnica.com/arstechnica/technology-lab", "weight": 6},
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
    "diffusion", "transformer", "mixture of experts", "moe",
    "reinforcement learning", "rlhf", "dpo", "grpo",
    "multimodal", "vision", "speech", "audio",
    "google", "meta", "microsoft", "amazon", "nvidia",
    "startup", "funding", "acquisition", "partnership",
    "safety", "alignment", "governance", "regulation",
    "productivity", "workflow", "automation",
    "api", "sdk", "platform", "tool",
    "research", "paper", "study", "breakthrough",
    "chatgpt", "copilot", "gemini", "claude",
    "enterprise", "business", "developer",
    "data", "privacy", "security", "ethics",
]

EXCLUDE_KEYWORDS = [
    "crypto", "bitcoin", "nft", "blockchain",
    "earnings", "revenue", "quarterly",
    "stock price", "shareholder", "dividend",
    "ipo", "merger", "acquisition"  # 纯商业新闻
]

# 主题分类映射
TOPIC_CATEGORIES = {
    "模型发布": ["launch", "release", "introducing", "announcing", "new model", "announced"],
    "Agent/工具": ["agent", "claude code", "copilot", "cursor", "tool", "sdk", "api", "platform"],
    "开源项目": ["open source", "open-source", "github", "hugging face", "release"],
    "研究进展": ["research", "paper", "study", "breakthrough", "arxiv", "benchmark"],
    "商业动态": ["funding", "startup", "partnership", "enterprise", "business"],
    "安全/治理": ["safety", "alignment", "governance", "regulation", "privacy", "security"],
    "开发者": ["developer", "coding", "code generation", "programming", "dev tool"],
    "产品更新": ["update", "feature", "improvement", "enhancement"],
}


def load_history():
    """加载已处理的文章历史"""
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return {"processed_urls": [], "last_run": None, "daily_issues": []}


def save_history(history):
    """保存处理历史"""
    history["last_run"] = datetime.now().isoformat()
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


def is_relevant(title, summary=""):
    """判断文章是否与 AI/编程相关"""
    text = (title + " " + summary).lower()
    if any(kw in text for kw in EXCLUDE_KEYWORDS):
        return False
    return any(kw in text for kw in INTEREST_KEYWORDS)


def categorize_article(title, summary=""):
    """根据标题和摘要判断文章主题"""
    text = (title + " " + summary).lower()
    for category, keywords in TOPIC_CATEGORIES.items():
        if any(kw in text for kw in keywords):
            return category
    return "其他动态"


def fetch_source(source):
    """抓取一个 RSS 源"""
    try:
        feed = feedparser.parse(source["url"])
        articles = []
        for entry in feed.entries[:15]:  # 每个源最多取 15 篇
            # 解析发布时间
            published = entry.get("published", entry.get("updated", ""))
            article = {
                "title": entry.get("title", "").strip(),
                "url": entry.get("link", "").strip(),
                "summary": re.sub(r'<[^>]+>', '', entry.get("summary", entry.get("description", "")))[:400],
                "published": published,
                "source": source["name"],
                "source_weight": source.get("weight", 5),
            }
            if article["title"] and article["url"]:
                articles.append(article)
        return articles
    except Exception as e:
        print(f"  ❌ {source['name']}: {e}")
        return []


def generate_daily_issue(articles, date_str):
    """生成一篇日刊文章"""
    
    # 按主题分组
    categorized = {}
    for article in articles:
        topic = categorize_article(article["title"], article["summary"])
        if topic not in categorized:
            categorized[topic] = []
        categorized[topic].append(article)
    
    # 排序：按主题优先级 + 文章权重
    topic_order = ["模型发布", "Agent/工具", "开源项目", "研究进展", "商业动态", "产品更新", "安全/治理", "开发者", "其他动态"]
    
    # 构建正文
    body_lines = []
    body_lines.append(f"今天是 {date_str}，以下是 AI 领域值得关注的新闻和动态。\n")
    
    for topic in topic_order:
        if topic not in categorized or not categorized[topic]:
            continue
        
        body_lines.append(f"\n## {topic}\n")
        
        for article in categorized[topic][:5]:  # 每个主题最多 5 条
            title = article["title"]
            url = article["url"]
            source = article["source"]
            summary = article["summary"]
            
            # 生成中文标题（简单翻译/保留英文）
            body_lines.append(f"\n### [{title}]({url})")
            body_lines.append(f"\n> 来源：{source}")
            
            if summary and len(summary) > 20:
                # 截取摘要前 150 字
                short_summary = summary[:150] + "..." if len(summary) > 150 else summary
                body_lines.append(f"\n{short_summary}")
            
            body_lines.append("")  # 空行分隔
    
    # 构建完整的 MDX 文件
    slug = f"ai-daily-{date_str}"
    
    # 提取标签
    all_tags = set()
    for article in articles:
        topic = categorize_article(article["title"], article["summary"])
        all_tags.add(topic)
    
    frontmatter = f"""---
title: "AI 学习日刊 · {date_str}"
excerpt: "{len(articles)} 条 AI 领域精选动态，涵盖模型发布、Agent 工具、研究进展等。"
date: {date_str}
category: ai-daily
tags: [{', '.join(sorted(all_tags))}]
isDraft: false
isFeatured: false
coverImage: "/images/ai-daily-cover.png"
---

"""
    
    # 日刊头部
    header = f"""# AI 学习日刊 · {date_str}

> 每天精选 AI 领域最有价值的动态，帮你快速了解行业脉搏。
> 
> 📅 本期收录：**{len(articles)}** 条动态 | 🏷️ 涵盖：**{', '.join(sorted(all_tags)[:5])}** 等

---

"""
    
    # 日刊尾部
    footer = f"""\n---

## 📌 关于 AI 学习日刊

**AI 学习日刊**是一个每日更新的 AI 资讯聚合栏目，每天从数十个 AI 新闻源中筛选最有价值的动态，
按主题分类整理，帮助你用最短的时间了解 AI 行业最新进展。

**订阅方式：**
- 🌐 网站：[mind-keeper.com/daily](https://mind-keeper.com/daily)
- 📡 RSS：[mind-keeper.com/daily/feed.xml](https://mind-keeper.com/daily/feed.xml)

**数据来源：** OpenAI、Anthropic、Google AI、Meta AI、Hugging Face 等 {len(SOURCES)} 个优质 AI 新闻源。

---

*本文档由 AI 自动抓取和整理，如有疏漏欢迎指正。*
"""
    
    content = frontmatter + header + "\n".join(body_lines) + footer
    
    return slug, content


def main():
    dry_run = '--dry-run' in sys.argv
    
    today = datetime.now()
    date_str = today.strftime("%Y-%m-%d")
    
    print("=" * 60)
    print(f"🤖 AI 学习日刊 — {date_str}")
    print("=" * 60)
    
    # 加载历史
    history = load_history()
    processed = set(history.get("processed_urls", []))
    
    # 抓取所有源
    all_articles = []
    for source in SOURCES:
        print(f"\n📡 抓取: {source['name']}")
        articles = fetch_source(source)
        print(f"   找到 {len(articles)} 篇")
        all_articles.extend(articles)
        time.sleep(0.5)  # 礼貌延迟
    
    # 去重 + 过滤
    new_articles = []
    seen_urls = set()
    for article in all_articles:
        if article["url"] in processed or article["url"] in seen_urls:
            continue
        if not is_relevant(article["title"], article["summary"]):
            continue
        seen_urls.add(article["url"])
        new_articles.append(article)
    
    print(f"\n📰 今日相关新文章: {len(new_articles)} 篇")
    
    if len(new_articles) < 3:
        print("📭 文章数量不足，跳过今日日刊生成")
        # 仍然保存历史
        processed.update(seen_urls)
        history["processed_urls"] = list(processed)[-2000:]  # 保留最近 2000 条
        save_history(history)
        return
    
    # 生成日刊
    print(f"\n📝 生成日刊...")
    slug, content = generate_daily_issue(new_articles, date_str)
    
    if dry_run:
        print(f"\n📄 [DRY RUN] 日刊预览 ({len(new_articles)} 条动态):")
        print("-" * 40)
        print(content[:2000])
        print("...")
        print("-" * 40)
        return
    
    # 保存文件
    filename = f"{slug}.mdx"
    filepath = POSTS_DIR / filename
    
    # 确保目录存在
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 写入文件
    filepath.write_text(content, encoding='utf-8')
    print(f"\n✅ 日刊已生成: {filepath}")
    
    # 保存历史
    processed.update(seen_urls)
    history["processed_urls"] = list(processed)[-2000:]
    history["daily_issues"] = history.get("daily_issues", []) + [{
        "date": date_str,
        "slug": slug,
        "article_count": len(new_articles),
    }]
    save_history(history)
    
    print(f"\n{'=' * 60}")
    print(f"✅ AI 学习日刊 · {date_str}")
    print(f"📊 收录动态: {len(new_articles)} 条")
    print(f"📁 文件路径: {filepath}")
    print(f"🚀 下一步: git add . && git commit && git push")
    print(f"{'=' * 60}")
    
    return str(filepath)


if __name__ == "__main__":
    main()
