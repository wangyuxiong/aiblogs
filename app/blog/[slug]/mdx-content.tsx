'use client'

import dynamic from 'next/dynamic'
import { mdxComponents } from '@/components/content/mdx-components'

interface MDXContentProps {
  code: string
}

// Dynamically import the hook to avoid SSR issues
const MDXContent = dynamic(
  () => import('./mdx-content-client').then((mod) => mod.MDXContentClient),
  { ssr: false }
)

export function MDXContentWrapper({ code }: MDXContentProps) {
  return <MDXContent code={code} components={mdxComponents} />
}
