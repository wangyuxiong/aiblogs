'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  Feather,
  Brain,
  Download,
  Check,
  Quote,
  ChevronRight,
  BookOpen,
  Zap,
  Lock
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI 智能引导',
    description: '采用分步式对话引导，帮助用户从选题、构思到成稿，每个环节都有专业指导',
  },
  {
    icon: Brain,
    title: '双模型支持',
    description: '支持 Claude 和阿里云通义千问，根据需求选择最适合的 AI 模型',
  },
  {
    icon: Feather,
    title: '实时 Markdown 编辑',
    description: '所见即所得的 Markdown 编辑器，支持实时预览和快捷格式工具栏',
  },
  {
    icon: Lock,
    title: '本地数据存储',
    description: '基于 Tauri 的本地 SQLite 存储，作文数据完全保存在本地，保护隐私',
  },
  {
    icon: Zap,
    title: '轻量级应用',
    description: '基于 Rust + Web 技术构建，安装包小巧，启动快速，资源占用低',
  },
  {
    icon: BookOpen,
    title: '写作历史管理',
    description: '自动保存写作进度，随时查看和继续之前的作文，支持多作文并行创作',
  },
]

const examples = [
  {
    title: '我的梦想',
    grade: '小学四年级',
    excerpt: '每个人都有自己的梦想，有的想当科学家，有的想当医生，而我最想成为一名宇航员...',
    tags: ['记叙文', '想象'],
  },
  {
    title: '难忘的一件事',
    grade: '初中一年级',
    excerpt: '那是一个阳光明媚的下午，我站在领奖台上，看着台下热烈的掌声，心中百感交集...',
    tags: ['记叙文', '成长'],
  },
  {
    title: '科技改变生活',
    grade: '高中二年级',
    excerpt: '从蒸汽机到互联网，从智能手机到人工智能，科技的每一次进步都在深刻地改变着人类的生活方式...',
    tags: ['议论文', '科技'],
  },
]

const techStack = [
  { name: 'Tauri', desc: 'Rust 构建的桌面应用框架' },
  { name: 'React', desc: '用户界面组件库' },
  { name: 'TypeScript', desc: '类型安全的 JavaScript' },
  { name: 'Tailwind', desc: '原子化 CSS 框架' },
  { name: 'Zustand', desc: '轻量级状态管理' },
  { name: 'SQLite', desc: '本地数据库' },
]

export default function WritingCoachLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Back Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/portfolio"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回作品集</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">数字游民</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI 驱动的写作助手</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              文心启航
            </h1>
            <p className="text-xl sm:text-2xl text-blue-600 font-medium mb-6">
              「AI 写作导师，引导你完成作文创作」
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              一款专为中小学生设计的 AI 辅助写作工具。通过结构化的引导和智能反馈，
              让写作不再困难，激发创作灵感，培养写作思维。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                <Download className="w-5 h-5" />
                <span>下载试用</span>
              </button>
              <a
                href="https://github.com/wangyuxiong/writing-coach"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                <span>查看源码</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshot Preview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
          >
            {/* Browser Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 text-center">
                <div className="inline-block px-4 py-1 bg-white rounded text-xs text-gray-500">
                  writing-coach.app
                </div>
              </div>
            </div>
            {/* App Preview */}
            <div className="bg-slate-900 p-8 min-h-[400px] flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">文</div>
                    <span className="font-semibold text-gray-800">我的梦想</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>步骤 2/5</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div className="w-10 h-2 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">AI 导师：</span>
                      很好！接下来我们可以想想，为什么你想成为宇航员？可以从以下几个方面展开...
                    </p>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="text-gray-400 text-sm">在此输入你的想法...</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">功能亮点</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              融合 AI 技术与教育心理学，打造真正懂学生、会引导的写作助手
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Writing Examples */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">写作案例</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              通过文心启航辅助完成的优秀作文案例，展示 AI 引导下的创作成果
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">案例</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{example.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{example.grade}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {example.excerpt}
                </p>
                <div className="flex gap-2">
                  {example.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">技术栈</h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            采用现代化的技术架构，兼顾性能、安全性和开发效率
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-1">{tech.name}</h3>
                <p className="text-sm text-gray-400">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            开始你的写作之旅
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            下载文心启航，让 AI 成为你的写作导师，释放创作潜能
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              <Download className="w-5 h-5" />
              <span>免费下载</span>
            </button>
            <a
              href="mailto:contact@example.com"
              className="px-8 py-4 border border-blue-400 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              联系我们
            </a>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            支持 macOS、Windows 和 Linux 平台
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">文</div>
            <span className="font-semibold text-gray-900">文心启航</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 文心启航. 开源项目，欢迎贡献。
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">GitHub</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">文档</a>
            <Link href="/portfolio" className="text-sm text-gray-600 hover:text-gray-900">作品集</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
