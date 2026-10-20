import { Metadata } from 'next'
import { Github, Rss, Code, Palette, Globe, Bot } from 'lucide-react'

export const metadata: Metadata = {
  title: '关于我',
  description: 'Mind Keeper 的主理人：一名全栈开发者与 AI 重度学习者',
  alternates: {
    canonical: '/about',
  },
}

const skills = [
  { name: 'React / Next.js', level: 95, category: 'technical' },
  { name: 'TypeScript', level: 90, category: 'technical' },
  { name: 'Node.js', level: 85, category: 'technical' },
  { name: 'AI 工作流 / Agent', level: 85, category: 'technical' },
  { name: '内容创作', level: 80, category: 'creative' },
  { name: 'SEO / 营销', level: 75, category: 'creative' },
]

const gear = {
  hardware: [
    { name: 'MacBook Pro 16" M3 Max', description: '主力开发机器，跑本地模型也够用' },
    { name: 'AirPods Pro 2', description: '降噪神器，专注工作必备' },
  ],
  software: [
    { name: 'Obsidian', description: '知识管理和写作，本站文章的起点' },
    { name: 'VS Code / Claude Code', description: '代码编辑与 AI 结对编程' },
    { name: 'RSS 阅读器', description: '日刊的信息源都从这里聚合' },
    { name: 'Figma', description: 'UI 设计' },
  ],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Photo */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex flex-col items-center justify-center gap-3">
                <Bot className="w-16 h-16 text-blue-500" />
                <span className="text-gray-500 text-sm">Mind Keeper</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="pb-20">
            {/* Header */}
            <h1
              className="text-3xl sm:text-4xl font-serif font-bold mb-6"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              你好，我是 Mind Keeper 的主理人
            </h1>

            {/* Bio */}
            <div className="prose prose-lg text-gray-700 mb-12">
              <p>
                我是一名全栈开发者，也是 AI 重度学习者。每天打开 RSS
                阅读器跟踪几十个信息源，是我这几年坚持最久的习惯。
              </p>
              <p>
                AI 领域的信息洪流太大、太碎：模型发布、Agent 工具、开源项目、
                研究论文、行业八卦……大部分信息其实并不值得你花时间。
              </p>
              <p>
                于是有了 Mind Keeper 这个 AI 学习日刊：每天把值得关注的动态
                筛选、分类、浓缩成一篇文章，帮你（也帮我自己）用最短的时间
                跟上行业的脚步。这里也会不定期分享一些 AI 编程实践与深度解析。
              </p>
            </div>

            {/* Skills */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Code className="w-5 h-5" />
                技能栈
              </h2>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span className="text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gear */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                工具清单
              </h2>

              {/* Hardware */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  硬件
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gear.hardware.map((item) => (
                    <div key={item.name} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Software */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  软件
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gear.software.map((item) => (
                    <div key={item.name} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                联系方式
              </h2>
              <div className="flex gap-4">
                <a
                  href="https://github.com/wangyuxiong"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="/feed.xml"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="RSS 订阅"
                >
                  <Rss className="w-5 h-5" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
