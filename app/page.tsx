import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import { FeaturedPosts } from '@/components/sections/featured-posts'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { LatestDaily } from '@/components/sections/latest-daily'
import { LearningPath } from '@/components/sections/learning-path'
import { Newsletter } from '@/components/sections/newsletter'
import { PersonalHero } from '@/components/sections/personal-hero'
import { getDailyPosts, getOriginalPosts, toPostListItem } from '@/lib/posts'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    absolute: site.title,
  },
}

export default function Home() {
  const originalPosts = getOriginalPosts(allPosts).slice(0, 4).map(toPostListItem)
  const latestDailyPosts = getDailyPosts(allPosts).slice(0, 3).map(toPostListItem)

  return (
    <>
      <PersonalHero />
      <LearningPath />
      <FeaturedProjects />
      <FeaturedPosts
        id="original-articles"
        posts={originalPosts}
        title="最新原创"
        moreHref="/blog"
      />
      <LatestDaily posts={latestDailyPosts} />
      <Newsletter />
    </>
  )
}
