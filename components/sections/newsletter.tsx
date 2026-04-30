'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 3000)
    }
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
            订阅我的数字游民周报
          </h2>
          <p className="text-gray-600 mb-8">
            每周精选内容，分享旅居攻略、远程工作技巧和生活方式灵感
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入你的邮箱"
              className="flex-1 px-5 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              {status === 'success' ? '订阅成功！' : '订阅'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
