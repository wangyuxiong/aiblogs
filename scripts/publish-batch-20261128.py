#!/usr/bin/env python3
"""Batch-publish 8 posts from ~/Documents/posts to content/blog (2026-11-28)."""
import re, shutil, sys
from pathlib import Path

SRC = Path.home() / "Documents" / "posts"
ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "content" / "blog"
IMG = ROOT / "public" / "images"

POSTS = [
    dict(slug="dsh-microkernel", date="2026-11-24", category="ai-tutorial",
         title="连 Agent 主循环都是插件：DSH 微内核到底激进在哪",
         excerpt="一切皆插件不稀奇，稀奇的是连 Agent 主循环都是插件，卸载还能自动回滚。从 Cordis 微内核 2811 行源码看 DSH 的激进设计：可逆效应、响应式依赖、热更边界与自我进化闭环。",
         tags=["AI Agent", "DeepSeek Harness", "微内核", "插件化", "源码分析"]),
    dict(slug="ai-context-traffic", date="2026-11-24", category="ai-tutorial",
         title="为什么你的 AI 助手，转头就忘了你说过什么？",
         excerpt="AI 助手转头就忘，不是模型笨，是记忆机制跟你想的完全不一样。三个反直觉的真相：它没有记忆、上下文不是越多越好、把记忆放到模型外面才靠谱。",
         tags=["AI Agent", "上下文工程", "记忆", "科普"]),
    dict(slug="ai-hallucination-traffic", date="2026-11-25", category="ai-news",
         title="AI 一本正经胡说八道，OpenAI 承认：是我们教出来的",
         excerpt="OpenAI 论文说透了：AI 一本正经胡说八道，是被奖励猜测的训练方式一步步教出来的。它编的时候毫无察觉，语气笃定、格式工整，看起来比正确答案还真。",
         tags=["AI", "幻觉", "OpenAI", "训练机制", "科普"]),
    dict(slug="test-ai-loop", date="2026-11-25", category="ai-tutorial",
         title="AI 写代码越来越快，测试为什么反而更累了？",
         excerpt="AI 十分钟写完功能，单测全绿，上线当晚报警。我们把测试通过当成了验证可信，而这两件事的距离正被 AI 越拉越大。从 DORA、METR 到论文，拆 AI 时代的测试闭环。",
         tags=["AI编程", "测试", "Test AI Loop", "质量工程"]),
    dict(slug="dsh-autonomy", date="2026-11-26", category="ai-tutorial",
         title="当 Agent 有了闹钟和长期目标：DSH 的自治三件套",
         excerpt="让 Agent 拥有明天，靠的不是 prompt，是三个正交的工程包：Schedule 闹钟、Goal 长期目标、Subagent 分身。每一层都埋着同一个设计直觉：自治不等于放任。",
         tags=["AI Agent", "DeepSeek Harness", "自治", "源码分析"]),
    dict(slug="dsh-persistence", date="2026-11-27", category="ai-tutorial",
         title="让 Agent 拥有“昨天”：DSH 的会话持久化机制",
         excerpt="进程被杀后，Agent 还能说清刚才发生了什么吗？DSH 用只追加事件日志保存可重建的执行历史：单写者、崩溃恢复追加修复事件、投影与缓存都从日志派生。",
         tags=["AI Agent", "DeepSeek Harness", "事件溯源", "持久化", "源码分析"]),
    dict(slug="dsh-compaction", date="2026-11-27", category="ai-tutorial",
         title="上下文满了怎么办：DSH 的压缩经济学",
         excerpt="上下文满了怎么办？DSH 把压缩当一笔经济账：阈值与保留预算、表层只改一次、原始日志永远保留，KV Cache 失效成本也要入账。省什么，又不能丢什么。",
         tags=["AI Agent", "DeepSeek Harness", "上下文工程", "压缩", "源码分析"]),
    dict(slug="dsh-recap", date="2026-11-28", category="ai-tutorial",
         title="拆了 6 篇 DSH，我看到的 Agent 设计哲学",
         excerpt="拆完六篇 DSH 源码，最吸引我的不是某个功能，而是几件分散的事反复做出同一种选择。五条贯穿始终的设计哲学：可逆、单写者、状态不等于授权、日志为证、表层只改一次。",
         tags=["AI Agent", "DeepSeek Harness", "架构", "设计哲学", "系列复盘"]),
]

SERIES = ["dsh-superagent", "dsh-router-worker", "dsh-microkernel",
          "dsh-autonomy", "dsh-persistence", "dsh-compaction"]

def fix_microkernel(t):
    t = t.replace("ctx.<key>", "`ctx.<key>`")
    t = t.replace("@deepseek-ai/cordis/src/{fiber,registry,reflect,events}.ts",
                  "`@deepseek-ai/cordis/src/{fiber,registry,reflect,events}.ts`")
    t = t.replace(
        "11. 前篇：DSH 工程拆解 /Users/metaboy/Documents/posts/dsh-superagent/article.md ；Router/Worker 双层架构 /Users/metaboy/Documents/posts/dsh-router-worker/article.md",
        "11. 前篇：[DSH 工程拆解](/blog/dsh-superagent)；[Router/Worker 双层架构](/blog/dsh-router-worker)")
    return t

def fix_autonomy(t):
    t = t.replace("这个内核本身我在上一篇拆过",
                  "这个内核本身我在[上一篇](/blog/dsh-microkernel)拆过")
    t = t.replace("(../dsh-superagent/article.md)", "(/blog/dsh-superagent)")
    t = t.replace("(../dsh-router-worker/article.md)", "(/blog/dsh-router-worker)")
    t = t.replace("(../dsh-microkernel/article.md)", "(/blog/dsh-microkernel)")
    return t

def fix_recap(t):
    for s in SERIES:
        t = t.replace(s, f"[{s}](/blog/{s})")
    return t

def fix_context_traffic(t):
    t = t.replace("下一篇，我们拆一个更狠的",
                  "[下一篇](/blog/dsh-microkernel)，我们拆一个更狠的")
    return t

FIXERS = {"dsh-microkernel": fix_microkernel, "dsh-autonomy": fix_autonomy,
          "dsh-recap": fix_recap, "ai-context-traffic": fix_context_traffic}

def yaml_str(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

errors = []
for p in POSTS:
    slug = p["slug"]
    src_dir = SRC / slug
    text = (src_dir / "article.md").read_text(encoding="utf-8")
    # copy images: cover -> <slug>-cover.png, others keep basename (unique across posts)
    for img in sorted((src_dir / "images").glob("*.png")):
        dest_name = f"{slug}-cover.png" if img.name == "cover.png" else img.name
        shutil.copy2(img, IMG / dest_name)
        old = f"images/{img.name}"
        new = f"/images/{dest_name}"
        if old not in text:
            errors.append(f"{slug}: ref {old} not found in article")
        text = text.replace(old, new)
    if slug in FIXERS:
        text = FIXERS[slug](text)
    # sanity: no leftover local refs / mdx hazards outside code
    for pat, label in [(r"(?<!/)images/", "leftover relative image ref"),
                       (r"\]\(\.\./", "leftover relative link"),
                       (r"\]\(/Users/", "leftover local link")]:
        for m in re.finditer(pat, text):
            line = text[:m.start()].count("\n") + 1
            errors.append(f"{slug}:{line}: {label}")
    tags = "[" + ", ".join(yaml_str(t) for t in p["tags"]) + "]"
    fm = (f'---\ntitle: {yaml_str(p["title"])}\nexcerpt: {yaml_str(p["excerpt"])}\n'
          f'date: {p["date"]}\ncategory: {p["category"]}\ntags: {tags}\n'
          f'isDraft: false\ncoverImage: "/images/{slug}-cover.png"\n---\n\n')
    (BLOG / f"{slug}.mdx").write_text(fm + text, encoding="utf-8")
    print(f"OK {slug}.mdx ({len(text)} chars)")

if errors:
    print("\nWARNINGS:")
    print("\n".join(errors))
    sys.exit(1)
print("\nAll 8 posts written, no leftover local refs.")
