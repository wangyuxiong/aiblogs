# Personal Brand Homepage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the homepage and key public pages around Mind Keeper's identity, learning path, real projects, and original writing, while keeping automated daily posts as a secondary content layer.

**Architecture:** Keep the existing Next.js static-export and Contentlayer architecture. Add shared post selectors and site/project configuration, build focused homepage sections, and verify the generated HTML with a standard-library Python test script. Remove or unpublish placeholders instead of inventing identity, project results, download links, or social accounts.

**Tech Stack:** Next.js 15, React 19, Contentlayer, MDX, Tailwind CSS 4, TypeScript, Python `unittest`, pnpm.

**Design Reference:** `docs/plans/2026-11-06-personal-brand-site-design.md`

**Baseline:** Commit `46940c6`; clean production build passes with 34 posts, 40 sitemap URLs, and pre-existing Contentlayer draft warnings plus a Framer Motion optional dependency warning.

---

## Scope and factual constraints

- Public name remains **Mind Keeper**; do not invent a real name, portrait, employer, metrics, or biography.
- Positioning: **AI 产品与工程实践者**，面向 AI 学习者。
- The public `wangyuxiong/writing-coach` repository and releases returned GitHub API 404 on 2026-11-06. Do not link to them until the owner supplies a working URL.
- The public `wangyuxiong/aiblogs` repository is verified and may be linked for the daily automation project.
- `hello-world.mdx` contains an off-brand digital-nomad narrative and a non-existent weekly newsletter promise. Unpublish it by setting `isDraft: true`; do not delete it.
- The existing Anthropic article is the only remaining original post. The learning path may show one published step and future steps as plain text, never dead links.
- HTTPS certificate repair requires server access and is not part of this code worktree.

### Task 1: Add failing static-site acceptance tests

**Files:**
- Create: `scripts/test-brand-site.py`
- Modify: `package.json`

**Step 1: Write the failing tests**

Create a Python `unittest` suite that reads `dist/` and checks:

- homepage title is `Mind Keeper | AI 产品与工程实践`;
- homepage contains the positioning text and `learning-path`, `projects`, `original-articles`, and `latest-daily` sections;
- the original-articles section contains no `/blog/ai-daily-` links;
- the latest-daily section contains daily links and the label `自动整理`;
- `/blog` contains no `/blog/ai-daily-` links and no `hello-world` link;
- `/daily` still contains daily links and a real latest-update label;
- `/portfolio` contains both `文心启航` and `Mind Keeper 日报系统`;
- `/portfolio/writing-coach` contains no `example.com`, fake writing examples, or dead download button;
- `/about` contains the positioning text and no skill percentages;
- generated pages contain no `href="#"`, `contact@example.com`, or `hello-world` public URL;
- sitemap excludes `hello-world` after it becomes a draft.

Use helpers `read_page(name)`, `section(html, start_id, end_id=None)`, and `assert_contains`. Run `unittest.main()` directly so no third-party packages are needed.

**Step 2: Add a test command**

Add to `package.json`:

```json
"test:brand": "python3 scripts/test-brand-site.py"
```

**Step 3: Run tests against the baseline build and verify failure**

Run: `pnpm test:brand`

Expected: multiple failures for the old homepage, mixed blog archive, placeholder project content, and off-brand about page. Do not proceed if the script itself errors because `dist/` is missing; run `pnpm build` first.

**Step 4: Commit the acceptance tests**

```bash
git add scripts/test-brand-site.py package.json
git commit -m "test: 定义个人品牌站静态验收标准"
```

### Task 2: Centralize site data and post classification

**Files:**
- Create: `lib/site.ts`
- Create: `lib/posts.ts`
- Modify: `app/blog/page.tsx`
- Modify: `app/daily/page.tsx`
- Modify: `content/blog/hello-world.mdx`

**Step 1: Add verified site configuration**

`lib/site.ts` exports:

```ts
export const site = {
  name: 'Mind Keeper',
  title: 'Mind Keeper | AI 产品与工程实践',
  role: 'AI 产品与工程实践者',
  tagline: '把复杂 AI 技术讲明白，也把学到的东西做成可用工具。',
  description: '面向 AI 学习者的教程、真实项目复盘，以及每天筛选的 AI 技术与产品动态。',
  url: 'https://mind-keeper.com',
  github: 'https://github.com/wangyuxiong',
  rss: '/feed.xml',
} as const
```

**Step 2: Add reusable post selectors**

`lib/posts.ts` defines a minimal structural `PostLike` type and pure functions:

```ts
export function sortByDateDesc<T extends { date: string }>(posts: T[]): T[]
export function getOriginalPosts<T extends PostLike>(posts: T[]): T[]
export function getDailyPosts<T extends PostLike>(posts: T[]): T[]
export function toPostListItem(post: PostLike): {
  slug: string; title: string; excerpt: string; date: string;
  category: string; location?: string; coverImage?: string; readingTime: number
}
```

All selectors exclude drafts. Daily means `category === 'ai-daily'`; original means non-draft and not daily. Sort copies the array rather than mutating Contentlayer's collection.

**Step 3: Apply selectors**

- `/blog` uses `getOriginalPosts(allPosts)` and changes its copy to `原创文章` / `教程、技术实践与真实项目复盘`.
- `/daily` uses `getDailyPosts(allPosts)` and displays `最近更新：YYYY-MM-DD` from the first item.
- Remove the decorative `20+` source count and infinity statistic. Keep actual issue count, data source AIHOT, and automatic-publication explanation.

**Step 4: Unpublish the off-brand placeholder**

Set `isDraft: true` in `hello-world.mdx`.

**Step 5: Build and run focused assertions**

Run: `pnpm build && pnpm test:brand`

Expected: blog/daily/sitemap tests pass; homepage and other page tests may still fail until later tasks.

**Step 6: Commit**

```bash
git add lib/site.ts lib/posts.ts app/blog/page.tsx app/daily/page.tsx content/blog/hello-world.mdx
git commit -m "refactor: 分离原创文章与自动日报"
```

### Task 3: Build the brand-first homepage

**Files:**
- Create: `components/sections/personal-hero.tsx`
- Create: `components/sections/learning-path.tsx`
- Create: `components/sections/featured-projects.tsx`
- Create: `components/sections/latest-daily.tsx`
- Modify: `components/sections/featured-posts.tsx`
- Modify: `components/sections/newsletter.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Step 1: Implement the personal hero**

Use a server component with an asymmetric, left-aligned layout rather than a full-screen centered news banner.

Required copy:

- eyebrow: `MIND KEEPER · AI PRODUCT & ENGINEERING`;
- heading: `把复杂 AI 讲明白，也把想法做成工具。`;
- supporting text identifies the role and original tutorials / real projects;
- primary anchor `开始学习` → `#learning-path`;
- secondary anchor `查看代表作品` → `#projects`;
- a restrained `当前在做的三件事` aside listing the Agent path, writing coach, and daily automation.

Use `min-h-[85svh]`, warm paper background, ink text, one muted green accent, visible focus states, and no stock imagery or fake live badge.

**Step 2: Implement the learning path**

Section id `learning-path`, title `AI Agent：从入门到做出第一个工具`.

The only linked published step is the existing Anthropic multi-agent article. Future steps (`最小 Agent 实现`, `工具调用与记忆`, `部署一个可用工具`) are plain text with `后续更新`, not anchors. Use a numbered editorial list, not three equal feature cards.

**Step 3: Implement projects and daily sections**

`lib/projects.ts` contains two verified entries:

- `文心启航`: internal URL `/portfolio/writing-coach`, Tauri/React desktop writing coach, Claude and Qwen, local SQLite. No repository or download link.
- `Mind Keeper 日报系统`: result URL `/daily`, source URL `https://github.com/wangyuxiong/aiblogs`, AIHOT → MDX → Actions → static deployment.

`FeaturedProjects` renders an asymmetric two-project layout with `id="projects"`, real links, and no fabricated results.

`LatestDaily` receives three daily posts, renders `id="latest-daily"`, labels the feed `自动整理`, and shows actual dates with a link to `/daily`.

**Step 4: Implement original writing and subscription**

- Add an optional `id` prop to `FeaturedPosts`; render `id="original-articles"`, title `最新原创`, and hide cleanly when no posts exist.
- Change newsletter copy to subscribe to Mind Keeper original tutorials, project notes, and daily updates. Keep only the working RSS copy action.

**Step 5: Compose the homepage**

Order: PersonalHero → LearningPath → FeaturedProjects → original FeaturedPosts → LatestDaily → Newsletter.

Use `getOriginalPosts(...).slice(0, 4)` and `getDailyPosts(...).slice(0, 3)`.

**Step 6: Add restrained global polish**

In `globals.css` add consistent `:focus-visible`, balanced display headings, and selection colors. Do not add a new font or animation dependency.

**Step 7: Build, test, and inspect**

Run: `pnpm build && pnpm test:brand`

Expected: all homepage content/classification tests pass. Check `dist/index.html` contains every section in the intended order and no daily links before `latest-daily`.

**Step 8: Commit**

```bash
git add lib/projects.ts components/sections app/page.tsx app/globals.css
git commit -m "feat: 重构个人品牌首页与学习路径"
```

### Task 4: Turn portfolio and about pages into credible public pages

**Files:**
- Modify: `app/portfolio/page.tsx`
- Modify: `app/portfolio/layout.tsx`
- Modify: `app/portfolio/writing-coach/page.tsx`
- Modify: `app/about/page.tsx`

**Step 1: Rewrite the portfolio from project data**

Use `lib/projects.ts`; each project shows problem, implementation, verified links, and status. No generic “技术实践与创意表达的融合” copy. The writing coach has only its internal case link; the daily system links to the public result and verified source repository.

**Step 2: Rewrite the writing-coach case without placeholders**

Make it a server component with:

- problem and intended user;
- guided writing workflow;
- architecture and local-data explanation;
- verified feature list;
- clearly labelled `界面示意` if a mock interface remains;
- current status without a download button while no public release exists.

Remove the three invented writing examples, `writing-coach.app`, `contact@example.com`, dead `免费下载` button, unverified GitHub URLs, fake contact CTA, and separate 2024 footer. Retain the working back-to-portfolio navigation.

**Step 3: Rewrite About around real work**

Use the existing truthful facts only: full-stack developer, AI product/engineering practice, writing coach, daily automation, tutorials. Replace the bot placeholder with a typographic MK panel. Remove skill percentages and the gear inventory. Link to projects, original articles, GitHub, and RSS.

**Step 4: Update portfolio metadata**

Title `项目`，description identifies the two real projects.

**Step 5: Build and test**

Run: `pnpm build && pnpm test:brand`

Expected: portfolio, writing-coach, about, and placeholder checks pass. Grep source for `contact@example.com`, `writing-coach.app`, and `href="#"`; expected no matches in public pages.

**Step 6: Commit**

```bash
git add app/portfolio app/about/page.tsx
git commit -m "feat: 完善真实项目案例与个人介绍"
```

### Task 5: Align navigation, metadata, and global branding

**Files:**
- Modify: `components/layout/navbar.tsx`
- Modify: `components/layout/footer.tsx`
- Modify: `app/layout.tsx`

**Step 1: Update navigation**

Order and labels: `/blog` 文章, `/portfolio` 项目, `/daily` 日报, `/about` 关于. Preserve active states and mobile menu behavior. Add an explicit `aria-label` to mobile navigation.

**Step 2: Update metadata from site config**

Default title `Mind Keeper | AI 产品与工程实践`; description from `site.description`. Remove the empty Google verification field and unverified `@mindkeeper` Twitter handles. Keep the working OG image and RSS metadata.

**Step 3: Add accessibility basics**

Add a keyboard-visible `跳到正文` skip link and `id="main-content"` on the main element. Footer reads `Mind Keeper · AI 产品与工程实践` and retains only working RSS/GitHub links.

**Step 4: Build and run all tests**

Run: `pnpm build && pnpm test:brand`

Expected: all acceptance tests pass; static export and SEO generation succeed.

**Step 5: Commit**

```bash
git add components/layout app/layout.tsx
git commit -m "feat: 统一全站品牌导航与元信息"
```

### Task 6: Final review and handoff

**Files:**
- Modify if needed: `README.md`
- Review: all changed files

**Step 1: Run clean verification**

```bash
rm -rf .contentlayer .next dist
pnpm install --frozen-lockfile
pnpm build
pnpm test:brand
```

Expected: build exits 0, all tests pass, no `hello-world` in sitemap, no daily links in `/blog`, and no placeholder links.

**Step 2: Inspect responsive output**

Run a local static server for `dist/` and inspect desktop and mobile screenshots if browser tooling is available. Verify navigation contrast, section order, long Chinese titles, focus states, and no horizontal overflow. If no browser tool is available, state that visual inspection remains pending rather than claiming it was done.

**Step 3: Update documentation**

Add a short README note describing the brand homepage, original/daily split, and `pnpm test:brand` verification command.

**Step 4: Commit documentation and review branch**

```bash
git add README.md
git commit -m "docs: 记录品牌站结构与验收命令"
git status --short
git log --oneline origin/main..HEAD
```

Expected: clean worktree and six small commits. Do not push or deploy from the worktree. Return to the main session for code review, merge, and deployment approval.
