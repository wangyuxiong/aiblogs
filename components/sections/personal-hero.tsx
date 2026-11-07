import Link from 'next/link'

const currentWork = [
  {
    title: 'AI Agent 学习路径',
    description: '从原理拆解到第一个可用工具，持续补上可跟着做的教程。',
  },
  {
    title: '文心启航写作教练',
    description: '打磨桌面端分步写作流程，以及本地数据与双模型协作。',
  },
  {
    title: '日报自动化',
    description: '维护从 AIHOT 内容整理到静态发布的工作流。',
  },
]

export function PersonalHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f4f1e8] text-[#20271f]">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[8%] hidden w-px bg-[#5d7059]/15 lg:block"
      />
      <div className="mx-auto grid min-h-[85svh] max-w-7xl scroll-mt-24 grid-cols-1 items-center gap-12 px-4 pb-16 pt-24 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-20 lg:pt-24">
        <div className="lg:col-span-8 lg:pr-8">
          <p className="mb-7 max-w-full break-words font-mono text-[0.7rem] font-medium uppercase leading-5 tracking-[0.16em] text-[#52634d] sm:text-xs sm:tracking-[0.2em]">
            MIND KEEPER · AI PRODUCT &amp; ENGINEERING
          </p>
          <h1 className="max-w-[12em] text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#20271f]">
            <span className="block">把复杂 AI 讲明白，</span>
            <span className="block">也把想法做成工具。</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#535b50] sm:text-lg sm:leading-8">
            我是 Mind Keeper，一名 AI 产品与工程实践者。这里写下能跟着做的原创教程，也记录真实项目里的取舍、实现与复盘。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="#learning-path"
              className="inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap bg-[#354b38] px-7 py-3 text-sm font-semibold text-[#fffdf7] transition-colors duration-200 hover:bg-[#243724] active:translate-y-px sm:w-auto"
            >
              开始学习
              <span aria-hidden="true" className="ml-3">↘</span>
            </Link>
            <Link
              href="#projects"
              className="inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap border border-[#354b38]/60 px-7 py-3 text-sm font-semibold text-[#2d4130] transition-colors duration-200 hover:border-[#354b38] hover:bg-[#e8ecdf] active:translate-y-px sm:w-auto"
            >
              查看代表作品
              <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </div>
        </div>

        <aside className="border-t border-[#354b38]/30 pt-7 lg:col-span-4 lg:ml-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 xl:ml-8 xl:pl-10">
          <h2 className="text-sm font-semibold tracking-wide text-[#2d4130]">
            当前在做的三件事
          </h2>
          <ol className="mt-6 space-y-6">
            {currentWork.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-mono text-xs tabular-nums leading-6 text-[#606d59]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-base font-semibold leading-6 text-[#293329]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#5a6256]">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  )
}
