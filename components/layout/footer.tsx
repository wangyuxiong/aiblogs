export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} 数字游民生活志. All rights reserved.
        </p>
        <p className="text-sm text-gray-400">
          Built with Next.js & Tailwind CSS
        </p>
      </div>
    </footer>
  )
}
