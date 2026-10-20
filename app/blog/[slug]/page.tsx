import { notFound } from 'next/navigation'
import { allPosts } from 'contentlayer/generated'
import { Metadata } from 'next'
import GithubSlugger from 'github-slugger'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getCategoryLabel } from '@/lib/categories'
import { mdxComponents } from '@/components/content/mdx-components'
import { TableOfContents } from '@/components/content/table-of-contents'
import { MDXContent } from './mdx-content'

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
    // 布局模板会自动追加 " | Mind Keeper"，这里只写文章标题
    title: post.title,
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
  return allPosts
    .filter((post) => !post.isDraft)
    .map((post) => ({
      slug: post.slug,
    }))
}

/**
 * 把标题里的行内 Markdown 还原为纯文本，
 * 这样算出的 id 才能和 rehype-slug 基于渲染文本生成的 id 一致。
 */
function inlineMarkdownToText(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 链接
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/~~([^~]+)~~/g, '$1') // 删除线
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 加粗
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<[^>]+>/g, '') // 行内 HTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function extractHeadings(content: string) {
  const slugger = new GithubSlugger()
  const headings: Array<{ id: string; text: string; level: number }> = []
  const lines = content.split('\n')

  lines.forEach((line) => {
    // 所有标题都参与编号去重（与 rehype-slug 保持一致），
    // 但目录只展示 h2/h3
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = inlineMarkdownToText(match[2])
      const id = slugger.slug(text)
      if (level === 2 || level === 3) {
        headings.push({ id, text, level })
      }
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)

  if (!post || post.isDraft) {
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
                  {getCategoryLabel(post.category)}
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
                <MDXContent code={post.body.code} components={mdxComponents} />
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
