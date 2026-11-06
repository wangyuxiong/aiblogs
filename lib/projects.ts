export type ProjectLink = {
  href: string
  label: string
  external?: boolean
}

export type Project = {
  slug: 'writing-coach' | 'daily-automation'
  name: string
  kind: string
  problem: string
  implementation: string
  stack: readonly string[]
  status: string
  links: readonly ProjectLink[]
}

export const projects: readonly Project[] = [
  {
    slug: 'writing-coach',
    name: '文心启航',
    kind: '桌面端 AI 写作教练',
    problem: '帮助中小学生把面对空白页的困难，拆成选题、构思、成稿等可以逐步完成的写作任务。',
    implementation: '以 Tauri 和 React 构建桌面应用，接入 Claude 与通义千问（Qwen），用本地 SQLite 保存作文与写作进度。',
    stack: ['Tauri', 'React', 'Claude', 'Qwen', '本地 SQLite'],
    status: '持续完善产品流程；当前仅公开项目案例，暂未提供公开仓库与安装包。',
    links: [{ href: '/portfolio/writing-coach', label: '查看文心启航项目案例' }],
  },
  {
    slug: 'daily-automation',
    name: 'Mind Keeper 日报系统',
    kind: '内容自动化与静态发布',
    problem: '把分散的 AI 技术与产品动态整理成可检索的日报，同时减少手工复制、排版和发布的重复工作。',
    implementation: '从 AIHOT 获取内容并生成转义后的 MDX，再由 GitHub Actions 提交、构建并部署静态站点。',
    stack: ['AIHOT', 'MDX', 'GitHub Actions', '静态部署'],
    status: '自动整理并发布；调度可能延迟，页面以实际发布日期为准。',
    links: [
      { href: '/daily', label: '查看自动整理的日报' },
      {
        href: 'https://github.com/wangyuxiong/aiblogs',
        label: '查看日报系统源码（GitHub）',
        external: true,
      },
    ],
  },
]
