export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Mind Keeper · AI 学习日刊
        </p>
        <div className="flex items-center gap-4">
          <a
            href="/feed.xml"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            RSS
          </a>
          <a
            href="https://github.com/wangyuxiong"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <p className="text-sm text-gray-400">Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
