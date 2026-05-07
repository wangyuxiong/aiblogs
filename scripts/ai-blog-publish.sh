#!/bin/bash
# aiblogs-publisher: Publish articles from Obsidian vault to blog repo
# Usage: ai-blog-publish [--draft "title"] [--ready "slug"] [--publish "slug"] [--status] [--topic "主题描述"]

set -e

BLOG_REPO="$HOME/workspace/aiblogs"
VAULT="${OBSIDIAN_PATH:-$HOME/Documents/Obsidian/blog}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

init_dirs() {
    mkdir -p "$VAULT/_drafts" "$VAULT/_ready" "$VAULT/_published" "$VAULT/images"
    mkdir -p "$BLOG_REPO/content/blog" "$BLOG_REPO/public/images"
}

status() {
    init_dirs
    echo -e "${BLUE}=== 📝 Drafts ===${NC}"
    ls -1 "$VAULT/_drafts/" 2>/dev/null || echo "  (empty)"
    echo ""
    echo -e "${YELLOW}=== 📋 Ready ===${NC}"
    ls -1 "$VAULT/_ready/" 2>/dev/null || echo "  (empty)"
    echo ""
    echo -e "${GREEN}=== ✅ Published ===${NC}"
    ls -1 "$VAULT/_published/" 2>/dev/null || echo "  (empty)"
    echo ""
    echo -e "${BLUE}=== 🌐 Blog Repo ===${NC}"
    ls -1 "$BLOG_REPO/content/blog/" 2>/dev/null || echo "  (empty)"
}

publish() {
    local slug="$1"
    init_dirs

    if [ ! -f "$VAULT/_ready/$slug" ]; then
        # Try with .md extension
        if [ -f "$VAULT/_ready/${slug}.md" ]; then
            slug="${slug}.md"
        else
            echo -e "${RED}❌ Not found: $VAULT/_ready/$slug${NC}"
            exit 1
        fi
    fi

    local safe_name
    safe_name=$(echo "$slug" | sed 's/\.md$/\.mdx/' | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

    echo -e "${BLUE}🚀 Publishing: $slug${NC}"

    # Copy article
    cp "$VAULT/_ready/$slug" "$BLOG_REPO/content/blog/$safe_name"
    echo -e "${GREEN}✓ Copied to content/blog/$safe_name${NC}"

    # Copy images
    if [ -d "$VAULT/images" ] && [ "$(ls -A "$VAULT/images" 2>/dev/null)" ]; then
        cp "$VAULT/images/"* "$BLOG_REPO/public/images/" 2>/dev/null || true
        echo -e "${GREEN}✓ Images synced${NC}"
    fi

    # Git commit & push
    cd "$BLOG_REPO"
    git add .
    git commit -m "blog: publish $(basename "$slug" .md)"
    git push origin main

    echo ""
    echo -e "${GREEN}✅ Published!${NC}"
    echo "🌐 https://mind-keeper.com/blog/${safe_name%.mdx}"
    echo "⏱️ Deploying via GitHub Actions (2-3 min)..."

    # Archive
    mkdir -p "$VAULT/_published"
    mv "$VAULT/_ready/$slug" "$VAULT/_published/" 2>/dev/null || true
    echo "📦 Archived to _published/"
}

case "${1:-}" in
    --status|-s)
        status
        ;;
    --publish|-p)
        publish "$2"
        ;;
    --init)
        init_dirs
        echo -e "${GREEN}✓ Directories initialized${NC}"
        ;;
    *)
        echo -e "${BLUE}AIBlogs Publisher${NC}"
        echo "Usage:"
        echo "  $0 --status        Show all stages"
        echo "  $0 --publish FILE  Publish from _ready/"
        echo "  $0 --init          Initialize directories"
        ;;
esac
