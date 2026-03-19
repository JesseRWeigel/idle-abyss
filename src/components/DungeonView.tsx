import { useRef, useCallback, useEffect, useState } from 'react';
import { GameState, GameAction } from '../engine/types';
import { formatNumber } from '../engine/format';
import { getFloorName, getFloorColor } from '../data/monsters';
import { playSound } from '../engine/sounds';
import { Particles } from './Particles';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function DungeonView({ state, dispatch }: Props) {
  const monster = state.currentMonster;
  const floorName = getFloorName(state.currentFloor);
  const floorColor = getFloorColor(state.currentFloor);
  const monsterRef = useRef<HTMLDivElement>(null);

  // Track particle burst triggers
  const [deathParticleTrigger, setDeathParticleTrigger] = useState(0);

  // Track critical hit flash
  const [showCritFlash, setShowCritFlash] = useState(false);

  // Process game events for sounds and effects
  useEffect(() => {
    for (const event of state.events) {
      switch (event) {
        case 'monsterDeath':
          playSound('monsterDeath');
          setDeathParticleTrigger(t => t + 1);
          break;
        case 'criticalHit':
          playSound('hit');
          setShowCritFlash(true);
          break;
        case 'goldPickup':
          playSound('goldPickup');
          break;
        case 'levelUp':
          playSound('levelUp');
          break;
        case 'achievement':
          playSound('achievement');
          break;
        case 'bossAppear':
          playSound('bossAppear');
          break;
        case 'prestige':
          playSound('prestige');
          break;
      }
    }
  }, [state.events]);

  // Clear crit flash after animation
  useEffect(() => {
    if (!showCritFlash) return;
    const timer = setTimeout(() => setShowCritFlash(false), 200);
    return () => clearTimeout(timer);
  }, [showCritFlash]);

  // Handle monster death animation cleanup
  useEffect(() => {
    if (!state.monsterDying) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'MONSTER_DEATH_DONE' });
    }, 400);
    return () => clearTimeout(timer);
  }, [state.monsterDying, dispatch]);

  const handleTap = useCallback(() => {
    if (state.monsterDying) return;
    dispatch({ type: 'TAP_MONSTER' });
    playSound('tap');
    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(10);
    // Shake animation
    if (monsterRef.current) {
      monsterRef.current.classList.remove('animate-shake');
      void monsterRef.current.offsetWidth; // force reflow
      monsterRef.current.classList.add('animate-shake');
    }
  }, [dispatch, state.monsterDying]);

  const hpPercent = monster ? Math.max(0, (monster.hp / monster.maxHp) * 100) : 0;
  const progressPercent = state.monstersOnFloor > 0
    ? ((state.monstersOnFloor - Math.max(0, state.monstersRemainingOnFloor)) / state.monstersOnFloor) * 100
    : 100;

  // Active hero portraits
  const activeHeroes = state.heroes.filter(h => h.unlocked && state.activeHeroIds.includes(h.id));

  return (
    <div className="flex flex-col items-center h-full relative overflow-hidden select-none">
      {/* Critical hit screen flash */}
      {showCritFlash && (
        <div className="absolute inset-0 z-30 pointer-events-none animate-crit-flash bg-gold-400/20" />
      )}

      {/* Particle effects */}
      <Particles trigger={deathParticleTrigger} x={50} y={40} type="gold" />

      {/* Ambient background glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${floorColor}40 0%, transparent 70%)`,
        }}
      />

      {/* Floor info */}
      <div className="w-full px-4 pt-3 pb-1 relative z-10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium" style={{ color: floorColor }}>
            {floorName}
          </span>
          <span className="text-xs opacity-40">
            {state.monstersRemainingOnFloor > 0
              ? `${state.monstersOnFloor - state.monstersRemainingOnFloor}/${state.monstersOnFloor}`
              : '⚠️ BOSS'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${floorColor}88, ${floorColor})`,
            }}
          />
        </div>
      </div>

      {/* Hero party display */}
      <div className="flex gap-1.5 px-4 py-1.5 relative z-10">
        {activeHeroes.map(hero => {
          const hpPct = hero.baseStats.hp / hero.baseStats.maxHp;
          return (
            <div key={hero.id} className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base border"
                style={{
                  borderColor: hpPct > 0.5 ? '#22c55e40' : hpPct > 0.25 ? '#f59e0b40' : '#ef444440',
                  background: `rgba(255,255,255,0.05)`,
                }}
              >
                {hero.emoji}
              </div>
              <div className="w-8 h-0.5 rounded-full mt-0.5 overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${hpPct * 100}%`,
                    background: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Monster area — tappable */}
      <div
        className="flex-1 flex flex-col items-center justify-center w-full cursor-pointer active:scale-[0.97] transition-transform relative z-10"
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label="Tap to attack monster"
      >
        {monster && (
          <>
            {/* Monster name & level */}
            <div className="text-center mb-3">
              {monster.isBoss && (
                <div className="text-[10px] font-bold text-ruby-400 uppercase tracking-widest mb-1 animate-pulse-glow" style={{ color: '#f87171' }}>
                  ⚠️ BOSS ⚠️
                </div>
              )}
              <div className="text-base font-semibold text-white/90">
                {monster.name}
              </div>
              <div className="text-[10px] opacity-30 mt-0.5">
                Floor {state.currentFloor} · {monster.isBoss ? 'Boss' : 'Monster'}
              </div>
            </div>

            {/* Monster emoji — large, with glow effect */}
            <div className="relative mb-4">
              {/* Glow behind monster */}
              <div
                className="absolute inset-0 blur-2xl opacity-30 rounded-full"
                style={{
                  background: monster.isBoss
                    ? 'radial-gradient(circle, #ef4444 0%, transparent 70%)'
                    : 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                  transform: 'scale(2)',
                }}
              />
              <div
                ref={monsterRef}
                className={`relative text-8xl ${state.monsterDying ? 'animate-monster-death' : ''}`}
                style={{
                  filter: monster.isBoss
                    ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
                    : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                }}
              >
                {monster.emoji}
              </div>
            </div>

            {/* HP bar — wider and more prominent */}
            <div className="w-[85%] max-w-sm">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="opacity-50">HP</span>
                <span className="font-mono opacity-60">{formatNumber(Math.max(0, monster.hp))} / {formatNumber(monster.maxHp)}</span>
              </div>
              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div
                  className="health-bar-fill h-full rounded-full relative"
                  style={{
                    width: `${hpPercent}%`,
                    background: hpPercent > 50
                      ? 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)'
                      : hpPercent > 25
                        ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)',
                    boxShadow: `0 0 8px ${hpPercent > 50 ? '#22c55e40' : hpPercent > 25 ? '#f59e0b40' : '#ef444440'}`,
                  }}
                >
                  {/* HP bar shine */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                </div>
              </div>
            </div>

            {/* DPS indicator */}
            <div className="mt-4 flex items-center gap-4 text-[10px]">
              <span className="opacity-30">⚔️ DPS: <span className="text-white/50 font-mono">{formatNumber(state.dps)}</span></span>
              <span className="opacity-30">👆 Tap: <span className="text-gold-400/50 font-mono">{formatNumber(state.tapDamage)}</span></span>
            </div>
          </>
        )}

        {/* Floating damage numbers */}
        {state.floatingNumbers.map(f => {
          const isCrit = f.type === 'crit';
          const isGold = f.type === 'gold';
          let cn = 'absolute font-bold pointer-events-none ';
          if (isCrit) {
            cn += 'animate-float-crit';
          } else if (isGold) {
            cn += 'animate-float-gold';
          } else {
            cn += 'animate-float-up';
          }
          return (
            <div
              key={f.id}
              className={cn}
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                color: f.color,
                fontSize: isCrit ? '24px' : isGold ? '13px' : '16px',
                fontWeight: isCrit ? 900 : isGold ? 600 : 700,
                textShadow: isCrit
                  ? '0 2px 8px rgba(251, 191, 36, 0.8), 0 0 16px rgba(251, 191, 36, 0.4)'
                  : `0 2px 4px rgba(0,0,0,0.6), 0 0 8px ${f.color}40`,
              }}
            >
              {f.value}
            </div>
          );
        })}
      </div>

      {/* Combat stats bar */}
      <div className="w-full px-4 pb-2 relative z-10">
        <div className="flex justify-between text-[10px] opacity-40">
          <span>Floor {state.currentFloor}</span>
          <span>Best: F{state.highestFloor}</span>
          <span>Kills: {formatNumber(state.monstersKilled)}</span>
        </div>
      </div>
    </div>
  );
}
