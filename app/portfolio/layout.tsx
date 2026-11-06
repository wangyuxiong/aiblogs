import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '项目',
  description: '文心启航 AI 写作教练与 Mind Keeper 日报系统的问题背景、实现方式、当前状态与可验证链接。',
  alternates: {
    canonical: '/portfolio',
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children
}
