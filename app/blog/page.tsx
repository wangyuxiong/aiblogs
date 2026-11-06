import { allPosts } from 'contentlayer/generated'
import { BlogListing } from '@/components/content/blog-listing'
import { getOriginalPosts, toPostListItem } from '@/lib/posts'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '原创文章',
  description: '教程、技术实践与真实项目复盘',
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  const posts = getOriginalPosts(allPosts)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl font-serif font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            原创文章
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            教程、技术实践与真实项目复盘
          </p>
        </div>

        <BlogListing posts={posts.map(toPostListItem)} />
      </div>
    </div>
  )
}
