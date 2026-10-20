'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostCard } from '@/components/content/post-card'
import { getCategoryLabel } from '@/lib/categories'

export type PostListItem = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  location?: string
  coverImage?: string
  readingTime: number
}

interface BlogListingProps {
  posts: PostListItem[]
}

export function BlogListing({ posts }: BlogListingProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  // 从实际文章动态生成分类标签（含计数），避免硬编码过期分类
  const categoryCounts = new Map<string, number>()
  posts.forEach((post) => {
    categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1)
  })
  const categories = [
    { id: 'all', label: '全部', count: posts.length },
    ...Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: getCategoryLabel(id), count })),
  ]

  const visiblePosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((post) => post.category === activeCategory)

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
              <span
                className={`ml-1.5 text-xs ${isActive ? 'text-gray-300' : 'text-gray-400'}`}
              >
                {category.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Posts Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {visiblePosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">该分类下暂无文章</p>
        </div>
      )}
    </>
  )
}
