// Number formatting utilities for idle game

export function formatNumber(n: number): string {
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1_000_000) return (n / 1000).toFixed(1) + 'K';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  return (n / 1_000_000_000_000).toFixed(2) + 'T';
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'uncommon': return '#22c55e';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    default: return '#9ca3af';
  }
}

export function getClassColor(heroClass: string): string {
  switch (heroClass) {
    case 'warrior': return '#ef4444';
    case 'mage': return '#8b5cf6';
    case 'rogue': return '#22c55e';
    case 'cleric': return '#fbbf24';
    case 'ranger': return '#06b6d4';
    case 'berserker': return '#f97316';
    default: return '#9ca3af';
  }
}
