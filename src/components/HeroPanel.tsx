import { GameState, GameAction, Hero } from '../engine/types';
import { formatNumber, getClassColor } from '../engine/format';
import { getHeroUpgradeCost, getHeroStats } from '../engine/gameEngine';
import { getHeroUnlockCost } from '../data/heroes';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function HeroCard({ hero, state, dispatch }: { hero: Hero; state: GameState; dispatch: (action: GameAction) => void }) {
  const isActive = state.activeHeroIds.includes(hero.id);
  const classColor = getClassColor(hero.class);

  if (!hero.unlocked) {
    const cost = getHeroUnlockCost(hero.id);
    const canAfford = state.gold >= cost;
    return (
      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl opacity-30">🔒</span>
          <div>
            <div className="text-sm font-medium opacity-40">{hero.name}</div>
            <div className="text-[10px] opacity-30 capitalize">{hero.class}</div>
          </div>
        </div>
        <button
          className={`w-full py-1.5 rounded text-xs font-medium transition-all ${
            canAfford
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 active:scale-95'
              : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
          }`}
          onClick={() => canAfford && dispatch({ type: 'UNLOCK_HERO', heroId: hero.id })}
          disabled={!canAfford}
        >
          Unlock — {formatNumber(cost)}g
        </button>
      </div>
    );
  }

  const stats = getHeroStats(hero, state.prestigeUpgrades);
  const upgradeCost = getHeroUpgradeCost(hero);
  const canUpgrade = state.gold >= upgradeCost;

  return (
    <div
      className="rounded-lg p-3 border transition-all"
      style={{
        background: isActive ? `${classColor}10` : 'rgba(255,255,255,0.03)',
        borderColor: isActive ? `${classColor}40` : 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{hero.emoji}</span>
          <div>
            <div className="text-sm font-medium">{hero.name}</div>
            <div className="text-[10px] opacity-50 capitalize">
              Lv.{hero.level} {hero.class}
            </div>
          </div>
        </div>
        <button
          className={`w-8 h-8 rounded-full text-xs transition-all ${
            isActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-white/30 border border-white/10'
          }`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_HERO', heroId: hero.id, active: !isActive })}
        >
          {isActive ? '✓' : '○'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 mb-2 text-[10px]">
        <div className="bg-white/5 rounded px-1.5 py-0.5">
          <span className="opacity-40">ATK</span> <span className="text-ruby-400">{formatNumber(stats.attack)}</span>
        </div>
        <div className="bg-white/5 rounded px-1.5 py-0.5">
          <span className="opacity-40">DEF</span> <span className="text-soul-400">{formatNumber(stats.defense)}</span>
        </div>
        <div className="bg-white/5 rounded px-1.5 py-0.5">
          <span className="opacity-40">HP</span> <span className="text-emerald-400">{formatNumber(stats.maxHp)}</span>
        </div>
      </div>

      {/* XP bar */}
      <div className="mb-2">
        <div className="flex justify-between text-[9px] opacity-40 mb-0.5">
          <span>XP</span>
          <span>{formatNumber(hero.xp)}/{formatNumber(hero.xpToNext)}</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-crystal-500"
            style={{ width: `${(hero.xp / hero.xpToNext) * 100}%` }}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="flex gap-1 mb-2">
        {hero.skills.map(skill => {
          const available = hero.level >= skill.unlockLevel && skill.currentCooldown <= 0;
          const locked = hero.level < skill.unlockLevel;
          return (
            <button
              key={skill.id}
              className={`flex-1 py-1 rounded text-[9px] transition-all ${
                locked
                  ? 'bg-white/5 text-white/15 cursor-not-allowed'
                  : available
                    ? 'bg-crystal-500/20 text-crystal-400 border border-crystal-500/30 active:scale-95'
                    : 'bg-white/5 text-white/30 cursor-wait'
              }`}
              onClick={() => available && dispatch({ type: 'USE_SKILL', heroId: hero.id, skillId: skill.id })}
              disabled={!available}
              title={`${skill.name}: ${skill.description}${locked ? ` (Unlock at Lv.${skill.unlockLevel})` : ''}`}
            >
              {locked ? `🔒 Lv${skill.unlockLevel}` : skill.currentCooldown > 0 ? `${Math.ceil(skill.currentCooldown)}s` : skill.name}
            </button>
          );
        })}
      </div>

      {/* Upgrade buttons */}
      <div className="flex gap-1">
        <button
          className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
            canUpgrade
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 active:scale-95'
              : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
          }`}
          onClick={() => canUpgrade && dispatch({ type: 'UPGRADE_HERO', heroId: hero.id })}
          disabled={!canUpgrade}
        >
          +1 — {formatNumber(upgradeCost)}g
        </button>
        <button
          className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all flex-shrink-0 ${
            canUpgrade
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 active:scale-95'
              : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
          }`}
          onClick={() => canUpgrade && dispatch({ type: 'BUY_MAX_HERO_LEVELS', heroId: hero.id })}
          disabled={!canUpgrade}
        >
          Buy Max
        </button>
      </div>
    </div>
  );
}

export function HeroPanel({ state, dispatch }: Props) {
  return (
    <div className="h-full overflow-y-auto px-3 py-2 space-y-2">
      <div className="text-xs opacity-40 mb-1">
        Party: {state.activeHeroIds.length} heroes active
      </div>
      {state.heroes.map(hero => (
        <HeroCard key={hero.id} hero={hero} state={state} dispatch={dispatch} />
      ))}
    </div>
  );
}
