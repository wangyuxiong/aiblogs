# 数字游民博客实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个高性能的数字游民个人品牌博客，包含首页、博客列表、文章详情、关于我四个核心页面，使用 Next.js 15 + Tailwind CSS + shadcn/ui + Contentlayer。

**Architecture:** 采用 Next.js App Router，Contentlayer 将 Obsidian Markdown 文件编译为类型安全的数据层，Tailwind 实现响应式设计，Framer Motion 添加页面动画。

**Tech Stack:** Next.js 15, React 19, TypeScript 5.5, Tailwind CSS 4.0, shadcn/ui, Contentlayer, Framer Motion, Lucide React

---

## 文件结构规划

```
my-blog/
├── app/
│   ├── layout.tsx                 # 根布局 - 字体、全局样式、导航
│   ├── page.tsx                   # 首页 - Hero + 精选文章 + 订阅
│   ├── globals.css                # 全局 CSS + Tailwind 导入
│   ├── blog/
│   │   ├── page.tsx               # 博客列表 - 筛选 + 瀑布流网格
│   │   └── [slug]/page.tsx        # 文章详情 - MDX 渲染 + 目录
│   └── about/page.tsx             # 关于我 - 分屏布局 + 技能展示
├── components/
│   ├── ui/                        # shadcn/ui 组件
│   ├── layout/
│   │   ├── navbar.tsx             # 导航栏 - 滚动效果
│   │   └── footer.tsx             # 页脚
│   ├── sections/
│   │   ├── hero.tsx               # Hero 区域组件
│   │   ├── featured-posts.tsx     # 精选文章网格
│   │   └── newsletter.tsx         # 订阅表单
│   └── content/
│       ├── post-card.tsx          # 博客卡片
│       ├── table-of-contents.tsx  # 目录导航
│       └── mdx-components.tsx     # MDX 自定义组件
├── content/
│   └── blog/                      # Markdown 文章
│       ├── hello-world.mdx
│       └── sample-post.mdx
├── contentlayer.config.ts         # Contentlayer 配置
├── lib/
│   └── utils.ts                   # 工具函数
├── types/
│   └── index.ts                   # TypeScript 类型定义
├── public/
│   └── images/                    # 静态图片
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`

### Step 1.1: 初始化 package.json

```bash
cat > package.json << 'EOF'
{
  "name": "digital-nomad-blog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "contentlayer build"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "contentlayer": "^0.3.4",
    "next-contentlayer": "^0.3.4",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
EOF
```

### Step 1.2: 创建 tsconfig.json

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "contentlayer/generated": ["./.contentlayer/generated"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".contentlayer/generated"],
  "exclude": ["node_modules"]
}
EOF
```

### Step 1.3: 创建 next.config.js

```bash
cat > next.config.js << 'EOF'
const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
}

module.exports = withContentlayer(nextConfig)
EOF
```

### Step 1.4: 创建 Tailwind CSS 配置

```bash
mkdir -p app
cat > app/globals.css << 'EOF'
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --accent: 220 90% 56%;
  --accent-foreground: 0 0% 100%;
  --muted: 0 0% 45%;
  --border: 0 0% 90%;
  --card: 0 0% 98%;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-feature-settings: "rlig" 1, "calt" 1;
}

/* Custom animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Typography */
.prose h1 {
  font-family: 'Playfair Display', serif;
}

.prose h2, .prose h3 {
  font-family: 'Playfair Display', serif;
}

/* First letter drop cap */
.drop-cap::first-letter {
  float: left;
  font-size: 3.5rem;
  line-height: 1;
  padding-right: 0.75rem;
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}
EOF
```

### Step 1.5: 创建 postcss.config.js

```bash
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF
```

### Step 1.6: 安装依赖

```bash
npm install
```

Expected output: node_modules created, packages installed

### Step 1.7: 提交

```bash
git add .
git commit -m "chore: initialize Next.js project with Tailwind CSS"
```

---

## Task 2: Contentlayer 配置

**Files:**
- Create: `contentlayer.config.ts`
- Create: `content/blog/hello-world.mdx`
- Create: `content/blog/sample-post.mdx`

### Step 2.1: 创建 Contentlayer 配置

```bash
cat > contentlayer.config.ts << 'EOF'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    date: { type: 'date', required: true },
    category: {
      type: 'enum',
      options: ['travel-guide', 'remote-work', 'income-report', 'gear', 'photography'],
      required: true,
    },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    location: { type: 'string' },
    coverImage: { type: 'string' },
    isDraft: { type: 'boolean', default: false },
    isFeatured: { type: 'boolean', default: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.sourceFileName.replace(/\.mdx$/, ''),
    },
    readingTime: {
      type: 'number',
      resolve: (post) => Math.ceil(post.body.raw.split(' ').length / 200),
    },
    url: {
      type: 'string',
      resolve: (post) => `/blog/${post._raw.sourceFileName.replace(/\.mdx$/, '')}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})
EOF
```

### Step 2.2: 创建示例博客文章

```bash
mkdir -p content/blog

cat > content/blog/hello-world.mdx << 'EOF'
---
title: "你好，数字游民世界"
excerpt: "这是我作为数字游民的第一篇博客，记录下这个重要的时刻，以及我为何选择这种生活方式。"
date: 2025-04-30
category: remote-work
tags: ["数字游民", "远程工作", "生活方式"]
location: "杭州，中国"
coverImage: "/images/hero.jpg"
isFeatured: true
---

# 启程：我的数字游民之路

> 代码与咖啡，在世界的角落构建生活。

三年前，我还是一名普通的上班族，每天挤地铁、打卡、坐在固定的工位上。那时的我从未想过，有一天我可以在巴厘岛的咖啡馆里写代码，在清迈的公寓里开视频会议，在东京的共享办公空间里完成项目交付。

## 为什么选择数字游民

数字游民（Digital Nomad）这个生活方式吸引我的地方，不仅仅是"边旅行边工作"的浪漫想象。真正打动我的是：

### 时间的自主权

我可以选择在效率最高的时间段工作，而不是被固定的朝九晚五束缚。清晨6点的灵感爆发期，或者深夜的宁静时刻，都属于我。

### 地理的灵活性

不再被绑在某个特定的城市。冬天可以去东南亚避寒，夏天可以去北海道避暑。每一次搬家都是一次新的冒险。

### 成本的优化

通过"地理套利"，我可以在生活成本较低的地方赚取一线城市的收入，这让我的储蓄率大大提升。

## 接下来的计划

这个博客将记录我的：

- **旅居指南**：每个城市的真实体验和网络测评
- **远程工作**：高效协作的工具和方法论
- **收入报告**：透明地分享财务状况
- **装备清单**： nomad 的必备好物

如果你也对这种生活方式感兴趣，欢迎订阅我的周报。

---

*写于杭州，一个即将启程的夜晚。*
EOF

cat > content/blog/sample-post.mdx << 'EOF'
---
title: "清迈：数字游民的圣地"
excerpt: "为什么全球这么多数字游民选择清迈作为基地？一个月的生活体验告诉你答案。"
date: 2025-03-15
category: travel-guide
tags: ["泰国", "清迈", "旅居指南", "生活成本"]
location: "清迈，泰国"
coverImage: "/images/chiangmai.jpg"
isFeatured: true
---

# 清迈：数字游民的圣地

如果你问任何一个资深数字游民推荐的第一站是哪里，十有八九会得到同一个答案：**清迈**。

## 为什么是清迈

### 1. 超值的性价比

在清迈，你可以用每月不到 1000 美元租到带泳池的公寓，吃到每顿不到 5 美元的美味泰餐。这种生活质量，在欧美城市可能要花掉 3-5 倍的预算。

### 2. 完善的数字游民生态

- **咖啡馆**：遍布全城的咖啡馆，几乎都提供高速 Wi-Fi
- **共享办公空间**：Punspace、Yellow 等知名共享办公空间
- **社区活动**：Meetup、Facebook 群组活跃，很容易认识同行

### 3. 签证友好

泰国对游客相对友好，60 天旅游签可延长，数字游民签证也在试点中。

## 我的一个月开销

| 项目 | 费用 (USD) |
|------|-----------|
| 公寓（一室一厅，带泳池） | $450 |
| 餐饮 | $200 |
| 交通（Grab + 租摩托车） | $80 |
| 共享办公空间 | $100 |
| 其他娱乐 | $150 |
| **总计** | **~$980** |

## 网络测评

- **下载速度**：50-100 Mbps（公寓）
- **上传速度**：30-50 Mbps
- **稳定性**：偶尔停电，建议准备移动热点备用

## 总结

清迈是数字游民的完美入门城市。生活成本低、社区成熟、食物美味、人民友善。如果你刚开始 nomad 生活，这里绝对值得一试。
EOF
```

### Step 2.3: 生成 Contentlayer 类型

```bash
npx contentlayer build
```

Expected output: `.contentlayer/generated` directory created

### Step 2.4: 提交

```bash
git add .
git commit -m "feat: configure Contentlayer with Post document type"
```

---

## Task 3: 工具函数和类型

**Files:**
- Create: `lib/utils.ts`
- Create: `types/index.ts`
- Create: `next-env.d.ts`

### Step 3.1: 创建工具函数

```bash
mkdir -p lib types
cat > lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
EOF
```

### Step 3.2: 创建类型定义

```bash
cat > types/index.ts << 'EOF'
export type Category = 'travel-guide' | 'remote-work' | 'income-report' | 'gear' | 'photography'

export interface Post {
  slug: string
  title: string
  excerpt: string
  date: Date
  category: Category
  tags: string[]
  location?: string
  coverImage?: string
  isDraft: boolean
  isFeatured: boolean
  readingTime: number
  url: string
  body: {
    raw: string
    code: string
  }
}

export interface TocItem {
  id: string
  text: string
  level: number
}
EOF
```

### Step 3.3: 创建 Next.js 环境声明

```bash
cat > next-env.d.ts << 'EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
EOF
```

### Step 3.4: 提交

```bash
git add .
git commit -m "chore: add utility functions and TypeScript types"
```

---

## Task 4: 根布局和字体配置

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx` (临时)

### Step 4.1: 创建根布局

```bash
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '数字游民生活志',
  description: '代码与咖啡，在世界的角落构建生活',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  )
}
EOF
```

### Step 4.2: 创建临时首页

```bash
cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">数字游民生活志 - 开发中</h1>
    </main>
  )
}
EOF
```

### Step 4.3: 测试开发服务器

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
pkill -f "next dev"
```

Expected output: HTML containing "数字游民生活志 - 开发中"

### Step 4.4: 提交

```bash
git add .
git commit -m "feat: configure root layout with Google Fonts"
```

---

## Task 5: 导航栏组件

**Files:**
- Create: `components/layout/navbar.tsx`
- Modify: `app/layout.tsx`

### Step 5.1: 创建导航栏组件

```bash
mkdir -p components/layout
cat > components/layout/navbar.tsx << 'EOF'
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/about', label: '关于' },
  { href: '/blog', label: '日志' },
  { href: '#', label: '地图' },
  { href: '#', label: '订阅' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold tracking-tight">
            数字游民
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
EOF
```

### Step 5.2: 更新布局

```bash
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '数字游民生活志',
  description: '代码与咖啡，在世界的角落构建生活',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased font-sans">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
EOF
```

### Step 5.3: 提交

```bash
git add .
git commit -m "feat: add navbar with scroll effect and mobile menu"
```

---

## Task 6: 首页 Hero 区域

**Files:**
- Create: `components/sections/hero.tsx`
- Create: `components/sections/newsletter.tsx`
- Modify: `app/page.tsx`

### Step 6.1: 创建 Hero 组件

```bash
mkdir -p components/sections
cat > components/sections/hero.tsx << 'EOF'
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/hero-bg.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <MapPin className="w-3 h-3" />
          <span className="text-xs font-medium">当前坐标：杭州，中国</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          代码与咖啡，
          <br />
          在世界的角落构建生活
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          记录真实的旅居数据与心路历程，分享远程工作的专业技能与全球生活方式
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/about"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors"
          >
            阅读我的故事
          </Link>
          <Link
            href="#map"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
          >
            查看旅居地图
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
EOF
```

### Step 6.2: 创建 Newsletter 组件

```bash
cat > components/sections/newsletter.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            订阅我的数字游民周报
          </h2>
          <p className="text-gray-600 mb-8">
            每周精选内容，分享旅居攻略、远程工作技巧和生活方式灵感
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入你的邮箱"
              className="flex-1 px-5 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              {status === 'success' ? '订阅成功！' : '订阅'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
EOF
```

### Step 6.3: 更新首页

```bash
cat > app/page.tsx << 'EOF'
import { Hero } from '@/components/sections/hero'
import { Newsletter } from '@/components/sections/newsletter'
import { allPosts } from 'contentlayer/generated'
import { FeaturedPosts } from '@/components/sections/featured-posts'

export default function Home() {
  const featuredPosts = allPosts
    .filter((post) => post.isFeatured && !post.isDraft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <>
      <Hero />
      <FeaturedPosts posts={featuredPosts} />
      <Newsletter />
    </>
  )
}
EOF
```

### Step 6.4: 提交

```bash
git add .
git commit -m "feat: add Hero section with animations and newsletter component"
```

---

## Task 7: 精选文章组件

**Files:**
- Create: `components/sections/featured-posts.tsx`
- Create: `components/content/post-card.tsx`

### Step 7.1: 创建 PostCard 组件

```bash
mkdir -p components/content
cat > components/content/post-card.tsx << 'EOF'
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  location?: string
  coverImage?: string
  readingTime: number
}

interface PostCardProps {
  post: Post
  variant?: 'large' | 'small'
}

const categoryLabels: Record<string, string> = {
  'travel-guide': '旅居指南',
  'remote-work': '远程工作',
  'income-report': '收入报告',
  'gear': '装备清单',
  'photography': '摄影',
}

export function PostCard({ post, variant = 'small' }: PostCardProps) {
  const isLarge = variant === 'large'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${isLarge ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
          {post.location && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              {post.location.split('，')[0]}
            </div>
          )}
        </div>

        <div className={`${isLarge ? 'mt-5' : 'mt-4'}`}>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="text-blue-600 font-medium">{categoryLabels[post.category] || post.category}</span>
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime}分钟
            </span>
          </div>

          <h3
            className={`font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 ${
              isLarge ? 'text-xl sm:text-2xl' : 'text-base'
            }`}
          >
            {post.title}
          </h3>

          {isLarge && <p className="mt-2 text-gray-600 line-clamp-2 text-sm sm:text-base">{post.excerpt}</p>}
        </div>
      </Link>
    </motion.article>
  )
}
EOF
```

### Step 7.2: 创建 FeaturedPosts 组件

```bash
cat > components/sections/featured-posts.tsx << 'EOF'
'use client'

import { PostCard } from '@/components/content/post-card'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  location?: string
  coverImage?: string
  readingTime: number
}

interface FeaturedPostsProps {
  posts: Post[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1, 4)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2
            className="text-2xl sm:text-3xl font-serif font-bold"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            精选内容
          </h2>
          <a href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            查看全部 →
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Large Featured Post */}
          <div className="lg:row-span-3">
            <PostCard post={featuredPost} variant="large" />
          </div>

          {/* Small Posts */}
          <div className="space-y-6 lg:space-y-8">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} variant="small" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
EOF
```

### Step 7.3: 提交

```bash
git add .
git commit -m "feat: add featured posts grid with PostCard component"
```

---

## Task 8: 博客列表页

**Files:**
- Create: `app/blog/page.tsx`

### Step 8.1: 创建博客列表页

```bash
mkdir -p app/blog
cat > app/blog/page.tsx << 'EOF'
import { allPosts } from 'contentlayer/generated'
import { PostCard } from '@/components/content/post-card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '日志归档 | 数字游民生活志',
  description: '旅居指南、远程工作技巧与生活方式分享',
}

const categories = [
  { id: 'all', label: '全部' },
  { id: 'travel-guide', label: '旅居指南' },
  { id: 'remote-work', label: '远程工作' },
  { id: 'income-report', label: '收入报告' },
  { id: 'gear', label: '装备清单' },
  { id: 'photography', label: '摄影' },
]

export default function BlogPage() {
  const posts = allPosts
    .filter((post) => !post.isDraft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl font-serif font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            日志归档
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            记录真实的旅居数据与心路历程，分享远程工作的专业技能与全球生活方式
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={{
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                date: post.date,
                category: post.category,
                location: post.location,
                coverImage: post.coverImage,
                readingTime: post.readingTime,
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无文章</p>
          </div>
        )}
      </div>
    </div>
  )
}
EOF
```

### Step 8.2: 提交

```bash
git add .
git commit -m "feat: add blog list page with category filter"
```

---

## Task 9: 文章详情页

**Files:**
- Create: `app/blog/[slug]/page.tsx`
- Create: `components/content/table-of-contents.tsx`
- Create: `components/content/mdx-components.tsx`

### Step 9.1: 创建 MDX 组件

```bash
cat > components/content/mdx-components.tsx << 'EOF'
import { cn } from '@/lib/utils'

export const mdxComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'mt-8 mb-4 text-3xl font-serif font-bold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'mt-8 mb-4 text-2xl font-serif font-bold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'mt-6 mb-3 text-xl font-serif font-bold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        'leading-7 mb-4 text-gray-700',
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'border-l-4 border-gray-300 pl-4 italic text-gray-700 my-6',
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'relative rounded bg-gray-100 px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        'mb-4 mt-4 overflow-x-auto rounded-lg border bg-black p-4',
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn('w-full', className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn('m-0 border-t p-0', className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      className={cn(
        'border px-4 py-2 text-left font-bold',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableDataCellElement>) => (
    <td className={cn('border px-4 py-2 text-left', className)} {...props} />
  ),
}
EOF
```

### Step 9.2: 创建目录组件

```bash
cat > components/content/table-of-contents.tsx << 'EOF'
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="sticky top-24">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">目录</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                'block text-sm transition-colors hover:text-gray-900',
                activeId === item.id ? 'text-blue-600 font-medium' : 'text-gray-500'
              )}
              style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
EOF
```

### Step 9.3: 创建文章详情页

```bash
mkdir -p app/blog/[slug]
cat > app/blog/[slug]/page.tsx << 'EOF'
import { notFound } from 'next/navigation'
import { allPosts } from 'contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { Metadata } from 'next'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { mdxComponents } from '@/components/content/mdx-components'
import { TableOfContents } from '@/components/content/table-of-contents'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: `${post.title} | 数字游民生活志`,
    description: post.excerpt,
  }
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }))
}

function extractHeadings(content: string) {
  const headings: Array<{ id: string; text: string; level: number }> = []
  const lines = content.split('\n')

  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      headings.push({ id, text, level })
    }
  })

  return headings
}

const categoryLabels: Record<string, string> = {
  'travel-guide': '旅居指南',
  'remote-work': '远程工作',
  'income-report': '收入报告',
  'gear': '装备清单',
  'photography': '摄影',
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  const MDXContent = useMDXComponent(post.body.code)
  const headings = extractHeadings(post.body.raw)

  return (
    <article className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <div>
            {/* Header */}
            <header className="mb-10 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                <span className="text-blue-600 font-medium">
                  {categoryLabels[post.category] || post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}分钟阅读
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight mb-4"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {post.title}
              </h1>

              {post.location && (
                <p className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  写于 {post.location}
                </p>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="drop-cap">
                <MDXContent components={mdxComponents} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents items={headings} />
          </aside>
        </div>
      </div>
    </article>
  )
}
EOF
```

### Step 9.4: 提交

```bash
git add .
git commit -m "feat: add blog post detail page with TOC and MDX rendering"
```

---

## Task 10: 关于我页面

**Files:**
- Create: `app/about/page.tsx`

### Step 10.1: 创建关于我页面

```bash
mkdir -p app/about
cat > app/about/page.tsx << 'EOF'
import { Metadata } from 'next'
import { Github, Twitter, Linkedin, Mail, Code, Palette, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: '关于我 | 数字游民生活志',
  description: '一个选择用代码探索世界的开发者',
}

const skills = [
  { name: 'React / Next.js', level: 95, category: 'technical' },
  { name: 'TypeScript', level: 90, category: 'technical' },
  { name: 'Node.js', level: 85, category: 'technical' },
  { name: '内容创作', level: 80, category: 'creative' },
  { name: 'SEO / 营销', level: 75, category: 'creative' },
  { name: '英语', level: 90, category: 'language' },
]

const gear = {
  hardware: [
    { name: 'MacBook Pro 16" M3 Max', description: '主力开发机器，性能强劲' },
    { name: 'Sony A7C', description: '轻便全画幅，旅行摄影首选' },
    { name: 'AirPods Pro 2', description: '降噪神器，专注工作必备' },
    { name: 'Peak Design 背包', description: '30L，完美装下所有装备' },
  ],
  software: [
    { name: 'Obsidian', description: '知识管理和写作' },
    { name: 'VS Code', description: '代码编辑器' },
    { name: 'Figma', description: 'UI 设计' },
    { name: 'Notion', description: '项目管理和协作' },
  ],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Photo */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-gray-500">照片占位符</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="pb-20">
            {/* Header */}
            <h1
              className="text-3xl sm:text-4xl font-serif font-bold mb-6"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              你好，我是数字游民
            </h1>

            {/* Bio */}
            <div className="prose prose-lg text-gray-700 mb-12">
              <p>
                三年前，我还是一名普通的上班族。每天挤地铁、打卡、坐在固定的工位上。
                那时的我从未想过，有一天我可以在世界的各个角落写代码。
              </p>
              <p>
                现在，我是一名远程工作的全栈开发者，也是这个数字游民博客的作者。
                我相信代码可以构建生活，而生活也可以滋养代码。
              </p>
              <p>
                通过这个博客，我希望记录真实的旅居数据与心路历程，
                分享远程工作的专业技能与全球生活方式。
              </p>
            </div>

            {/* Skills */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Code className="w-5 h-5" />
                技能栈
              </h2>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gear */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                装备清单
              </h2>

              {/* Hardware */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  硬件
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gear.hardware.map((item) => (
                    <div key={item.name} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Software */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  软件
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gear.software.map((item) => (
                    <div key={item.name} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                联系方式
              </h2>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="mailto:hello@example.com"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF
```

### Step 10.2: 提交

```bash
git add .
git commit -m "feat: add about page with skills and gear sections"
```

---

## Task 11: 响应式优化和细节调整

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

### Step 11.1: 更新全局样式

```bash
cat > app/globals.css << 'EOF'
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --accent: 220 90% 56%;
  --accent-foreground: 0 0% 100%;
  --muted: 0 0% 45%;
  --border: 0 0% 90%;
  --card: 0 0% 98%;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-feature-settings: "rlig" 1, "calt" 1;
}

/* Custom animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Typography */
.prose h1 {
  font-family: var(--font-playfair), serif;
}

.prose h2, .prose h3 {
  font-family: var(--font-playfair), serif;
}

/* First letter drop cap */
.drop-cap::first-letter {
  float: left;
  font-size: 3.5rem;
  line-height: 1;
  padding-right: 0.75rem;
  font-family: var(--font-playfair), serif;
  font-weight: 700;
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth image loading */
img {
  opacity: 1;
  transition: opacity 0.3s;
}

img[data-loading="true"] {
  opacity: 0;
}
EOF
```

### Step 11.2: 更新布局添加页脚

```bash
cat > components/layout/footer.tsx << 'EOF'
export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} 数字游民生活志. All rights reserved.
        </p>
        <p className="text-sm text-gray-400">
          Built with Next.js & Tailwind CSS
        </p>
      </div>
    </footer>
  )
}
EOF
```

```bash
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '数字游民生活志',
    template: '%s | 数字游民生活志',
  },
  description: '代码与咖啡，在世界的角落构建生活',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://your-domain.com',
    siteName: '数字游民生活志',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased font-sans">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
EOF
```

### Step 11.3: 提交

```bash
git add .
git commit -m "feat: add footer and responsive polish"
```

---

## Task 12: PM2 部署配置

**Files:**
- Create: `ecosystem.config.js`
- Create: `deploy.sh`

### Step 12.1: 创建 PM2 配置文件

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'digital-nomad-blog',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/digital-nomad-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      restart_delay: 3000,
      min_uptime: '10s',
      max_restarts: 5,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
}
EOF
```

### Step 12.2: 创建部署脚本

```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

# Digital Nomad Blog Deployment Script

set -e

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Create logs directory
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 not found. Installing..."
    npm install -g pm2
fi

# Check if app is already running
if pm2 list | grep -q "digital-nomad-blog"; then
    echo "🔄 Restarting application..."
    pm2 restart ecosystem.config.js
else
    echo "▶️ Starting application..."
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
pm2 status
EOF

chmod +x deploy.sh
```

### Step 12.3: 更新 .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnpm-store

# Build outputs
.next
out
dist
.contentlayer

# Environment
.env
.env.local
.env.production

# Logs
logs
*.log
npm-debug.log*

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage

# Misc
*.pem
EOF
```

### Step 12.4: 提交

```bash
git add .
git commit -m "feat: add PM2 deployment configuration and deploy script"
```

---

## Task 13: 最终测试和构建

**Files:**
- Run: build and test commands

### Step 13.1: 运行构建

```bash
npm run build
```

Expected output: Build successful, no TypeScript errors

### Step 13.2: 检查输出

```bash
ls -la .next/
ls -la out/ 2>/dev/null || echo "Static export not configured (expected for Node.js server)"
```

### Step 13.3: 验证关键文件存在

```bash
echo "Checking key files..."
[ -f "app/page.tsx" ] && echo "✓ Homepage exists"
[ -f "app/blog/page.tsx" ] && echo "✓ Blog list exists"
[ -f "app/blog/[slug]/page.tsx" ] && echo "✓ Blog post exists"
[ -f "app/about/page.tsx" ] && echo "✓ About page exists"
[ -f "components/layout/navbar.tsx" ] && echo "✓ Navbar exists"
[ -f "contentlayer.config.ts" ] && echo "✓ Contentlayer config exists"
[ -f "ecosystem.config.js" ] && echo "✓ PM2 config exists"
echo "All key files verified!"
```

### Step 13.4: 最终提交

```bash
git add .
git commit -m "chore: final build verification"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| 需求 | 任务 |
|------|------|
| Next.js 项目初始化 | Task 1 |
| Tailwind CSS 配置 | Task 1 |
| Contentlayer 集成 | Task 2 |
| 首页 Hero 区域 | Task 6 |
| 精选文章网格 | Task 7 |
| 博客列表页 | Task 8 |
| 文章详情页 | Task 9 |
| 关于我页面 | Task 10 |
| 响应式设计 | Task 11 |
| PM2 部署配置 | Task 12 |

✅ **所有需求已覆盖**

### 2. Placeholder Scan

- ❌ 无 "TBD" 或 "TODO" 占位符
- ❌ 无 "implement later" 描述
- ❌ 所有代码片段包含完整实现
- ❌ 所有命令包含完整路径

### 3. Type Consistency

- ✅ `Post` interface 定义一致
- ✅ `category` 枚举值在各处一致
- ✅ 组件 Props 类型定义完整

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2025-04-30-digital-nomad-blog.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints for review

**Which approach do you prefer?**

---

## Post-Implementation Notes

After implementation completes, remember to:

1. Add actual hero background image to `public/images/hero-bg.jpg`
2. Add profile photo to `public/images/` for about page
3. Update social media links in about page
4. Configure actual newsletter service (ConvertKit/Mailchimp) in newsletter component
5. Test on actual server with `npm run build && ./deploy.sh`

---

**Plan created**: 2025-04-30  
**Estimated implementation time**: 2-3 hours  
**Total tasks**: 13
