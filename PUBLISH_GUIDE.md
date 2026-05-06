# 博客文章发布手册

> 在任何设备上快速发布 Markdown 文章到 mind-keeper.com

---

## 方案概览

| 方式 | 适用场景 | 难度 | 速度 |
|------|----------|------|------|
| **方式一：GitHub Web 上传** | 临时设备、手机、iPad | ⭐ 最简单 | 2-3分钟 |
| **方式二：命令行推送** | 常用设备（Mac/PC） | ⭐⭐ 简单 | 1-2分钟 |
| **方式三：SSH 远程服务器** | 已登录服务器时 | ⭐⭐ 简单 | 1分钟 |
| **方式四：API 自动发布** | 程序化发布 | ⭐⭐⭐ 中等 | 30秒 |

---

## 方式一：GitHub Web 上传（推荐临时使用）

适合：没有配置环境的设备、手机、iPad、他人电脑

### 步骤

1. **打开 GitHub 仓库**
   ```
   https://github.com/wangyuxiong/aiblogs/tree/main/content/blog
   ```

2. **点击 "Add file" → "Upload files"**

3. **拖拽或选择你的 `.md` 文件**
   - 文件名格式：`article-name.md`（英文，用连字符）
   - 确保文件扩展名是 `.md`

4. **填写提交信息**
   ```
   blog: add article-title
   ```

5. **点击 "Commit changes"**

6. **等待 2-3 分钟**，自动部署完成

### 文件命名规范

```
✅ 推荐：
  - my-first-post.md
  - travel-to-japan.md
  - remote-work-tips.md

❌ 避免：
  - 我的第一篇文章.md  （中文文件名）
  - post 1.md           （含空格）
  - POST.MD             （大写扩展名）
```

---

## 方式二：命令行推送（推荐常用设备）

适合：自己的 Mac/PC，已配置好 Git

### 首次配置（每设备一次）

```bash
# 1. 克隆仓库（如果还没有）
git clone https://github.com/wangyuxiong/aiblogs.git ~/blog-repo

# 2. 进入目录
cd ~/blog-repo

# 3. 可选：添加快速命令到 ~/.zshrc 或 ~/.bashrc
echo 'alias blog-deploy="cd ~/blog-repo && ./scripts/quick-publish.sh"' >> ~/.zshrc
source ~/.zshrc
```

### 发布文章

```bash
# 方法 A：使用脚本（推荐）
./scripts/quick-publish.sh ~/Documents/my-article.md

# 方法 B：手动复制 + 推送
cp ~/Documents/my-article.md content/blog/
git add .
git commit -m "blog: add my-article"
git push origin main
```

### 快速发布脚本

创建 `~/bin/blog-publish`：

```bash
#!/bin/bash
# 用法: blog-publish ~/Documents/文章.md "提交说明"

REPO="$HOME/blog-repo"
FILE="$1"
MSG="${2:-publish new post}"

if [ ! -f "$FILE" ]; then
    echo "❌ 文件不存在: $FILE"
    exit 1
fi

# 复制文件
cp "$FILE" "$REPO/content/blog/"

# 提交并推送
cd "$REPO" || exit 1
git pull origin main
git add .
git commit -m "blog: $MSG"
git push origin main

echo "✅ 发布成功！2-3分钟后可在 https://mind-keeper.com 查看"
```

使用：
```bash
chmod +x ~/bin/blog-publish
blog-publish ~/Documents/my-post.md "add travel guide"
```

---

## 方式三：SSH 远程服务器发布

适合：已经通过 SSH 连接到服务器时

### 服务器端快速发布

```bash
# 1. SSH 登录服务器
ssh root@47.111.125.142

# 2. 进入博客仓库
cd /opt/aiblogs  # 或你存放代码的目录

# 3. 创建新文章
cat > content/blog/my-new-post.md << 'EOF'
---
title: "文章标题"
excerpt: "文章摘要"
date: 2026-05-07
category: remote-work
tags: [标签1, 标签2]
isDraft: false
---

# 正文开始...

EOF

# 4. 提交并推送
git add .
git commit -m "blog: add my-new-post"
git push origin main

# 5. 可选：本地构建（如果服务器内存足够）
# npm run build
```

### 服务器端脚本

服务器上已配置 `/opt/blog-publish.sh`：

```bash
# 用法
/opt/blog-publish.sh "文章标题" "文章摘要" "remote-work"
```

---

## 方式四：GitHub API 发布（高级）

适合：程序化发布、批量发布、自动化脚本

### 使用 curl 命令

```bash
# 配置
TOKEN="ghp_your_token_here"
REPO="wangyuxiong/aiblogs"
FILE_PATH="content/blog/my-post.md"

# 读取文件内容并 Base64 编码
CONTENT=$(base64 -i ~/Documents/my-post.md)

# 提交到 GitHub
curl -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/contents/$FILE_PATH" \
  -d '{
    "message": "blog: add via api",
    "content": "'$CONTENT'",
    "branch": "main"
  }'
```

---

## 文章模板

### 标准模板

```markdown
---
title: "文章标题"
excerpt: "文章摘要，50-100字，用于列表页展示"
date: 2026-05-07              # 发布日期
category: remote-work       # 可选: travel-guide | remote-work | income-report | gear | photography
tags: [标签1, 标签2]         # 自定义标签
location: "杭州"              # 可选：地点
coverImage: "/images/cover.jpg" # 可选：封面图路径
isDraft: false                # true=草稿，false=发布
isFeatured: false             # true=首页推荐
---

# 文章标题

> 引言或金句

## 第一部分

正文内容...

### 子标题

- 要点 1
- 要点 2

## 第二部分

正文内容...

![图片描述](/images/photo.jpg)

## 总结

总结要点...

---

*写于 {{location}}，{{date}}*
```

### 快速创建命令

```bash
# 创建带模板的新文章
cat > "content/blog/$(date +%Y-%m-%d)-new-post.md" << EOF
---
title: "$(date +%Y年%m月%d日) 文章标题"
excerpt: "文章摘要..."
date: $(date +%Y-%m-%d)
category: remote-work
tags: []
isDraft: true
---

# $(date +%Y年%m月%d日) 文章标题

> 引言...

## 正文

开始写作...
EOF
```

---

## 多设备同步方案

### 推荐：Obsidian + Git 插件

1. **主设备（Mac）**：安装 Obsidian + Git 插件
2. **其他设备**：通过 GitHub Web 上传或命令行
3. **同步策略**：
   - 草稿：Obsidian `_drafts/` 文件夹
   - 完成：复制到博客仓库 `content/blog/`
   - 发布：`git push`

### 文件传输方式

```bash
# 方式 A：scp 传输到服务器
scp ~/Documents/post.md root@47.111.125.142:/tmp/

# 方式 B：通过 GitHub（推荐）
# 直接上传文件到 GitHub Web 界面

# 方式 C：使用 transfer.sh 等临时文件服务
curl --upload-file ~/Documents/post.md https://transfer.sh/post.md
# 在其他设备下载
```

---

## 常见问题

### Q: 文章发布后没有立即显示？

A: GitHub Actions 需要 2-3 分钟构建部署。查看进度：
```
https://github.com/wangyuxiong/aiblogs/actions
```

### Q: 文件名重复怎么办？

A: 使用时间戳前缀避免冲突：
```bash
mv post.md "$(date +%Y%m%d)-post.md"
```

### Q: 如何更新已发布文章？

A: 直接在 GitHub 上编辑文件并提交，或本地修改后重新推送。

### Q: 没有 Git 环境怎么办？

A: 使用方式一（GitHub Web 上传），无需任何配置。

### Q: 文章格式错误？

A: 检查：
- Frontmatter（头部元数据）格式是否正确
- `date` 格式是否为 `YYYY-MM-DD`
- `category` 是否在允许的列表中
- 文件扩展名是否为 `.md`

---

## 快速检查清单

发布前确认：

- [ ] 文件名使用英文/拼音，不含空格
- [ ] Frontmatter 包含 `title`, `excerpt`, `date`, `category`
- [ ] `isDraft: false` 才会发布
- [ ] 图片已上传到 `/public/images/`
- [ ] 本地预览过（可选）

---

## 一键命令速查

```bash
# 最快方式：GitHub Web 上传
# https://github.com/wangyuxiong/aiblogs/upload/main/content/blog

# 本地推送
git add content/blog/ && git commit -m "blog: new post" && git push

# 服务器推送（已登录时）
cd /opt/aiblogs && git add . && git commit -m "blog: new post" && git push

# 查看部署状态
# https://github.com/wangyuxiong/aiblogs/actions
```

---

## 联系方式

遇到问题？
- 查看部署日志：https://github.com/wangyuxiong/aiblogs/actions
- 服务器地址：47.111.125.142
- 博客地址：https://mind-keeper.com
