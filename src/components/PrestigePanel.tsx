import { GameState, GameAction } from '../engine/types';
import { formatNumber } from '../engine/format';
import { calculatePrestigeShards, getPrestigeUpgradeCost } from '../data/prestige';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function PrestigePanel({ state, dispatch }: Props) {
  const potentialShards = calculatePrestigeShards(state);
  const canPrestige = state.currentFloor >= 10;

  return (
    <div className="h-full overflow-y-auto px-3 py-2">
      {/* Prestige info */}
      <div className="bg-gradient-to-br from-crystal-500/10 to-abyss-700 rounded-lg p-4 border border-crystal-500/20 mb-3">
        <div className="text-center mb-3">
          <div className="text-3xl mb-1">🌀</div>
          <div className="text-lg font-medium text-crystal-400">Prestige</div>
          <div className="text-[10px] opacity-40 mt-1">
            Reset your progress for permanent power
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-center">
          <div className="bg-white/5 rounded p-2">
            <div className="text-lg font-bold text-crystal-400">{formatNumber(state.abyssShards)}</div>
            <div className="text-[9px] opacity-40">Abyss Shards</div>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="text-lg font-bold text-white/60">{state.prestigeCount}</div>
            <div className="text-[9px] opacity-40">Prestiges</div>
          </div>
        </div>

        <div className="text-center mb-3">
          <div className="text-xs opacity-60">
            Prestige now for <span className="text-crystal-400 font-bold">{potentialShards}</span> Abyss Shards
          </div>
          <div className="text-[9px] opacity-30 mt-0.5">
            Requires Floor 10+ (Current: Floor {state.currentFloor})
          </div>
        </div>

        <button
          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
            canPrestige
              ? 'bg-crystal-500/30 text-crystal-400 border border-crystal-500/40 active:scale-95 animate-pulse-glow'
              : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
          }`}
          style={canPrestige ? { color: '#a78bfa' } : undefined}
          onClick={() => canPrestige && dispatch({ type: 'SHOW_PRESTIGE_CONFIRM' })}
          disabled={!canPrestige}
        >
          {canPrestige ? `🌀 Prestige for ${potentialShards} Shards` : '🔒 Reach Floor 10'}
        </button>
      </div>

      {/* Prestige upgrades */}
      <div className="text-[10px] opacity-40 mb-2 uppercase tracking-wider">Permanent Upgrades</div>
      <div className="space-y-1.5">
        {state.prestigeUpgrades.map(upgrade => {
          const cost = getPrestigeUpgradeCost(upgrade);
          const canBuy = state.abyssShards >= cost && upgrade.currentLevel < upgrade.maxLevel;
          const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;

          return (
            <div
              key={upgrade.id}
              className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex items-center gap-2"
            >
              <span className="text-xl">{upgrade.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{upgrade.name}</div>
                <div className="text-[9px] opacity-40">{upgrade.description}</div>
                <div className="text-[9px] opacity-30">
                  Level {upgrade.currentLevel}/{upgrade.maxLevel}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-all ${
                    isMaxed
                      ? 'bg-gold-500/20 text-gold-400 cursor-default'
                      : canBuy
                        ? 'bg-crystal-500/20 text-crystal-400 border border-crystal-500/30 active:scale-95'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                  onClick={() => canBuy && dispatch({ type: 'BUY_PRESTIGE_UPGRADE', upgradeId: upgrade.id })}
                  disabled={!canBuy}
                >
                  {isMaxed ? 'MAX' : `${cost} 💎`}
                </button>
                {!isMaxed && canBuy && (
                  <button
                    className="px-2.5 py-1 rounded text-[9px] font-medium transition-all bg-gold-500/20 text-gold-400 border border-gold-500/30 active:scale-95"
                    onClick={() => dispatch({ type: 'BUY_MAX_PRESTIGE_UPGRADE', upgradeId: upgrade.id })}
                  >
                    Buy Max
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
