import { allPosts } from 'contentlayer/generated'
import { PostCard } from '@/components/content/post-card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '日志归档 | 数字游民生活志',
  description: '旅居指南、远程工作技巧与生活方式分享',
}

const categories = [
  { id: 'all', label: '全部' },
  { id: 'travel-guide', label: '旅居指南' },
  { id: 'remote-work', label: '远程工作' },
  { id: 'income-report', label: '收入报告' },
  { id: 'gear', label: '装备清单' },
  { id: 'photography', label: '摄影' },
]

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
            记录真实的旅居数据与心路历程，分享远程工作的专业技能与全球生活方式
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={{
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                date: post.date,
                category: post.category,
                location: post.location,
                coverImage: post.coverImage,
                readingTime: post.readingTime,
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无文章</p>
          </div>
        )}
      </div>
    </div>
  )
}
