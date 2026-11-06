import type { Metadata } from 'next'
// 自托管字体（npm 包内置 woff2），避免构建期依赖 Google Fonts
import '@fontsource-variable/inter'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { site } from '@/lib/site'
import './globals.css'

const SITE_URL = site.url

export const metadata: Metadata = {
  title: {
    default: site.title,
    template: '%s | Mind Keeper',
  },
  description: site.description,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': site.rss,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: site.name,
    images: [{
      url: '/images/og-default.png',
      width: 1200,
      height: 630,
      alt: 'Mind Keeper',
    }],
  },
  twitter: {
    card: 'summary_large_image',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          跳到正文
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
