import { GameState } from '../engine/types';
import { formatNumber } from '../engine/format';

interface Props {
  state: GameState;
}

export function AchievementsPanel({ state }: Props) {
  const unlocked = state.achievements.filter(a => a.unlocked).length;
  const total = state.achievements.length;

  return (
    <div className="h-full overflow-y-auto px-3 py-2">
      {/* Stats summary */}
      <div className="bg-white/5 rounded-lg p-3 mb-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold text-gold-400">{unlocked}/{total}</div>
          <div className="text-[9px] opacity-40">Achievements</div>
        </div>
        <div>
          <div className="text-sm font-bold text-emerald-400">{formatNumber(state.totalGold)}</div>
          <div className="text-[9px] opacity-40">Total Gold</div>
        </div>
        <div>
          <div className="text-sm font-bold text-crystal-400">{formatNumber(state.totalPlayTime / 1000 / 60)}m</div>
          <div className="text-[9px] opacity-40">Play Time</div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/5 rounded-lg p-3 mb-3">
        <div className="text-[10px] opacity-40 mb-1.5 uppercase tracking-wider">Statistics</div>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex justify-between"><span className="opacity-40">Monsters Killed</span><span>{formatNumber(state.monstersKilled)}</span></div>
          <div className="flex justify-between"><span className="opacity-40">Bosses Killed</span><span>{formatNumber(state.bossesKilled)}</span></div>
          <div className="flex justify-between"><span className="opacity-40">Highest Floor</span><span>{state.highestFloor}</span></div>
          <div className="flex justify-between"><span className="opacity-40">Taps</span><span>{formatNumber(state.tapCount)}</span></div>
          <div className="flex justify-between"><span className="opacity-40">Prestiges</span><span>{state.prestigeCount}</span></div>
          <div className="flex justify-between"><span className="opacity-40">Total Shards</span><span>{formatNumber(state.totalAbyssShards)}</span></div>
        </div>
      </div>

      {/* Achievement list */}
      <div className="text-[10px] opacity-40 mb-1.5 uppercase tracking-wider">Achievements</div>
      <div className="space-y-1">
        {state.achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`rounded-lg p-2 border flex items-center gap-2 ${
              achievement.unlocked
                ? 'bg-gold-500/10 border-gold-500/20'
                : 'bg-white/3 border-white/5 opacity-40'
            }`}
          >
            <span className="text-lg">{achievement.unlocked ? achievement.emoji : '🔒'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">{achievement.name}</div>
              <div className="text-[9px] opacity-50">{achievement.description}</div>
            </div>
            <div className="text-[9px] flex-shrink-0">
              {achievement.unlocked ? (
                <span className="text-gold-400">✓</span>
              ) : (
                <span className="opacity-30">
                  {achievement.reward.type === 'gold' ? `${formatNumber(achievement.reward.amount)}g` : `${achievement.reward.amount}💎`}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
