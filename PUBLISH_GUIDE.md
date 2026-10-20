# 博客文章发布手册

> 在任何设备上把 Markdown 文章发布到 mind-keeper.com

---

## 先记住三条硬规则

1. 文章必须放在 `content/blog/` 下，扩展名必须是 **`.mdx`**（contentlayer 只匹配 `*.mdx`）。
2. frontmatter 必须包含 `title`、`excerpt`、`date`、`category`。
3. 推送 `main` 后由 GitHub Actions 自动构建部署，约 2–3 分钟生效。

---

## 每日日报由脚本自动生成

- 每天 08:00（北京时间）由 `.github/workflows/daily.yml` 从 [AIHOT](https://aihot.news) 抓取过去 24 小时的**技术与产品**动态，生成 `content/blog/ai-daily-YYYY-MM-DD.mdx` 并自动部署。
- 想手动补一期：

```bash
pnpm daily:aihot            # 生成当天日报（已存在则跳过）
pnpm daily:aihot -- --force # 覆盖当天由脚本生成的文件
```

- 脚本只覆盖带生成标记的文件，不会动你手写的日报。

---

## 方案概览

| 方式 | 适用场景 | 难度 | 速度 |
|------|----------|------|------|
| **方式一：GitHub Web 上传** | 临时设备、手机、iPad | ⭐ 最简单 | 2–3 分钟 |
| **方式二：本地脚本 / Git** | 常用设备（Mac/PC） | ⭐⭐ 简单 | 1 分钟 |
| **方式三：服务器上 git push** | 已登录服务器时 | ⭐⭐ 简单 | 1 分钟 |
| **方式四：GitHub API** | 程序化发布 | ⭐⭐⭐ 中等 | 30 秒 |

---

## 方式一：GitHub Web 上传

1. 打开 `https://github.com/wangyuxiong/aiblogs/upload/main/content/blog`
2. 拖入 `.mdx` 文件（若你写的是 `.md`，请先改名为 `.mdx`）
3. 提交信息示例：`blog: add article-title`
4. 等待 Actions 构建完成

### 文件命名规范

```
✅ my-first-post.mdx
✅ 2026-06-12-new-model.mdx
❌ 我的第一篇文章.mdx   （中文 slug 会进入 URL）
❌ post 1.mdx           （含空格）
❌ POST.MD              （大写扩展名 / 错误扩展名）
```

---

## 方式二：本地脚本 / Git

### 首次配置

```bash
git clone git@github.com:wangyuxiong/aiblogs.git ~/github/aiblogs
cd ~/github/aiblogs
pnpm install
```

### 发布

```bash
# 方式 A：快速创建带 frontmatter 的草稿
./scripts/quick-publish.sh --new

# 方式 B：发布已有文件（.md 会自动改名为 .mdx）
./scripts/quick-publish.sh ~/Documents/my-post.md "add my post"

# 方式 C：手动复制 + 推送
cp ~/Documents/my-post.mdx content/blog/
git add content/blog/ && git commit -m "blog: add my-post" && git push origin main
```

> `quick-publish.sh` 会在推送后打印线上地址：
> `https://mind-keeper.com/blog/<slug>`

---

## 方式三：服务器上发布

```bash
ssh root@<SERVER_HOST>
cd /var/www/aiblogs        # 或你 clone 仓库的位置
# 编辑/新增 content/blog/xxx.mdx
git add . && git commit -m "blog: new post" && git push origin main
```

服务器上**不需要**本地构建：构建由 GitHub Actions 完成，产物 SCP 到
`/var/www/aiblogs`。详见 [DEPLOYMENT.md](DEPLOYMENT.md)。

---

## 方式四：GitHub API

```bash
TOKEN="ghp_xxx"
REPO="wangyuxiong/aiblogs"
FILE_PATH="content/blog/my-post.mdx"   # 必须是 .mdx

CONTENT=$(base64 -i ~/Documents/my-post.mdx)

curl -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/contents/$FILE_PATH" \
  -d "{
    \"message\": \"blog: add via api\",
    \"content\": \"$CONTENT\",
    \"branch\": \"main\"
  }"
```

---

## 文章模板（`.mdx`）

```mdx
---
title: "文章标题"
excerpt: "文章摘要，50-100 字，用于列表页与 SEO 描述"
date: 2026-06-12
category: ai-news        # 必须是下方枚举之一
tags: ["标签1", "标签2"]
location: "杭州"          # 可选
coverImage: "/images/ai-daily-cover.svg"  # 可选
isDraft: false            # true 时不参与构建
isFeatured: false
---

> 引言或金句

## 第一部分

正文内容...

### 子标题

- 要点 1
- 要点 2

## 总结

---

*写于 杭州，2026-06-12*
```

### 可用分类（contentlayer enum）

`ai-daily` · `ai-news` · `ai-tutorial` · `open-source` ·
`travel-guide` · `remote-work` · `income-report` · `gear` · `photography`

- 日刊统一用 `ai-daily`，封面统一 `/images/ai-daily-cover.svg`
- 分类写错不会导致构建失败，但 `/daily` 等按分类过滤的页面会漏掉文章

---

## 常见问题

### 文章推送后没显示？

1. 检查扩展名是否 `.mdx`、是否在 `content/blog/` 下
2. 检查 `isDraft` 是否为 `false`
3. 查看构建日志：`https://github.com/wangyuxiong/aiblogs/actions`

### 分类写错了怎么办？

把 `category` 改成枚举值后重新推送即可；日刊页只显示 `ai-daily`。

### 图片不显示？

图片需放在 `public/images/`，frontmatter 写 `/images/xxx.svg`（或 png/jpg）。

### 如何更新已发布文章？

直接编辑 `content/blog/<slug>.mdx`（slug 即文件名去掉 `.mdx`，决定 URL），重新推送。

### 本地预览

```bash
pnpm dev            # http://localhost:3000
pnpm build          # 完整构建 + SEO 生成
```

---

## 速查

```bash
# 一键发布已有文件
./scripts/quick-publish.sh ~/Documents/my-post.md

# 查看发布状态
./scripts/ai-blog-publish.sh --status

# 手动推送
git add content/blog/ && git commit -m "blog: new post" && git push

# 部署进度
# https://github.com/wangyuxiong/aiblogs/actions
```
