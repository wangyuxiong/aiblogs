import Link from 'next/link'
import { projects } from '@/lib/projects'

export function FeaturedProjects() {
  return (
    <section id="projects" className="scroll-mt-24 bg-[#f4f1e8] px-4 py-20 text-[#252a23] sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-medium text-[#5c6d56]">代表作品 · 从真实问题出发</p>
          <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
            做出来的工具，和背后的取舍
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5d645a]">
            不展示虚构的增长数字，只说明解决了什么问题、怎样实现，以及今天可以验证的结果。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {projects.map((project, index) => (
            <article
              key={project.slug}
              className={`border border-[#354b38]/20 bg-[#faf8f2] p-6 sm:p-8 lg:p-10 ${
                index === 0
                  ? 'lg:col-span-7'
                  : 'lg:col-span-5 lg:col-start-8 lg:mt-20'
              }`}
            >
              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#61705b]">
                  {String(index + 1).padStart(2, '0')} / {project.kind}
                </p>
                <p className="max-w-xl text-xs leading-5 text-[#606d59]">{project.status}</p>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-[#263729] sm:text-3xl">
                {project.name}
              </h3>

              <dl className="mt-7 space-y-6">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[#52634d]">要解决的问题</dt>
                  <dd className="mt-2 text-sm leading-7 text-[#515a4e]">{project.problem}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[#52634d]">实现方式</dt>
                  <dd className="mt-2 text-sm leading-7 text-[#515a4e]">{project.implementation}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[#52634d]">技术与流程</dt>
                  <dd className="mt-3">
                    <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label={`${project.name}技术与流程`}>
                      {project.stack.map((item) => (
                        <li key={item} className="font-mono text-xs leading-5 text-[#4e5d49]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col items-start gap-4 border-t border-[#354b38]/15 pt-6">
                {project.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 transition-colors hover:text-[#1f3522] hover:decoration-current"
                    >
                      {link.label}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only">（在新窗口打开）</span>
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 transition-colors hover:text-[#1f3522] hover:decoration-current"
                    >
                      {link.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
