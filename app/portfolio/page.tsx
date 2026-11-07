import Link from 'next/link'
import { projects } from '@/lib/projects'

export default function PortfolioPage() {
  return (
    <div className="bg-[#f4f1e8] text-[#252a23]">
      <header className="border-b border-[#354b38]/20 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#52634d]">
              Selected work · Real problems
            </p>
            <h1 className="text-[clamp(3rem,7vw,5.75rem)] font-semibold leading-none tracking-[-0.05em] text-[#20271f]">
              项目
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-[#535b50] lg:col-span-5 lg:pb-2">
            从真实问题出发，说明文心启航与 Mind Keeper 日报系统怎样实现、目前进展如何，以及哪些结果可以直接查看。
          </p>
        </div>
      </header>

      <section aria-label="项目列表" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {projects.map((project, index) => (
            <article
              key={project.slug}
              aria-labelledby={`project-${project.slug}`}
              className="grid gap-8 border border-[#354b38]/20 bg-[#faf8f2] p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10"
            >
              <div className="lg:col-span-4">
                <p className="font-mono text-xs uppercase leading-5 tracking-[0.14em] text-[#61705b]">
                  {String(index + 1).padStart(2, '0')} / {project.kind}
                </p>
                <h2
                  id={`project-${project.slug}`}
                  className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#263729] sm:text-4xl"
                >
                  {project.name}
                </h2>
                <div className="mt-7 border-l-2 border-[#6f8065] pl-4">
                  <h3 className="text-xs font-semibold tracking-wide text-[#52634d]">当前状态</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5a6256]">{project.status}</p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <dl className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-[#52634d]">要解决的问题</dt>
                    <dd className="mt-3 text-sm leading-7 text-[#515a4e]">{project.problem}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-[#52634d]">实现方式</dt>
                    <dd className="mt-3 text-sm leading-7 text-[#515a4e]">{project.implementation}</dd>
                  </div>
                </dl>

                <div className="mt-8 border-t border-[#354b38]/15 pt-6">
                  <h3 className="text-xs font-semibold tracking-wide text-[#52634d]">技术与流程</h3>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2" aria-label={`${project.name}技术与流程`}>
                    {project.stack.map((item) => (
                      <li key={item} className="font-mono text-xs leading-5 text-[#4e5d49]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-col items-start gap-3 border-t border-[#354b38]/15 pt-5 sm:flex-row sm:flex-wrap sm:gap-x-7">
                  {project.links.map((link) =>
                    link.external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 transition-colors hover:text-[#1f3522] hover:decoration-current"
                      >
                        {link.label}
                        <span aria-hidden="true">↗</span>
                        <span className="sr-only">（在新窗口打开）</span>
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 transition-colors hover:text-[#1f3522] hover:decoration-current"
                      >
                        {link.label}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
