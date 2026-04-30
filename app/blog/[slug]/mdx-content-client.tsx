'use client'

import { useMDXComponent } from 'next-contentlayer/hooks'

interface MDXContentClientProps {
  code: string
  components: Record<string, React.ComponentType<any>>
}

export function MDXContentClient({ code, components }: MDXContentClientProps) {
  const Component = useMDXComponent(code)
  return <Component components={components} />
}
