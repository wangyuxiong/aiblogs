#!/bin/bash
#
# 快速发布脚本 - 在任意设备上发布文章到 mind-keeper.com
# 用法: ./quick-publish.sh <文件路径> ["提交说明"]
#       ./quick-publish.sh --new
#
# 注意：contentlayer 只识别 content/blog/**/*.mdx，
# 因此 .md 文件会被自动改名为 .mdx 后发布。
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REPO_URL="https://github.com/wangyuxiong/aiblogs.git"
BLOG_URL="https://mind-keeper.com"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 可用分类（与 contentlayer.config.ts 的 enum 保持一致）
CATEGORIES="ai-daily | ai-news | ai-tutorial | open-source | travel-guide | remote-work | income-report | gear | photography"

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}用法:${NC}"
    echo "  ./quick-publish.sh <文件路径> [\"提交说明\"]"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  ./quick-publish.sh ~/Documents/my-post.mdx"
    echo "  ./quick-publish.sh ~/Documents/my-post.md \"add my post\""
    echo ""
    echo -e "${YELLOW}快速模式（交互式输入）:${NC}"
    echo "  ./quick-publish.sh --new"
    exit 0
fi

# 快速创建模式
if [ "$1" == "--new" ]; then
    echo -e "${BLUE}📝 创建新文章${NC}"
    echo "==============="

    read -r -p "文章标题: " TITLE
    read -r -p "文章摘要: " EXCERPT
    read -r -p "分类 ($CATEGORIES): " CATEGORY
    read -r -p "标签 (用逗号分隔): " TAGS

    CATEGORY=${CATEGORY:-ai-news}
    TAGS=${TAGS:-""}
    DATE=$(date +%Y-%m-%d)
    FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | tr -cd 'a-z0-9-')

    if [ -z "$FILENAME" ]; then
        FILENAME="post"
    fi

    TARGET="$REPO_ROOT/content/blog/${DATE}-${FILENAME}.mdx"

    cat > "$TARGET" << EOF
---
title: "$TITLE"
excerpt: "$EXCERPT"
date: $DATE
category: $CATEGORY
tags: [$TAGS]
isDraft: true
isFeatured: false
---

> 开篇金句或导语

## 正文

开始写作...

EOF

    echo -e "${GREEN}✅ 创建成功: $TARGET${NC}"
    echo "编辑完成后运行: ./scripts/quick-publish.sh \"$TARGET\" \"add ${FILENAME}\""
    exit 0
fi

FILE_PATH="$1"
COMMIT_MSG="${2:-publish new post}"

# 检查文件是否存在
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}❌ 错误: 文件不存在: $FILE_PATH${NC}"
    exit 1
fi

# 检查扩展名：contentlayer 只识别 .mdx
EXT="${FILE_PATH##*.}"
if [[ "$EXT" != "mdx" && "$EXT" != "md" ]]; then
    echo -e "${RED}❌ 错误: 仅支持 .mdx / .md 文件${NC}"
    exit 1
fi

# 获取文件名并规范化为 slug
FILENAME=$(basename "$FILE_PATH")
FILENAME_SAFE=$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/\.md$/.mdx/')

echo -e "${BLUE}🚀 开始发布流程${NC}"
echo "==============="
echo "文件: $FILENAME"
echo "目标: content/blog/$FILENAME_SAFE"
echo ""

publish_in_repo() {
    local repo="$1"
    cp "$FILE_PATH" "$repo/content/blog/$FILENAME_SAFE"
    echo -e "${GREEN}✓ 文件已复制到 content/blog/$FILENAME_SAFE${NC}"

    git -C "$repo" add "content/blog/$FILENAME_SAFE"
    git -C "$repo" commit -m "blog: $COMMIT_MSG"
    git -C "$repo" push origin main

    echo ""
    echo -e "${GREEN}✅ 推送成功！${NC}"
    echo "==============="
    echo -e "GitHub Actions 构建部署约需 2-3 分钟"
    echo -e "查看进度: ${BLUE}https://github.com/wangyuxiong/aiblogs/actions${NC}"
    echo -e "访问地址: ${BLUE}$BLOG_URL/blog/${FILENAME_SAFE%.mdx}${NC}"
}

if [ -d "$REPO_ROOT/.git" ]; then
    echo -e "${BLUE}📁 在本仓库内发布${NC}"
    publish_in_repo "$REPO_ROOT"
else
    echo -e "${BLUE}📦 临时克隆仓库...${NC}"
    TEMP_DIR=$(mktemp -d)
    git clone --depth 1 "$REPO_URL" "$TEMP_DIR/repo"
    publish_in_repo "$TEMP_DIR/repo"
    rm -rf "$TEMP_DIR"
fi
