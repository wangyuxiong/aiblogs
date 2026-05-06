#!/bin/bash
#
# 快速发布脚本 - 在任何设备上快速发布博客文章
# 用法: ./quick-publish.sh [文件路径] ["提交说明"]
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

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}用法:${NC}"
    echo "  ./quick-publish.sh <文件路径> [\"提交说明\"]"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  ./quick-publish.sh ~/Documents/my-post.md"
    echo "  ./quick-publish.sh ~/Documents/my-post.md \"add travel guide\""
    echo ""
    echo -e "${YELLOW}快速模式（交互式输入）:${NC}"
    echo "  ./quick-publish.sh --new"
    exit 0
fi

# 快速创建模式
if [ "$1" == "--new" ]; then
    echo -e "${BLUE}📝 创建新文章${NC}"
    echo "==============="

    read -p "文章标题: " TITLE
    read -p "文章摘要: " EXCERPT
    read -p "分类 (travel-guide/remote-work/income-report/gear/photography): " CATEGORY
    read -p "标签 (用逗号分隔): " TAGS

    CATEGORY=${CATEGORY:-remote-work}
    TAGS=${TAGS:-""}
    DATE=$(date +%Y-%m-%d)
    FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | tr -cd 'a-z0-9-')

    cat > "${DATE}-${FILENAME}.md" << EOF
---
title: "$TITLE"
excerpt: "$EXCERPT"
date: $DATE
category: $CATEGORY
tags: [$TAGS]
isDraft: false
---

# $TITLE

开始写作...

EOF

    echo -e "${GREEN}✅ 创建成功: ${DATE}-${FILENAME}.md${NC}"
    echo "编辑完成后运行: ./quick-publish.sh ${DATE}-${FILENAME}.md"
    exit 0
fi

FILE_PATH="$1"
COMMIT_MSG="${2:-publish new post}"

# 检查文件是否存在
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}❌ 错误: 文件不存在: $FILE_PATH${NC}"
    exit 1
fi

# 获取文件名
FILENAME=$(basename "$FILE_PATH")

# 检查是否是 markdown 文件
if [[ ! "$FILENAME" =~ \.(md|mdx)$ ]]; then
    echo -e "${YELLOW}⚠️ 警告: 文件不是 .md 格式，建议转换为 Markdown${NC}"
fi

# 转换为小写、替换空格
FILENAME_SAFE=$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

echo -e "${BLUE}🚀 开始发布流程${NC}"
echo "==============="
echo "文件: $FILENAME"
echo "目标: $REPO_URL"
echo ""

# 检查是否在仓库内
if [ -d ".git" ]; then
    # 在当前仓库内
    echo -e "${BLUE}📁 检测到当前在 Git 仓库内${NC}"

    # 复制文件
    cp "$FILE_PATH" "content/blog/$FILENAME_SAFE"
    echo -e "${GREEN}✓ 文件已复制到 content/blog/$FILENAME_SAFE${NC}"

    # 提交并推送
    git add "content/blog/$FILENAME_SAFE"
    git commit -m "blog: $COMMIT_MSG"
    git push origin main

else
    # 不在仓库内，使用临时克隆
    echo -e "${BLUE}📦 临时克隆仓库...${NC}"
    TEMP_DIR=$(mktemp -d)

    git clone --depth 1 "$REPO_URL" "$TEMP_DIR/repo"
    cd "$TEMP_DIR/repo"

    # 复制文件
    cp "$FILE_PATH" "content/blog/$FILENAME_SAFE"
    echo -e "${GREEN}✓ 文件已复制到 content/blog/$FILENAME_SAFE${NC}"

    # 提交并推送
    git add "content/blog/$FILENAME_SAFE"
    git commit -m "blog: $COMMIT_MSG"
    git push origin main

    # 清理
    cd -
    rm -rf "$TEMP_DIR"
fi

echo ""
echo -e "${GREEN}✅ 发布成功！${NC}"
echo "==============="
echo -e "文章将在 ${YELLOW}2-3 分钟${NC} 后上线"
echo -e "查看进度: ${BLUE}https://github.com/wangyuxiong/aiblogs/actions${NC}"
echo -e "访问地址: ${BLUE}$BLOG_URL/blog/${FILENAME_SAFE%.md}${NC}"
