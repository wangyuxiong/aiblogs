import Link from 'next/link'

const learningSteps = [
  {
    title: 'Anthropic Bugcrawl 深度解析：用多智能体治理 AI 生成的代码洪水',
    description: '先通过一个真实工程案例，理解 Agent 如何分工、调用工具并处理复杂任务。',
    href: '/blog/2026-05-07-anthropic-bugcrawl-deep-dive',
    status: '已发布',
  },
  {
    title: '最小 Agent 实现',
    description: '从模型 API 开始，搭出能理解目标并完成一次行动的最小闭环。',
    status: '后续更新',
  },
  {
    title: '工具调用与记忆',
    description: '让 Agent 接入外部工具，并分清短期上下文与需要保留的信息。',
    status: '后续更新',
  },
  {
    title: '部署一个可用工具',
    description: '把本地 Demo 变成别人可以打开、操作并持续使用的小产品。',
    status: '后续更新',
  },
] as const

export function LearningPath() {
  return (
    <section id="learning-path" className="scroll-mt-24 bg-[#faf8f2] px-4 py-20 text-[#252a23] sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="mb-5 text-sm font-medium text-[#5c6d56]">从这里开始 · 一条会持续补全的实践路径</p>
          <h2 className="max-w-[15ch] text-3xl font-semibold leading-[1.2] tracking-[-0.025em] sm:text-4xl">
            AI Agent：从入门到做出第一个工具
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-[#5d645a]">
            不按术语堆课程，而是沿着真实问题一步步做出东西。已发布内容可以立即阅读，后续步骤只作为学习路线说明。
          </p>
        </div>

        <ol className="border-t border-[#344533]/25 lg:col-span-7">
          {learningSteps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#344533]/15 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-5 sm:py-7">
              <span className="pt-1 font-mono text-sm tabular-nums text-[#64715e]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                  {'href' in step ? (
                    <h3 className="max-w-2xl text-lg font-semibold leading-7 sm:text-xl">
                      <Link
                        href={step.href}
                        className="group inline-flex items-start gap-3 text-[#263729] transition-colors hover:text-[#526a4c]"
                      >
                        <span className="underline decoration-[#6d8063]/35 underline-offset-4 transition-colors group-hover:decoration-[#526a4c]">
                          {step.title}
                        </span>
                        <span aria-hidden="true" className="mt-1 shrink-0 text-base">↗</span>
                      </Link>
                    </h3>
                  ) : (
                    <h3 className="max-w-2xl text-lg font-semibold leading-7 text-[#394238] sm:text-xl">
                      {step.title}
                    </h3>
                  )}
                  <span className="shrink-0 pt-1 text-xs font-medium tracking-wide text-[#606d59]">
                    {step.status}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#62695f]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
