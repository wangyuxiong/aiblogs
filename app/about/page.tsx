import { Metadata } from 'next'
import { Github, Twitter, Linkedin, Mail, Code, Palette, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: '关于我 | 数字游民生活志',
  description: '一个选择用代码探索世界的开发者',
}

const skills = [
  { name: 'React / Next.js', level: 95, category: 'technical' },
  { name: 'TypeScript', level: 90, category: 'technical' },
  { name: 'Node.js', level: 85, category: 'technical' },
  { name: '内容创作', level: 80, category: 'creative' },
  { name: 'SEO / 营销', level: 75, category: 'creative' },
  { name: '英语', level: 90, category: 'language' },
]

const gear = {
  hardware: [
    { name: 'MacBook Pro 16" M3 Max', description: '主力开发机器，性能强劲' },
    { name: 'Sony A7C', description: '轻便全画幅，旅行摄影首选' },
    { name: 'AirPods Pro 2', description: '降噪神器，专注工作必备' },
    { name: 'Peak Design 背包', description: '30L，完美装下所有装备' },
  ],
  software: [
    { name: 'Obsidian', description: '知识管理和写作' },
    { name: 'VS Code', description: '代码编辑器' },
    { name: 'Figma', description: 'UI 设计' },
    { name: 'Notion', description: '项目管理和协作' },
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
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-gray-500">照片占位符</span>
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
              你好，我是数字游民
            </h1>

            {/* Bio */}
            <div className="prose prose-lg text-gray-700 mb-12">
              <p>
                三年前，我还是一名普通的上班族。每天挤地铁、打卡、坐在固定的工位上。
                那时的我从未想过，有一天我可以在世界的各个角落写代码。
              </p>
              <p>
                现在，我是一名远程工作的全栈开发者，也是这个数字游民博客的作者。
                我相信代码可以构建生活，而生活也可以滋养代码。
              </p>
              <p>
                通过这个博客，我希望记录真实的旅居数据与心路历程，
                分享远程工作的专业技能与全球生活方式。
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
                装备清单
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
                  href="#"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="mailto:hello@example.com"
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
