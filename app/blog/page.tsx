import { allPosts } from 'contentlayer/generated'
import { BlogListing } from '@/components/content/blog-listing'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '日志归档',
  description: 'AI 学习日刊与 AI 技术深度文章的完整归档',
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  const posts = allPosts
    .filter((post) => !post.isDraft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl font-serif font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            日志归档
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI 学习日刊每日更新，深度文章记录技术实践与行业观察
          </p>
        </div>

        <BlogListing
          posts={posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            date: post.date,
            category: post.category,
            location: post.location,
            coverImage: post.coverImage,
            readingTime: post.readingTime,
          }))}
        />
      </div>
    </div>
  )
}
