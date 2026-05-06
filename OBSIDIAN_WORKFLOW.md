# Obsidian + Git 博客工作流配置指南

## 目录结构

在 Obsidian 中创建以下文件夹结构：

```
博客写作/
├── _templates/           # 文章模板（已提供）
│   └── blog-post.md
├── _drafts/              # 草稿箱
├── _ready/               # 待发布文章
├── images/               # 文章配图
└── published/            # 已发布文章（自动同步）
```

## 步骤 1：安装 Obsidian Git 插件

1. 打开 Obsidian → 设置 → 第三方插件
2. 关闭安全模式
3. 浏览社区插件，搜索 **"Git"**
4. 安装并启用

## 步骤 2：配置 Git 插件

### 基础设置

```
设置 → 社区插件 → Git → 选项：

Vault backup interval (minutes): 5          # 自动备份间隔
Auto pull interval (minutes): 5             # 自动拉取间隔
Commit message: "obsidian: {{date}} {{numFiles}} files"  # 提交信息模板

Auto commit-and-sync: ✓ 启用                # 自动同步
Auto backup after file change: ✓ 启用       # 文件变更后自动备份
```

### 快捷键绑定（推荐）

```
设置 → 快捷键 → Git：

Cmd/Ctrl + Shift + S  →  Git: Commit-and-sync
Cmd/Ctrl + Shift + P  →  Git: Push
Cmd/Ctrl + Shift + L  →  Git: Pull
```

## 步骤 3：配置 Templater 插件（可选但推荐）

1. 安装 **Templater** 插件
2. 设置模板文件夹路径：`_templates/`
3. 创建新文章时快速插入模板

### 快速创建文章

在任意文件夹新建 Markdown 文件，然后：
- `Cmd/Ctrl + P` → "Templater: Open Insert Template Modal"
- 选择 `blog-post.md`

## 步骤 4：写作 → 发布流程

### 写作阶段（_drafts/）

1. 在 `_drafts/` 创建新文章
2. 使用模板填充 frontmatter
3. 正常写作，`isDraft: true`
4. Obsidian Git 每 5 分钟自动 commit

### 准备发布（_ready/）

文章完成后：
1. 修改 `isDraft: false`
2. 移动文件到 `_ready/`
3. 复制文件内容到博客仓库 `content/blog/`

### 一键发布

在博客仓库根目录运行（或配置快捷键）：

```bash
# 添加文章、构建、推送
git add content/blog/ && \
git commit -m "blog: publish new post" && \
git push origin main
```

GitHub Actions 会自动部署到服务器。

## 步骤 5：图片管理

### 图片存放

1. **Obsidian 内部图片**：放在 `images/` 文件夹
2. **引用方式**：`![描述](images/xxx.jpg)`

### 图片同步到博客

```bash
# 复制图片到博客仓库
cp -r ~/Obsidian/blog/images/* ~/workspace/aiblogs/public/images/
```

### 建议

- 使用 **Image Auto Upload** 插件自动上传图床
- 或直接使用 **Obsidian 附件文件夹** 统一管理

## 快捷命令

### Obsidian 命令面板

| 命令 | 作用 |
|------|------|
| Git: Commit-and-sync | 提交并推送 |
| Git: Push | 仅推送 |
| Git: Pull | 拉取更新 |
| Templater: Insert Template | 插入模板 |

### 终端命令（博客仓库）

```bash
# 快速发布
git add . && git commit -m "blog: update" && git push

# 创建新文章（复制模板）
cp obsidian-templates/blog-post.md content/blog/my-new-post.mdx
```

## 完整发布流程示例

```
1. Obsidian 写作
   → _drafts/my-article.md
   → isDraft: true

2. 文章完成
   → 修改 isDraft: false
   → 移动到 _ready/

3. 同步到博客仓库
   → cp _ready/my-article.md ~/workspace/aiblogs/content/blog/my-article.mdx
   → cp images/* ~/workspace/aiblogs/public/images/

4. 提交发布
   → git add .
   → git commit -m "blog: add my-article"
   → git push

5. GitHub Actions 自动部署
   → 等待 2-3 分钟
   → 访问 https://mind-keeper.com/blog/my-article
```

## 进阶配置

### 自动复制脚本

创建 `obsidian-to-blog.sh`：

```bash
#!/bin/bash
BLOG_REPO="~/workspace/aiblogs"
OBSIDIAN="~/Documents/Obsidian/blog"

# 复制文章
cp "$OBSIDIAN/_ready/"*.md "$BLOG_REPO/content/blog/"

# 复制图片
cp -r "$OBSIDIAN/images/"* "$BLOG_REPO/public/images/"

# 提交
cd "$BLOG_REPO"
git add .
git commit -m "blog: publish from obsidian $(date +%Y-%m-%d)"
git push

echo "✅ Published!"
```

### Obsidian 快速按钮

安装 **QuickAdd** 插件，创建 "发布博客" 按钮：

```
类型: Macro
操作: 
  1. 移动文件 _ready/
  2. 执行脚本 obsidian-to-blog.sh
```

## 注意事项

1. **文件名格式**：使用英文或拼音，如 `my-first-post.mdx`
2. **日期格式**：`YYYY-MM-DD`，Obsidian 模板会自动填充
3. **分类选择**：必须在定义的 5 个 category 中选择
4. **图片路径**：博客中使用 `/images/xxx.jpg` 绝对路径

## 故障排查

### Git 同步失败

```bash
# 检查 Git 配置
git config user.name
git config user.email

# 重新设置
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 构建失败

1. 检查 frontmatter 格式是否正确
2. 确保 date 格式为 `YYYY-MM-DD`
3. 检查 category 是否在允许列表中

---

配置完成后，你只需要在 Obsidian 中写作，完成后一键即可发布到博客！
