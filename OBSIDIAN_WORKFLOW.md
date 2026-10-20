# Obsidian 写作与发布工作流

本站文章在 Obsidian 中写作，通过 Git 发布。`content/blog/` 是唯一会被构建的目录。

## 目录约定

Obsidian 仓库（默认 `~/Documents/Obsidian/blog`，可用 `OBSIDIAN_PATH` 覆盖）：

```
blog/
├── _drafts/      # 草稿，随便写
├── _ready/       # 写完待发布，脚本从这里取
├── _published/   # 已发布归档
└── images/       # 文章配图，发布会同步到 public/images/
```

博客仓库：

```
content/blog/       # 已发布文章（contentlayer 只识别这里的 *.mdx）
content/_drafts/    # 仓库内草稿，不参与构建
public/images/      # 文章图片
scripts/            # 抓取、发布、SEO 脚本
```

## 一篇新文章

1. 在 Obsidian 中新建笔记，frontmatter 必须包含 `title` / `excerpt` / `date` / `category`，
   模板见 [`obsidian-templates/blog-post.md`](obsidian-templates/blog-post.md)。
2. `category` 必须是以下枚举之一：
   `ai-daily` · `ai-news` · `ai-tutorial` · `open-source` ·
   `travel-guide` · `remote-work` · `income-report` · `gear` · `photography`
3. 写完后把文件移入 `_ready/`。
4. 执行发布脚本：

```bash
./scripts/publish-from-obsidian.sh
```

脚本会：

- 把 `_ready/` 下的 `.md` / `.mdx` 复制到 `content/blog/`（`.md` 自动改名为 `.mdx`）
- 同步 `images/` 到 `public/images/`
- `git add / commit / push`，推送后由 GitHub Actions 自动构建部署
- 把已发布文件归档到 `_published/`

> 注意：contentlayer 只匹配 `content/blog/**/*.mdx`，`.md` 文件不会被构建。
> 发布脚本已自动处理扩展名，手动复制时务必使用 `.mdx`。

## 日常维护

```bash
./scripts/ai-blog-publish.sh --status   # 查看草稿 / 待发布 / 已发布
```

## 图片

- 封面图放到 `public/images/`，frontmatter 写 `coverImage: "/images/xxx.svg"`
- 日刊统一使用 `/images/ai-daily-cover.svg`
- 社交分享图 `og-default.png` 由 `scripts/generate-og-image.py` 生成（已提交，无需每次生成）
