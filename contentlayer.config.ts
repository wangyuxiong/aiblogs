import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypeSlug from 'rehype-slug'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    date: { type: 'date', required: true },
    category: {
      type: 'enum',
      options: ['travel-guide', 'remote-work', 'income-report', 'gear', 'photography', 'ai-news', 'ai-tutorial', 'ai-daily', 'open-source'],
      required: true,
    },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    location: { type: 'string' },
    coverImage: { type: 'string' },
    isDraft: { type: 'boolean', default: false },
    isFeatured: { type: 'boolean', default: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.sourceFileName.replace(/\.mdx$/, ''),
    },
    readingTime: {
      type: 'number',
      resolve: (post) => {
        const raw = post.body.raw
        // 中文按字数（约 400 字/分钟），英文按词数（约 200 词/分钟）
        const cjkCount = (raw.match(/[\u4e00-\u9fff]/g) ?? []).length
        const wordCount = raw.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w)).length
        return Math.max(1, Math.ceil(cjkCount / 400 + wordCount / 200))
      },
    },
    url: {
      type: 'string',
      resolve: (post) => `/blog/${post._raw.sourceFileName.replace(/\.mdx$/, '')}`,
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    rehypePlugins: [rehypeSlug],
  },
})
