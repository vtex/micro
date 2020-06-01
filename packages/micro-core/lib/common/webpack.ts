import { Stats } from 'webpack';

export const getStatsForTarget = (target: 'nodejs' | 'webnew' | 'webold', stats: Stats.ToJsonOutput) =>
  stats.children?.find(s => s.name === target);
