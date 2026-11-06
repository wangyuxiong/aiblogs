import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: '关于我',
  description: 'Mind Keeper：全栈开发者与 AI 产品与工程实践者，记录写作教练、日报自动化与原创教程。',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    url: '/about',
  },
}

const currentWork = [
  {
    title: '文心启航写作教练',
    description: '探索面向中小学生的分步写作流程，用 Tauri、React、双模型接入与本地 SQLite 构成桌面应用。',
  },
  {
    title: 'Mind Keeper 日报系统',
    description: '维护从 AIHOT 内容整理、MDX 生成到 GitHub Actions 构建发布的自动化流程。',
  },
  {
    title: '原创教程与项目笔记',
    description: '把 AI 产品与工程实践中的方法和取舍整理成可阅读、可继续验证的内容。',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-[#f4f1e8] text-[#252a23]">
      <header className="px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#52634d]">
              About Mind Keeper
            </p>
            <h1 className="max-w-[12em] text-[clamp(2.6rem,5vw,4.75rem)] font-semibold leading-[1.12] tracking-[-0.045em] text-[#20271f]">
              全栈开发者，AI 产品与工程实践者。
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#535b50] sm:text-lg">
              我是 Mind Keeper 的主理人，关注 AI 产品怎样从想法走到工程实现，也把这个过程写进工具、教程与项目复盘。
            </p>
          </div>

          <div
            role="img"
            aria-label="Mind Keeper 的 MK 字标"
            className="relative flex min-h-72 flex-col justify-between overflow-hidden border border-[#354b38]/30 bg-[#e8ecdf] p-7 sm:min-h-80 sm:p-9 lg:col-span-5"
          >
            <div aria-hidden="true" className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between gap-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[#52634d] sm:text-xs">
                <span>Mind Keeper</span>
                <span>Full-stack / AI</span>
              </div>
              <p
                className="my-8 text-center font-serif text-[clamp(6rem,16vw,10rem)] leading-none tracking-[-0.09em] text-[#354b38]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                MK
              </p>
              <div className="flex items-end justify-between gap-4 border-t border-[#354b38]/25 pt-5 font-mono text-[0.65rem] uppercase leading-5 tracking-[0.12em] text-[#52634d] sm:text-xs">
                <span>AI product<br />&amp; engineering</span>
                <span className="text-right">Writing<br />&amp; automation</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="about-work" className="border-t border-[#354b38]/20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[#61705b]">01 / Practice</p>
            <h2 id="about-work" className="text-3xl font-semibold tracking-[-0.025em] text-[#263729]">
              正在做的事
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#5d645a]">
              工作围绕 AI 产品与工程实践展开：既实现功能，也整理背后的流程、限制与选择。
            </p>
          </div>
          <ol className="lg:col-span-8">
            {currentWork.map((item, index) => (
              <li key={item.title} className="grid gap-3 border-t border-[#354b38]/20 py-6 first:pt-0 sm:grid-cols-[2.5rem_1fr] sm:gap-4 sm:first:pt-0">
                <span className="font-mono text-xs tabular-nums leading-7 text-[#61705b]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#2d4130]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5a6256]">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="about-site" className="bg-[#faf8f2] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[#61705b]">02 / This site</p>
            <h2 id="about-site" className="text-3xl font-semibold tracking-[-0.025em] text-[#263729]">
              这里提供什么
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            <div className="border-t border-[#354b38]/25 pt-5">
              <h3 className="text-lg font-semibold text-[#2d4130]">原创教程与真实项目</h3>
              <p className="mt-3 text-sm leading-7 text-[#5a6256]">
                原创文章记录 AI 技术与工程实践；项目页说明文心启航和日报系统的问题、实现与当前状态。
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/blog" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 hover:decoration-current">
                  阅读原创文章 →
                </Link>
                <Link href="/portfolio" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 hover:decoration-current">
                  查看项目 →
                </Link>
              </div>
            </div>
            <div className="border-t border-[#354b38]/25 pt-5">
              <h3 className="text-lg font-semibold text-[#2d4130]">自动整理的 AI 日报</h3>
              <p className="mt-3 text-sm leading-7 text-[#5a6256]">
                日报由自动化流程汇总内容并发布，调度可能延迟，以页面实际日期为准。原创教程与项目笔记则随实践持续整理。
              </p>
              <Link href="/daily" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 hover:decoration-current">
                查看日报 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-follow" className="border-t border-[#354b38]/20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[#61705b]">03 / Follow the work</p>
            <h2 id="about-follow" className="text-3xl font-semibold tracking-[-0.025em] text-[#263729]">
              继续阅读与验证
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5d645a]">
              可以从项目与原创文章了解具体实践，也可以在 GitHub 查看公开代码。用 RSS 阅读器订阅站点即可获取后续更新，无需邮箱注册。
            </p>
          </div>
          <nav aria-label="相关链接" className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap lg:col-span-5 lg:justify-end">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center border border-[#354b38]/60 px-5 py-3 text-sm font-semibold text-[#2d4130] transition-colors hover:border-[#354b38] hover:bg-[#e8ecdf]"
            >
              GitHub
              <span aria-hidden="true" className="ml-2">↗</span>
              <span className="sr-only">（在新窗口打开）</span>
            </a>
            <a
              href={site.rss}
              className="inline-flex min-h-12 items-center justify-center bg-[#354b38] px-5 py-3 text-sm font-semibold text-[#fffdf7] transition-colors hover:bg-[#243724]"
            >
              RSS 订阅
              <span aria-hidden="true" className="ml-2">→</span>
            </a>
          </nav>
        </div>
      </section>
    </div>
  )
}
