import { Metadata } from 'next'

export const metadata: Metadata = {
  // absolute: 避免嵌套 layout 下 title 模板继承行为不一致
  title: { absolute: '文心启航 · AI 写作导师 | Mind Keeper' },
  description: '基于 Tauri + React 构建的桌面端 AI 写作导师应用，支持 Claude 与通义千问双模型',
  alternates: {
    canonical: '/portfolio/writing-coach',
  },
}

export default function WritingCoachLayout({ children }: { children: React.ReactNode }) {
  return children
}
