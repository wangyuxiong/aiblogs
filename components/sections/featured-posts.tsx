'use client'

import { PostCard } from '@/components/content/post-card'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  location?: string
  coverImage?: string
  readingTime: number
}

interface FeaturedPostsProps {
  posts: Post[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1, 4)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2
            className="text-2xl sm:text-3xl font-serif font-bold"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            精选内容
          </h2>
          <a href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            查看全部 →
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Large Featured Post */}
          <div className="lg:row-span-3">
            <PostCard post={featuredPost} variant="large" />
          </div>

          {/* Small Posts */}
          <div className="space-y-6 lg:space-y-8">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} variant="small" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
