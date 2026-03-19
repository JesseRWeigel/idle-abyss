import { GameState, GameAction } from '../engine/types';
import { formatNumber } from '../engine/format';
import { getFloorName, getFloorColor } from '../data/monsters';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function DungeonView({ state, dispatch }: Props) {
  const monster = state.currentMonster;
  const floorName = getFloorName(state.currentFloor);
  const floorColor = getFloorColor(state.currentFloor);

  const handleTap = () => {
    dispatch({ type: 'TAP_MONSTER' });
  };

  const hpPercent = monster ? Math.max(0, (monster.hp / monster.maxHp) * 100) : 0;
  const progressPercent = state.monstersOnFloor > 0
    ? ((state.monstersOnFloor - state.monstersRemainingOnFloor) / state.monstersOnFloor) * 100
    : 0;

  return (
    <div className="flex flex-col items-center h-full relative overflow-hidden select-none">
      {/* Floor info */}
      <div className="w-full px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium opacity-60" style={{ color: floorColor }}>
            {floorName}
          </span>
          <span className="text-xs opacity-40">
            {state.monstersRemainingOnFloor > 0
              ? `${state.monstersOnFloor - state.monstersRemainingOnFloor}/${state.monstersOnFloor}`
              : '⚠️ BOSS'}
          </span>
        </div>

        {/* Floor progress bar */}
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

      {/* Monster area — tappable */}
      <div
        className="flex-1 flex flex-col items-center justify-center w-full cursor-pointer active:scale-95 transition-transform"
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label="Tap to attack monster"
      >
        {monster && (
          <>
            {/* Monster name */}
            <div className="text-center mb-2">
              {monster.isBoss && (
                <span className="text-[10px] font-bold text-ruby-400 uppercase tracking-widest">
                  ⚠️ BOSS ⚠️
                </span>
              )}
              <div className="text-sm font-medium text-white/80">
                {monster.name}
              </div>
            </div>

            {/* Monster emoji — big and tappable */}
            <div
              className={`text-7xl mb-3 ${monster.hp < monster.maxHp * 0.3 ? 'animate-shake' : ''}`}
              style={{ filter: monster.isBoss ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))' : undefined }}
            >
              {monster.emoji}
            </div>

            {/* HP bar */}
            <div className="w-3/4 max-w-xs">
              <div className="flex justify-between text-[10px] mb-0.5 opacity-60">
                <span>HP</span>
                <span>{formatNumber(Math.max(0, monster.hp))} / {formatNumber(monster.maxHp)}</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="health-bar-fill h-full rounded-full"
                  style={{
                    width: `${hpPercent}%`,
                    background: hpPercent > 50
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : hpPercent > 25
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>
            </div>

            {/* Tap hint */}
            <div className="mt-3 text-[10px] opacity-30">
              TAP TO DEAL {formatNumber(state.tapDamage)} DAMAGE
            </div>
          </>
        )}

        {/* Floating damage numbers */}
        {state.floatingNumbers.map(f => (
          <div
            key={f.id}
            className="absolute animate-float-up font-bold text-lg pointer-events-none"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              color: f.color,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {f.value}
          </div>
        ))}
      </div>

      {/* Combat stats bar */}
      <div className="w-full px-4 pb-2">
        <div className="flex justify-between text-[10px] opacity-50">
          <span>DPS: {formatNumber(state.dps)}</span>
          <span>Floor {state.currentFloor}</span>
          <span>Kills: {formatNumber(state.monstersKilled)}</span>
        </div>
      </div>
    </div>
  );
}
