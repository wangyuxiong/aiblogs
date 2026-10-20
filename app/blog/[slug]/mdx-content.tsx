import * as _jsx_runtime from 'react/jsx-runtime'

interface MDXContentProps {
  code: string
  components: Record<string, React.ComponentType<any>>
}

/**
 * 在服务端把 contentlayer 编译好的 MDX 代码求值为 React 组件，
 * 使正文直接进入静态 HTML（SEO 友好）。
 * 编译产物只依赖 `_jsx_runtime` 全局名（与 next-contentlayer 的
 * getMDXComponent 一致，但不经过任何客户端 hook）。
 */
const evaluateMDX = (code: string) => {
  const fn = new Function('_jsx_runtime', code)
  return (fn as (runtime: typeof _jsx_runtime) => { default: React.ComponentType<any> })(_jsx_runtime).default
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Content = evaluateMDX(code)
  return <Content components={components} />
}
