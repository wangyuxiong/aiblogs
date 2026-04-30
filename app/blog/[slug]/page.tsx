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
