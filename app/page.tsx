import { Hero } from '@/components/sections/hero'
import { Newsletter } from '@/components/sections/newsletter'
import { allPosts } from 'contentlayer/generated'
import { FeaturedPosts } from '@/components/sections/featured-posts'

export default function Home() {
  const featuredPosts = allPosts
    .filter((post) => post.isFeatured && !post.isDraft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <>
      <Hero />
      <FeaturedPosts posts={featuredPosts} />
      <Newsletter />
    </>
  )
}
