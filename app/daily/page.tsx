import { allPosts } from 'contentlayer/generated'
import { PostCard } from '@/components/content/post-card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 学习日刊 | Mind Keeper',
  description: '每天精选 AI 领域最有价值的动态，帮你快速了解行业脉搏',
}

export default function DailyPage() {
  // 显示 ai-daily 和 AI Daily 分类的文章
  const dailyPosts = allPosts
    .filter((post) => {
      const cat = post.category?.toLowerCase() || ''
      return (cat === 'ai-daily' || cat === 'ai daily' || cat === 'ai 日报') && !post.isDraft
    })
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
            AI 学习日刊
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            每天精选 AI 领域最有价值的动态，帮你快速了解行业脉搏
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>📅 每日更新</span>
            <span>•</span>
            <span>🤖 自动抓取</span>
            <span>•</span>
            <span>📡 10+ 新闻源</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{dailyPosts.length}</div>
            <div className="text-sm text-gray-500">期数日刊</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">10+</div>
            <div className="text-sm text-gray-500">新闻源</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">∞</div>
            <div className="text-sm text-gray-500">持续更新</div>
          </div>
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
            <p className="text-gray-500 mb-4">暂无日刊内容</p>
            <p className="text-sm text-gray-400">
              日刊每天上午自动更新，请稍后再来
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
