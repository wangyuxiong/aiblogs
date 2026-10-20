import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '作品集',
  description: '我构建的数字产品：AI 写作导师「文心启航」等',
  alternates: {
    canonical: '/portfolio',
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children
}
