import type { Metadata } from 'next'
import Link from 'next/link'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: '文心启航',
  description: '文心启航项目案例：面向中小学生的桌面端 AI 写作教练，以及分步引导、双模型接入与本地数据存储的实现。',
  alternates: {
    canonical: '/portfolio/writing-coach',
  },
}

const writingSteps = [
  {
    title: '选题',
    description: '从写作要求出发明确题目与方向，把空白页变成第一个可回答的问题。',
  },
  {
    title: '构思',
    description: '通过分步引导整理思路与文章结构，再逐步补充具体内容。',
  },
  {
    title: '成稿',
    description: '在写作界面中组织并修改草稿，让 AI 的引导服务于写作者自己的表达。',
  },
  {
    title: '保存与继续',
    description: '将作文与写作进度保存在本地，之后可以回到未完成的内容。',
  },
]

const architecture = [
  {
    title: '桌面应用层',
    description: 'Tauri 提供桌面应用能力，React 负责写作流程与交互界面。',
  },
  {
    title: '模型接入层',
    description: '接入 Claude 与通义千问（Qwen），在写作流程中使用所选择的模型。',
  },
  {
    title: '本地数据层',
    description: 'SQLite 保存作文与写作进度，由桌面应用在本地读取和管理。',
  },
]

const features = [
  '从选题、构思到成稿的分步写作引导',
  'Claude 与通义千问（Qwen）双模型接入',
  '基于本地 SQLite 的作文与进度存储',
  '由 Tauri 与 React 构成的桌面端应用',
]

export default function WritingCoachCasePage() {
  const writingCoach = projects.find((project) => project.slug === 'writing-coach')

  if (!writingCoach) {
    throw new Error('Missing writing-coach project data')
  }

  return (
    <div className="bg-[#f4f1e8] px-4 pb-20 pt-24 text-[#252a23] sm:px-6 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="案例导航" className="py-5">
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#42543e] underline decoration-[#5d7059]/35 underline-offset-4 transition-colors hover:text-[#243724] hover:decoration-current"
          >
            <span aria-hidden="true">←</span>
            返回作品集
          </Link>
        </nav>

        <article>
          <header className="grid gap-10 border-b border-[#354b38]/25 py-12 sm:py-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#52634d]">
                Project case · Desktop AI writing coach
              </p>
              <h1 className="mt-6 text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-none tracking-[-0.05em] text-[#20271f]">
                文心启航
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#535b50]">
                一款面向中小学生的桌面端 AI 写作教练，把选题、构思与成稿拆成可以逐步完成的写作过程。
              </p>
            </div>
            <aside className="border-l-2 border-[#6f8065] pl-5 lg:col-span-4 lg:mb-2" aria-label="项目状态">
              <h2 className="text-xs font-semibold tracking-wide text-[#52634d]">当前状态</h2>
              <p className="mt-3 text-sm leading-7 text-[#515a4e]">{writingCoach.status}</p>
            </aside>
          </header>

          <section aria-labelledby="writing-coach-problem" className="grid gap-6 border-b border-[#354b38]/15 py-12 sm:py-16 lg:grid-cols-12">
            <h2 id="writing-coach-problem" className="text-2xl font-semibold tracking-[-0.02em] text-[#263729] lg:col-span-4">
              问题与使用者
            </h2>
            <div className="space-y-5 text-base leading-8 text-[#515a4e] lg:col-span-8">
              <p>{writingCoach.problem}</p>
              <p>
                目标使用者是中小学生。产品重点不是替学生生成一篇范文，而是把写作任务拆小，用引导帮助他们形成自己的思路与表达。
              </p>
            </div>
          </section>

          <section aria-labelledby="writing-coach-workflow" className="border-b border-[#354b38]/15 py-12 sm:py-16">
            <div className="grid gap-4 lg:grid-cols-12">
              <h2 id="writing-coach-workflow" className="text-2xl font-semibold tracking-[-0.02em] text-[#263729] lg:col-span-4">
                引导式写作流程
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-[#5d645a] lg:col-span-8">
                作文与进度保存在本地，写作者可以围绕同一份内容持续推进，也能回到之前的思路继续修改。
              </p>
            </div>
            <ol className="mt-9 grid gap-px overflow-hidden border border-[#354b38]/20 bg-[#354b38]/20 sm:grid-cols-2 lg:grid-cols-4">
              {writingSteps.map((step, index) => (
                <li key={step.title} className="bg-[#faf8f2] p-6">
                  <span className="font-mono text-xs tabular-nums text-[#61705b]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[#2d4130]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5a6256]">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="writing-coach-architecture" className="grid gap-8 border-b border-[#354b38]/15 py-12 sm:py-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="writing-coach-architecture" className="text-2xl font-semibold tracking-[-0.02em] text-[#263729]">
                架构与本地数据
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#5d645a]">
                本地数据库负责作文与进度存储；模型能力来自 Claude 或通义千问，实际请求仍取决于所选模型服务与网络配置。
              </p>
            </div>
            <dl className="space-y-6 lg:col-span-8">
              {architecture.map((layer) => (
                <div key={layer.title} className="grid gap-2 border-t border-[#354b38]/20 pt-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-[#354b38]">{layer.title}</dt>
                  <dd className="text-sm leading-7 text-[#515a4e]">{layer.description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="writing-coach-features" className="grid gap-8 py-12 sm:py-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="writing-coach-features" className="text-2xl font-semibold tracking-[-0.02em] text-[#263729]">
                已实现的核心功能
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#5d645a]">
                这里只列出当前项目能够确认的功能，不用用户数、写作效果或公开发布量补充说明。
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3 border border-[#354b38]/20 bg-[#faf8f2] p-5 text-sm leading-7 text-[#424d3f]">
                  <span aria-hidden="true" className="font-mono text-[#61705b]">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  )
}
