export type Category = 'travel-guide' | 'remote-work' | 'income-report' | 'gear' | 'photography'

export interface Post {
  slug: string
  title: string
  excerpt: string
  date: Date
  category: Category
  tags: string[]
  location?: string
  coverImage?: string
  isDraft: boolean
  isFeatured: boolean
  readingTime: number
  url: string
  body: {
    raw: string
    code: string
  }
}

export interface TocItem {
  id: string
  text: string
  level: number
}
