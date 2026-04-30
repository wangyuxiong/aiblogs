'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/hero-bg.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <MapPin className="w-3 h-3" />
          <span className="text-xs font-medium">当前坐标：杭州，中国</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          代码与咖啡，
          <br />
          在世界的角落构建生活
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          记录真实的旅居数据与心路历程，分享远程工作的专业技能与全球生活方式
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/about"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors"
          >
            阅读我的故事
          </Link>
          <Link
            href="#map"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
          >
            查看旅居地图
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
