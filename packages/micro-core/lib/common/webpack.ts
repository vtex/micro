export const getStatsForTarget = (
  target: 'nodejs' | 'webnew' | 'webold',
  stats: any // TODO: fix this as any
) => stats.children?.find((s: any) => s.name === target)
