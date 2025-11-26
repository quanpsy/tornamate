
import { Achievement, User, SportType } from './types';

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

export const calculateLevel = (xp: number): { level: number, progress: number, nextLevelXp: number } => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentLevelBase = LEVEL_THRESHOLDS[level - 1];
  const nextLevelBase = LEVEL_THRESHOLDS[level] || (LEVEL_THRESHOLDS[level - 1] + 1000);
  const progress = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelBase - currentLevelBase)) * 100));

  return { level, progress, nextLevelXp: nextLevelBase };
};

export const ACHIEVEMENTS_LIST: Partial<Achievement>[] = [
  { id: 'first_tournament', name: 'Rookie Host', description: 'Hosted your first tournament', icon: 'Flag', tier: 'BRONZE' },
  { id: 'century_maker', name: 'Century Maker', description: 'Scored 100 runs in a single innings', icon: 'Trophy', tier: 'GOLD' },
  { id: 'hat_trick', name: 'Hat-Trick Hero', description: 'Took 3 wickets in consecutive balls', icon: 'Zap', tier: 'DIAMOND' },
  { id: 'volunteer_champ', name: 'Helping Hand', description: 'Volunteered for 5+ matches', icon: 'Handshake', tier: 'SILVER' },
  { id: 'organizer_pro', name: 'Organizer Pro', description: 'Hosted 5+ tournaments', icon: 'Crown', tier: 'GOLD' },
  { id: 'mvp_star', name: 'MVP', description: 'Won Player of the Match award', icon: 'Star', tier: 'SILVER' }
];

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'BRONZE': return 'bg-amber-700 text-amber-100 border-amber-900';
    case 'SILVER': return 'bg-slate-300 text-slate-800 border-slate-400';
    case 'GOLD': return 'bg-yellow-400 text-yellow-900 border-yellow-600';
    case 'DIAMOND': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};
