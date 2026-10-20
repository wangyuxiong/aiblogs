#!/bin/bash
set -e

# 配置路径（仓库根目录 = 脚本上一级）
BLOG_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OBSIDIAN_DIR="${OBSIDIAN_PATH:-$HOME/Documents/Obsidian/blog}"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Obsidian to Blog Publisher${NC}"
echo "================================"

# 检查路径
if [ ! -d "$BLOG_REPO" ]; then
    echo -e "${RED}❌ Blog repo not found: $BLOG_REPO${NC}"
    exit 1
fi

if [ ! -d "$OBSIDIAN_DIR/_ready" ]; then
    echo "❌ Obsidian _ready folder not found: $OBSIDIAN_DIR/_ready"
    echo "Creating..."
    mkdir -p "$OBSIDIAN_DIR/_ready"
fi

# 统计待发布文章（.md 与 .mdx 都接受）
READY_FILES=()
while IFS= read -r -d '' f; do
    READY_FILES+=("$f")
done < <(find "$OBSIDIAN_DIR/_ready" -maxdepth 1 -type f \( -name '*.md' -o -name '*.mdx' \) -print0 2>/dev/null)

if [ "${#READY_FILES[@]}" -eq 0 ]; then
    echo "⚠️ No articles in _ready/ folder"
    echo "Move finished articles to _ready/ before publishing"
    exit 0
fi

echo -e "${BLUE}📄 Found ${#READY_FILES[@]} article(s) to publish${NC}"

# 复制文章：contentlayer 只识别 .mdx，因此 .md 统一改名
for src in "${READY_FILES[@]}"; do
    name=$(basename "$src")
    target_name="${name%.md}.mdx"
    # 若原本就是 .mdx，target_name 即自身
    if [[ "$name" == *.mdx ]]; then
        target_name="$name"
    fi
    cp "$src" "$BLOG_REPO/content/blog/$target_name"
    echo "  ✓ $name → content/blog/$target_name"
done

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

# 移动已发布文章到 published
mkdir -p "$OBSIDIAN_DIR/_published"
for src in "${READY_FILES[@]}"; do
    mv "$src" "$OBSIDIAN_DIR/_published/" 2>/dev/null || true
done

echo "📦 Articles moved to _published/"
