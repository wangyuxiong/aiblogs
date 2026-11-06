export type PostLike = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  location?: string
  coverImage?: string
  readingTime: number
  isDraft?: boolean
}

export function sortByDateDesc<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export function getOriginalPosts<T extends PostLike>(posts: T[]): T[] {
  return sortByDateDesc(
    posts.filter((post) => !post.isDraft && post.category !== 'ai-daily'),
  )
}

export function getDailyPosts<T extends PostLike>(posts: T[]): T[] {
  return sortByDateDesc(
    posts.filter((post) => !post.isDraft && post.category === 'ai-daily'),
  )
}

export function toPostListItem(post: PostLike) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    location: post.location,
    coverImage: post.coverImage,
    readingTime: post.readingTime,
  }
}
