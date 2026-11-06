'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/blog', label: '文章' },
  { href: '/portfolio', label: '项目' },
  { href: '/daily', label: '日报' },
  { href: '/about', label: '关于' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 text-gray-900 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100'
          : 'bg-white/70 backdrop-blur-md'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Mind Keeper
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="主导航" className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'text-sm transition-colors',
                    isActive
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Keep the closed menu hidden and unfocusable while retaining exit transitions. */}
      <motion.nav
        id="mobile-navigation"
        aria-label="移动端导航"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
        }}
        transition={{ duration: 0.2 }}
        className="md:hidden overflow-hidden bg-white border-b border-gray-100"
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'block rounded-md px-3 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-gray-50 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </motion.nav>
    </header>
  )
}
