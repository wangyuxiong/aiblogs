import { allPosts } from 'contentlayer/generated'
import { getDailyPosts } from '@/lib/posts'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 学习日刊',
  description: '内容来源于 AIHOT，经自动整理后发布',
  alternates: {
    canonical: '/daily',
  },
  openGraph: {
    url: '/daily',
  },
}

export default function DailyPage() {
  const dailyPosts = getDailyPosts(allPosts)
  const latestUpdate = dailyPosts[0]?.date.slice(0, 10)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl font-serif font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            AI 学习日刊
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            内容来源于 AIHOT，经自动整理后发布
          </p>
          {latestUpdate && (
            <p className="mt-4 text-sm text-gray-500">
              最近更新：{latestUpdate}
            </p>
          )}
        </div>

        <div className="mb-12 text-center">
          <span className="inline-block px-6 py-4 bg-gray-50 rounded-lg">
            <span className="block text-2xl font-bold text-gray-900">
              {dailyPosts.length}
            </span>
            <span className="block text-sm text-gray-500">期日刊</span>
          </span>
        </div>

        {/* Daily Posts List */}
        <div className="space-y-6">
          {dailyPosts.map((post) => (
            <article
              key={post.slug}
              className="group border-b border-gray-100 pb-6 last:border-0"
            >
              <a href={`/blog/${post.slug}`} className="block">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <span>•</span>
                      <span>{post.readingTime} 分钟阅读</span>
                      {post.tags && post.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">
                            {post.tags.slice(0, 3).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      日刊
                    </span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {dailyPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无日刊内容</p>
          </div>
        )}
      </div>
    </div>
  )
}
