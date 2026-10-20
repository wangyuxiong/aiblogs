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

## 每日 AI 日报（AIHOT）

日报由 [AIHOT](https://aihot.news) 公开 API 自动生成，只取**技术与产品**方向：

- `ai-models` → 模型与技术
- `ai-products` → 产品与工具
- `paper` → 研究进展
- `tip` → 实用技巧

抓取过去 24 小时的「精选」条目，按主题分节，输出 `content/blog/ai-daily-YYYY-MM-DD.mdx`。

```bash
python3 scripts/aihot-daily.py            # 生成当天日报（已存在则跳过）
python3 scripts/aihot-daily.py --force    # 覆盖当天文件（仅限脚本生成的文件）
python3 scripts/aihot-daily.py --dry-run  # 只打印预览
```

自动化：`.github/workflows/daily.yml` 每天 00:00 UTC（北京时间 08:00）运行脚本，
有新内容时自动提交并构建部署。也可在 Actions 页面手动 `Run workflow`。

> 数据来自第三方，标题/摘要仅作资料；接口匿名只读，无需 API Key。
> 生成文件带 `{/* generated-by: scripts/aihot-daily.py */}` 标记，
> `--force` 不会覆盖人工编辑的日报。

## 自动生成

| 命令 | 作用 |
|---|---|
| `pnpm daily:aihot` | 抓取 AIHOT 生成当天日报 |
| `pnpm gen:og` | 重新生成 `public/images/og-default.png` |
| `python3 scripts/ai-daily-crawler.py` | 抓取 RSS 生成一期日刊（旧数据源） |
| `python3 scripts/news-crawler.py` | 抓取 RSS 生成单篇草稿 |
| `pnpm normalize:content` | 规范化日刊 category / 封面 / 重复标题 |

## 说明

- 日刊页 `/daily` 只展示 `category: ai-daily` 的文章
- 文章正文在构建期服务端渲染，静态 HTML 中直接包含全文（利于 SEO）
- 字体（Inter / Playfair Display）由 `@fontsource` 自托管，构建不依赖 Google Fonts
- 站点唯一部署方式是 GitHub Actions 静态发布，旧 PM2 方案已移除
