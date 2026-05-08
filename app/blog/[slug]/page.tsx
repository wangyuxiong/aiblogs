import { notFound } from 'next/navigation'
import { allPosts } from 'contentlayer/generated'
import { Metadata } from 'next'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { TableOfContents } from '@/components/content/table-of-contents'
import { MDXContentWrapper } from './mdx-content'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const SITE_URL = 'https://mind-keeper.com'

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: `${post.title} | Mind Keeper`,
    description: post.excerpt,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Mind Keeper'],
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630 }]
        : [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
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

function generateArticleJsonLd(post: typeof allPosts[0]) {
  const url = `${SITE_URL}/blog/${post.slug}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'Mind Keeper' },
    publisher: {
      '@type': 'Organization',
      name: 'Mind Keeper',
      logo: { '@type': 'ImageObject', url: SITE_URL },
    },
    url,
    mainEntityOfPage: url,
    ...(post.coverImage ? { image: { '@type': 'ImageObject', url: post.coverImage } } : {}),
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
  }
  return JSON.stringify(data)
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

  const headings = extractHeadings(post.body.raw)

  return (
    <article className="min-h-screen pt-24 pb-20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateArticleJsonLd(post) }}
      />
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
                <MDXContentWrapper code={post.body.code} />
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
