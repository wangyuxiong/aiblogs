# 数字游民博客设计文档

## 项目概述

**项目名称**: 数字游民生活志（暂定）  
**定位**: 高性能、极简主义、内容驱动的个人品牌站点  
**技术栈**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui  
**部署**: Node.js + PM2 on 阿里云 (2c4G)  
**内容源**: Obsidian Markdown 文件

---

## 架构设计

### 技术栈选择

| 层级 | 技术选择 | 说明 |
|------|----------|------|
| 框架 | Next.js 15 (App Router) | 全栈 React 框架，支持 SSR/SSG/ISR |
| 运行时 | Node.js 20+ | 长期支持版本 |
| 语言 | TypeScript 5.5+ | 类型安全 |
| 样式 | Tailwind CSS 4.0 | 原子化 CSS |
| 组件库 | shadcn/ui | 基于 Radix UI 的无障碍组件 |
| 动画 | Framer Motion | React 声明式动画 |
| 图标 | Lucide React | 现代化图标库 |
| MDX 处理 | contentlayer | 类型安全的 MDX 内容层 |
| 地图 | Leaflet (第二阶段) | 开源地图库 |

### 项目结构

```
my-blog/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 根布局（字体、全局样式）
│   ├── page.tsx              # 首页
│   ├── blog/
│   │   ├── page.tsx          # 博客列表
│   │   └── [slug]/page.tsx   # 文章详情
│   ├── about/page.tsx        # 关于我
│   ├── api/                  # API 路由
│   │   └── revalidate/route.ts  # 内容更新接口
│   ├── components/           # 页面级组件
│   └── globals.css
├── components/               # 共享组件（shadcn + 自定义）
│   ├── ui/                   # shadcn 组件
│   ├── layout/               # 布局组件（导航、页脚）
│   ├── content/              # 内容展示组件
│   └── sections/             # 页面区块组件
├── content/                  # Obsidian Markdown 文件
│   ├── blog/                 # 博客文章
│   ├── pages/                # 静态页面内容
│   └── data/                 # JSON 数据（地图坐标等）
├── lib/                      # 工具函数
│   ├── mdx.ts                # MDX 解析工具
│   └── utils.ts
├── types/                    # TypeScript 类型定义
├── public/                   # 静态资源
│   ├── images/
│   └── fonts/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 页面设计

### 1. 首页 (`/`)

**设计目标**: 3秒内抓住访客眼球，通过视觉冲击力展示生活方式，同时引导阅读。

**布局**:
- **导航栏**: 透明背景，滚动后添加 backdrop-blur 磨砂玻璃效果
  - 左侧: 文字 Logo
  - 右侧: 汉堡菜单（移动端）或文字链接（关于 / 日志 / 地图 / 订阅）
- **Hero 区域**: 全屏高度（100vh），高质量背景图 + 渐变遮罩
  - 衬线体大标题（Playfair Display）: "代码与咖啡，在世界的角落构建生活"
  - 动态位置标签: 胶囊状，显示 "当前坐标：杭州，中国"，带在线状态点
  - CTA 按钮组: 实心主按钮 "阅读我的故事" + 描边次按钮 "查看旅居地图"
- **精选内容**: 不对称网格布局
  - 左侧: 大卡片（最新文章）
  - 右侧: 3个小卡片（垂直排列）
- **订阅区域**: 极简输入框 + 箭头按钮，文案 "订阅我的数字游民周报"

**交互**:
- 页面加载: 文字向上浮动淡入（Framer Motion）
- 图片懒加载: 渐显效果
- 导航栏滚动监听: 滚动50px后切换样式

**数据结构**:
```typescript
interface FeaturedPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: Date;
  readingTime: number;
  isFeatured: boolean;
}
```

---

### 2. 博客列表页 (`/blog`)

**设计目标**: 方便用户按"地点"或"主题"快速找到感兴趣的内容。

**布局**:
- **筛选栏**: 横向滚动标签 [全部] [旅居指南] [远程工作] [收入报告] [装备清单]，选中下划线动画
- **瀑布流网格**: 2列（移动端1列，桌面端2-3列）
  - 卡片: 图片3:2比例，悬停放大效果
  - 元数据: 分类标签 + 标题 + 阅读时间
  - 位置标记: 右下角地图定位图标（游记文章）
- **侧边栏**（桌面端）:
  - 关于我（小卡片）: 圆形头像 + 简短介绍
  - 热门标签云
  - 最近去过的地方（3张缩略图堆叠）

**数据结构**:
```typescript
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  category: 'travel-guide' | 'remote-work' | 'income-report' | 'gear' | 'photography';
  tags: string[];
  location?: string;  // 如: "巴厘岛, 印度尼西亚"
  publishedAt: Date;
  updatedAt?: Date;
  readingTime: number;
  isDraft: boolean;
}
```

---

### 3. 文章详情页 (`/blog/[slug]`)

**设计目标**: 极致的阅读体验，像看一本高质量的在线杂志。

**布局**:
- **头部**: 超大标题居中，文章元数据（发布日期 | 作者 | 地点）
- **正文区域**:
  - 最大宽度限制（max-w-3xl，约768px）
  - 首字下沉效果（杂志风格）
  - 引用块: 左侧竖线 + 淡灰背景 + 加粗字体
  - 图片: 全宽，点击放大，带说明文字
- **右侧悬浮目录**（桌面端）: 随滚动高亮当前章节
  - 移动端: 右下角悬浮"目录"按钮，点击弹出底部抽屉
- **底部**:
  - 作者卡片: "喜欢这篇文章？关注我"
  - 上一篇/下一篇导航（带缩略图）

**Markdown 扩展语法**:
- YAML Frontmatter 支持完整元数据
- 图片语法: `![alt](src)` 支持相对路径
- Callout 语法: `> [!NOTE]` 等 Obsidian 风格
- 代码块: 语法高亮（Prism/Shiki）

---

### 4. 关于我页 (`/about`)

**设计目标**: 建立信任，展示技能，不仅是"玩"的人，还是"能干活"的人。

**布局**:
- **分屏布局**:
  - 左侧（固定）: 半身照片（黑白或低饱和度滤镜）
  - 右侧（可滚动）:
    - 自我介绍: 大段文字，讲述故事
    - 技能栈: 进度条或标签云展示（React, SEO, 内容营销, 视频剪辑等）
    - 装备清单: 手风琴折叠面板（硬件/软件）
    - 联系方式: 社交媒体图标（Twitter, GitHub, LinkedIn, Email）

**数据结构**:
```typescript
interface AboutData {
  title: string;
  bio: string;
  photo: string;
  skills: Array<{
    name: string;
    level: number; // 0-100
    category: 'technical' | 'creative' | 'language';
  }>;
  gear: {
    hardware: Array<{ name: string; description: string; link?: string }>;
    software: Array<{ name: string; description: string; link?: string }>;
  };
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    email: string;
  };
}
```

---

## 视觉设计规范

### 字体

| 用途 | 字体 | 安装 |
|------|------|------|
| 英文标题 | Playfair Display | Google Fonts |
| 英文正文 | Inter | Google Fonts |
| 中文正文 | Noto Sans SC | Google Fonts |
| 中文标题 | Noto Serif SC | Google Fonts |

### 配色方案

```css
:root {
  /* 基础色 */
  --background: 0 0% 100%;        /* 纯白背景 */
  --foreground: 0 0% 9%;          /* 近黑文字 */

  /* 强调色 - 电光蓝 */
  --accent: 220 90% 56%;
  --accent-foreground: 0 0% 100%;

  /* 辅助色 */
  --muted: 0 0% 45%;              /* 次要文字 */
  --border: 0 0% 90%;             /* 边框 */
  --card: 0 0% 98%;               /* 卡片背景 */
}
```

### 动画规范

| 动画 | 时长 | 缓动函数 |
|------|------|----------|
| 页面入场 | 0.6s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| 悬停效果 | 0.2s | `ease-out` |
| 导航栏过渡 | 0.3s | `ease-in-out` |
| 图片渐显 | 0.5s | `ease-out` |

---

## 技术实现要点

### Contentlayer 配置

- 定义 `Blog` 和 `Page` 文档类型
- 自定义 MDX 编译: 添加代码高亮、自定义组件
- 文件系统监听: 开发时自动重新加载

### 性能优化

- **图片**: Next.js Image 组件 + WebP 格式
- **字体**: Google Fonts 按需加载，使用 `next/font`
- **代码分割**: 按路由自动分割
- **静态生成**: 博客文章构建时生成静态 HTML

### SEO

- 自动生成 `sitemap.xml`
- 每篇文章自定义 `meta title` / `description`
- Open Graph 标签
- JSON-LD 结构化数据

---

## MVP 范围（第一阶段）

### 包含

- [ ] Next.js 项目初始化 + Tailwind + shadcn/ui
- [ ] Contentlayer 集成 MDX 内容管理
- [ ] 首页（Hero + 精选内容 + 订阅表单）
- [ ] 博客列表页（瀑布流 + 筛选）
- [ ] 文章详情页（阅读体验优化 + 目录导航）
- [ ] 关于我页（分屏布局 + 技能展示）
- [ ] 响应式设计（移动优先）
- [ ] PM2 部署配置

### 第二阶段

- 旅居地图（Leaflet 集成 + 时间轴）
- 邮件订阅功能（ConvertKit/Mailchimp API）
- 评论系统（Giscus）
- 站内搜索（Algolia）
- Newsletter 功能

---

## 验收标准

### 性能

- Lighthouse 评分: 移动端和桌面端 95+
- 首屏加载: 控制在 1秒以内
- 图片懒加载正常工作

### 功能

- 所有页面响应式正常
- MDX 内容正确渲染
- 导航和路由正常工作
- 表单交互正常

### 部署

- 通过 PM2 在服务器上稳定运行
- 支持自动重启
- 支持日志管理

---

**设计文档创建日期**: 2025-04-30  
**版本**: v1.0
