'use client'

import { useState } from 'react'
import { ArrowRight, Copy, Check, Rss } from 'lucide-react'
import { motion } from 'framer-motion'

const RSS_URL = '/feed.xml'

export function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const copyRssUrl = async () => {
    const absoluteUrl = `${window.location.origin}${RSS_URL}`
    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
    setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            订阅 AI 学习日刊
          </h2>
          <p className="text-gray-600 mb-8">
            通过 RSS 获取每日更新，无需邮箱注册，把日刊装进你的阅读器
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-600 overflow-hidden">
              <Rss className="w-4 h-4 shrink-0 text-orange-500" />
              <span className="truncate">mind-keeper.com/feed.xml</span>
            </div>
            <button
              onClick={copyRssUrl}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              {status === 'copied' ? (
                <>
                  <Check className="mr-2 w-4 h-4" />
                  已复制
                </>
              ) : status === 'failed' ? (
                <>
                  <Copy className="mr-2 w-4 h-4" />
                  复制失败，请手动复制
                </>
              ) : (
                <>
                  <Copy className="mr-2 w-4 h-4" />
                  复制链接
                </>
              )}
            </button>
          </div>

          <a
            href={RSS_URL}
            className="inline-flex items-center gap-1 mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            直接打开 RSS 文件
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
