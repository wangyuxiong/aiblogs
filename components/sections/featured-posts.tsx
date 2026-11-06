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
  id?: string
  title?: string
  moreHref?: string
}

export function FeaturedPosts({
  posts,
  id,
  title = '精选内容',
  moreHref = '/blog',
}: FeaturedPostsProps) {
  if (posts.length === 0) return null

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1, 4)
  const hasOtherPosts = otherPosts.length > 0

  return (
    <section id={id} className="scroll-mt-24 bg-[#faf8f2] px-4 py-20 text-[#252a23] sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2
            className="text-2xl sm:text-3xl font-serif font-bold"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {title}
          </h2>
          <a href={moreHref} className="inline-flex min-h-11 items-center text-sm font-medium text-[#42543e] underline decoration-[#5d7059]/35 underline-offset-4 transition-colors hover:text-[#243724] hover:decoration-current">
            查看全部原创 →
          </a>
        </div>

        <div className={hasOtherPosts ? 'grid grid-cols-1 gap-8 lg:grid-cols-2' : 'max-w-2xl'}>
          <div className={hasOtherPosts ? 'lg:row-span-3' : undefined}>
            <PostCard post={featuredPost} variant="large" />
          </div>

          {hasOtherPosts && (
            <div className="space-y-6 lg:space-y-8">
              {otherPosts.map((post) => (
                <PostCard key={post.slug} post={post} variant="small" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
