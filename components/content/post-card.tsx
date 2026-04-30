'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

interface PostCardProps {
  post: Post
  variant?: 'large' | 'small'
}

const categoryLabels: Record<string, string> = {
  'travel-guide': '旅居指南',
  'remote-work': '远程工作',
  'income-report': '收入报告',
  'gear': '装备清单',
  'photography': '摄影',
}

export function PostCard({ post, variant = 'small' }: PostCardProps) {
  const isLarge = variant === 'large'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${isLarge ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
          {post.location && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              {post.location.split('，')[0]}
            </div>
          )}
        </div>

        <div className={`${isLarge ? 'mt-5' : 'mt-4'}`}>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="text-blue-600 font-medium">{categoryLabels[post.category] || post.category}</span>
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime}分钟
            </span>
          </div>

          <h3
            className={`font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 ${
              isLarge ? 'text-xl sm:text-2xl' : 'text-base'
            }`}
          >
            {post.title}
          </h3>

          {isLarge && <p className="mt-2 text-gray-600 line-clamp-2 text-sm sm:text-base">{post.excerpt}</p>}
        </div>
      </Link>
    </motion.article>
  )
}
