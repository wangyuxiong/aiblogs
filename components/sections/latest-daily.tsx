import Link from 'next/link'
import type { PostListItem } from '@/components/content/blog-listing'

interface LatestDailyProps {
  posts: PostListItem[]
}

export function LatestDaily({ posts }: LatestDailyProps) {
  if (posts.length === 0) return null

  return (
    <section id="latest-daily" className="scroll-mt-24 bg-[#f4f1e8] px-4 py-20 text-[#252a23] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="text-sm font-semibold text-[#52634d]">自动整理</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">最新 AI 日报</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#5d645a]">
            内容来源于 AIHOT，经自动整理后发布，用来补充信息视野，不替代原创教程与项目复盘。
          </p>
          <Link
            href="/daily"
            className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#354b38] underline decoration-[#5d7059]/40 underline-offset-4 hover:decoration-current"
          >
            查看全部日报
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ol className="border-t border-[#354b38]/25 lg:col-span-8">
          {posts.slice(0, 3).map((post) => (
            <li key={post.slug} className="border-b border-[#354b38]/15 py-6 first:pt-0 sm:py-7 lg:first:pt-0">
              <article className="grid grid-cols-1 gap-3 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                <time dateTime={post.date} className="pt-1 font-mono text-xs tabular-nums leading-6 text-[#606d59]">
                  {post.date.slice(0, 10)}
                </time>
                <div>
                  <h3 className="text-lg font-semibold leading-7">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[#293b2c] underline decoration-[#6d8063]/30 underline-offset-4 transition-colors hover:text-[#526a4c] hover:decoration-[#526a4c]"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[#62695f]">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
