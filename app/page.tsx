import { Hero } from '@/components/sections/hero'
import { Newsletter } from '@/components/sections/newsletter'
import { allPosts } from 'contentlayer/generated'
import { FeaturedPosts } from '@/components/sections/featured-posts'

export default function Home() {
  // 首页聚焦日刊：展示最新 4 期
  const latestDailyPosts = allPosts
    .filter((post) => post.category === 'ai-daily' && !post.isDraft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)

  return (
    <>
      <Hero />
      <FeaturedPosts
        posts={latestDailyPosts.map((post) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: post.date,
          category: post.category,
          location: post.location,
          coverImage: post.coverImage,
          readingTime: post.readingTime,
        }))}
        title="最新日刊"
        moreHref="/daily"
      />
      <Newsletter />
    </>
  )
}
