#!/usr/bin/env node
/**
 * Generate sitemap.xml and RSS feed.xml from contentlayer output.
 * Run after `next build` to populate dist/ with SEO files.
 * Usage: node scripts/generate-seo.js
 */

const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://mind-keeper.com'
const DIST_DIR = path.resolve(__dirname, '../dist')
const CONTENTLAYER_DIR = path.resolve(__dirname, '../.contentlayer')

// Read contentlayer data
function loadPosts() {
  // 优先读取 contentlayer 的聚合索引：它是当前构建的权威列表。
  // （逐篇 JSON 可能残留已删除/移入 _drafts 的旧文章，不能直接扫描目录。）
  const indexPath = path.join(CONTENTLAYER_DIR, 'generated', 'Post', '_index.json')
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'))
      .filter(p => !p.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // 兼容旧版 contentlayer 输出
  const contentDir = path.join(CONTENTLAYER_DIR, 'generated', 'Post')
  if (!fs.existsSync(contentDir)) {
    console.warn('⚠️  .contentlayer not found. Run `next build` first.')
    return []
  }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))
  return files
    .map(f => JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf8')))
    .filter(p => !p.isDraft)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

function generateSitemap(posts) {
  // TODO: 如需新增页面，记得同步更新这里
  const staticPages = [
    { path: '/', priority: '1.0' },
    { path: '/daily', priority: '0.9' },
    { path: '/blog', priority: '0.8' },
    { path: '/about', priority: '0.6' },
    { path: '/portfolio', priority: '0.6' },
    { path: '/portfolio/writing-coach', priority: '0.5' },
  ]
  const urls = [
    ...staticPages.map(p => ({
      loc: `${SITE_URL}${p.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      priority: p.priority,
    })),
    ...posts.map(p => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: new Date(p.date).toISOString().split('T')[0],
      priority: p.category === 'ai-daily' ? '0.8' : '0.7',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml)
  console.log(`✅ sitemap.xml generated with ${urls.length} URLs`)
}

function generateRSS(posts) {
  const now = new Date().toUTCString()
  const items = posts.map(p => {
    const pubDate = new Date(p.date).toUTCString()
    const link = `${SITE_URL}/blog/${p.slug}`
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      ${p.tags ? p.tags.map(t => `<category>${escapeXml(t)}</category>`).join('\n      ') : ''}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mind Keeper</title>
    <link>${SITE_URL}</link>
    <description>AI 编程、多智能体架构、开发者工具深度解析</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Mind Keeper SEO Generator</generator>
${items}
  </channel>
</rss>`

  fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), xml)
  console.log(`✅ feed.xml generated with ${posts.length} articles`)
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Main
try {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true })
  }
  const posts = loadPosts()
  generateSitemap(posts)
  generateRSS(posts)
  console.log('✅ SEO generation complete!')
} catch (err) {
  console.error('❌ SEO generation failed:', err.message)
  process.exit(1)
}
