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
    <section className="bg-[#faf8f2] px-4 py-20 text-[#252a23] sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-serif text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>
            订阅 Mind Keeper
          </h2>
          <p className="mb-8 leading-7 text-[#5d645a]">
            通过 RSS 获取原创教程、项目笔记和日报更新。无需邮箱注册，把新内容装进你的阅读器。
          </p>

          <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-[#354b38]/20 bg-[#f4f1e8] px-5 py-3 text-sm text-[#535b50]">
              <Rss className="h-4 w-4 shrink-0 text-[#52634d]" aria-hidden="true" />
              <span className="truncate">mind-keeper.com/feed.xml</span>
            </div>
            <button
              type="button"
              onClick={copyRssUrl}
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#354b38] px-6 py-3 font-medium text-[#fffdf7] transition-colors hover:bg-[#243724] active:translate-y-px"
            >
              <span aria-live="polite" className="inline-flex items-center">
                {status === 'copied' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                    已复制
                  </>
                ) : status === 'failed' ? (
                  <>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    复制失败，请手动复制
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    复制链接
                  </>
                )}
              </span>
            </button>
          </div>

          <a
            href={RSS_URL}
            className="mt-6 inline-flex min-h-11 items-center gap-1 text-sm text-[#52634d] underline decoration-[#5d7059]/35 underline-offset-4 transition-colors hover:text-[#243724] hover:decoration-current"
          >
            直接打开 RSS 文件
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
