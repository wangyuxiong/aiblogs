'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Feather, Brain } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            作品集
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            探索我构建的数字产品，每一个项目都是技术实践与创意表达的融合
          </motion.p>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/portfolio/writing-coach">
              <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer">
                <div className="relative h-64 sm:h-80 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✍️</div>
                      <div className="text-white/90 text-lg font-medium">AI 写作导师</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    桌面应用
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        文心启航
                      </h2>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        基于 Tauri + React 构建的桌面端 AI 写作导师应用。通过分步引导，帮助用户完成从选题、构思到成稿的全流程作文创作。支持 Claude 和阿里云通义千问双模型。
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full font-medium">Tauri</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">React</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">TypeScript</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Tailwind</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Zustand</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>AI 智能引导</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Feather className="w-4 h-4 text-blue-500" />
                      <span>Markdown 编辑</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span>多模型支持</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
