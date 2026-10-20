# Mind Keeper · AI 学习日刊

每天把 AI 领域值得关注的动态筛选、分类、浓缩成一期日刊，同时不定期发布 AI 技术深度文章。

- 线上地址：https://mind-keeper.com
- 日刊页：https://mind-keeper.com/daily
- RSS：https://mind-keeper.com/feed.xml

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 15（App Router） |
| 内容 | Contentlayer + MDX（`rehype-slug` 生成标题锚点） |
| 样式 | Tailwind CSS 4 |
| 动效 / 图标 | Framer Motion / Lucide |
| 输出 | 纯静态导出（`output: 'export'` → `dist/`） |
| 部署 | GitHub Actions → SCP → 阿里云 ECS |

## 目录结构

```
app/                    # 页面（首页 / daily / blog / about / portfolio）
components/             # 布局、内容卡片、区块组件
content/
  blog/                 # 已发布文章（*.mdx，参与构建）
  _drafts/              # 草稿（不参与构建）
lib/                    # 工具函数、分类标签
scripts/                # 抓取、发布、SEO、配图脚本
public/images/          # 图片资源（SVG 封面 + OG PNG）
```

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # 构建静态产物到 dist/，并生成 sitemap.xml / feed.xml
npx serve dist  # 本地预览构建结果
```

要求 Node 20+、pnpm 10（`corepack enable` 会自动使用 `packageManager` 指定的版本）。

## 写文章

1. 在 `content/blog/` 新建 `.mdx`，frontmatter 参考 [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md)
2. `category` 必须是 contentlayer enum 中的值
3. 推送 `main` 即自动部署

Obsidian 工作流见 [OBSIDIAN_WORKFLOW.md](OBSIDIAN_WORKFLOW.md)，部署细节见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 自动生成

| 命令 | 作用 |
|---|---|
| `pnpm gen:og` | 重新生成 `public/images/og-default.png` |
| `python3 scripts/ai-daily-crawler.py` | 抓取 RSS 生成一期日刊 |
| `python3 scripts/news-crawler.py` | 抓取 RSS 生成单篇草稿 |
| `pnpm normalize:content` | 规范化日刊 category / 封面 / 重复标题 |

## 说明

- 日刊页 `/daily` 只展示 `category: ai-daily` 的文章
- 文章正文在构建期服务端渲染，静态 HTML 中直接包含全文（利于 SEO）
- 站点唯一部署方式是 GitHub Actions 静态发布，旧 PM2 方案已移除
