#!/bin/bash
set -e

# 配置路径
BLOG_REPO="$HOME/workspace/aiblogs"
OBSIDIAN_DIR="${OBSIDIAN_PATH:-$HOME/Documents/Obsidian/blog}"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Obsidian to Blog Publisher${NC}"
echo "================================"

# 检查路径
if [ ! -d "$BLOG_REPO" ]; then
    echo "❌ Blog repo not found: $BLOG_REPO"
    exit 1
fi

if [ ! -d "$OBSIDIAN_DIR/_ready" ]; then
    echo "❌ Obsidian _ready folder not found: $OBSIDIAN_DIR/_ready"
    echo "Creating..."
    mkdir -p "$OBSIDIAN_DIR/_ready"
fi

# 统计待发布文章
READY_COUNT=$(ls -1 "$OBSIDIAN_DIR/_ready"/*.md 2>/dev/null | wc -l)

if [ "$READY_COUNT" -eq 0 ]; then
    echo "⚠️ No articles in _ready/ folder"
    echo "Move finished articles to _ready/ before publishing"
    exit 0
fi

echo -e "${BLUE}📄 Found $READY_COUNT article(s) to publish${NC}"

# 复制文章
echo "📁 Copying articles..."
cp "$OBSIDIAN_DIR/_ready/"*.md "$BLOG_REPO/content/blog/" 2>/dev/null || true

# 复制图片
if [ -d "$OBSIDIAN_DIR/images" ]; then
    echo "🖼️  Copying images..."
    mkdir -p "$BLOG_REPO/public/images"
    cp -r "$OBSIDIAN_DIR/images/"* "$BLOG_REPO/public/images/" 2>/dev/null || true
fi

# 提交到 Git
cd "$BLOG_REPO"

if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️ No changes to commit"
    exit 0
fi

echo "📤 Committing changes..."
git add .
git commit -m "blog: publish from obsidian $(date +%Y-%m-%d)"

echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo -e "${GREEN}✅ Published successfully!${NC}"
echo "🌐 Your blog will be updated in 2-3 minutes"
echo "   https://mind-keeper.com"

# 可选：移动已发布文章到 published
mkdir -p "$OBSIDIAN_DIR/_published"
mv "$OBSIDIAN_DIR/_ready/"*.md "$OBSIDIAN_DIR/_published/" 2>/dev/null || true

echo "📦 Articles moved to _published/"
