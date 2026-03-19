import { GameState } from '../engine/types';

interface Props {
  state: GameState;
}

const typeColors: Record<string, string> = {
  damage: '#e2e8f0',
  heal: '#34d399',
  kill: '#f87171',
  loot: '#fbbf24',
  level: '#a78bfa',
  boss: '#f97316',
  prestige: '#67e8f9',
  skill: '#c084fc',
};

export function CombatLog({ state }: Props) {
  if (state.combatLog.length === 0) return null;

  return (
    <div className="bg-abyss-900/50 border-t border-white/5 px-3 py-1 max-h-16 overflow-y-auto">
      {state.combatLog.slice(0, 5).map(log => (
        <div
          key={log.id}
          className="text-[9px] leading-tight py-0.5 opacity-60"
          style={{ color: typeColors[log.type] ?? '#e2e8f0' }}
        >
          {log.text}
        </div>
      ))}
    </div>
  );
}
