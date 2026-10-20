import type { Metadata } from 'next'
// 自托管字体（npm 包内置 woff2），避免构建期依赖 Google Fonts
import '@fontsource-variable/inter'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const SITE_URL = 'https://mind-keeper.com'

export const metadata: Metadata = {
  title: {
    default: 'Mind Keeper | AI 学习日刊',
    template: '%s | Mind Keeper',
  },
  description: 'AI 学习日刊：每天精选模型发布、Agent 工具、研究进展与行业动态，用最短时间了解 AI 前沿',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: 'Mind Keeper',
    images: [{
      url: '/images/og-default.png',
      width: 1200,
      height: 630,
      alt: 'Mind Keeper',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mindkeeper',
    creator: '@mindkeeper',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '', // TODO: add Google Search Console verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased font-sans">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
