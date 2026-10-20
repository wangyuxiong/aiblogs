export const categoryLabels: Record<string, string> = {
  'ai-daily': 'AI 日刊',
  'ai-news': 'AI 资讯',
  'ai-tutorial': 'AI 教程',
  'open-source': '开源项目',
  'remote-work': '远程工作',
  'travel-guide': '旅居指南',
  'income-report': '收入报告',
  'gear': '装备清单',
  'photography': '摄影',
}

export function getCategoryLabel(category?: string): string {
  if (!category) return ''
  return categoryLabels[category] || category
}
