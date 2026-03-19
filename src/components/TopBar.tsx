import { GameState } from '../engine/types';
import { formatNumber } from '../engine/format';
import { getFloorName } from '../data/monsters';

interface Props {
  state: GameState;
}

export function TopBar({ state }: Props) {
  return (
    <div className="bg-abyss-800/80 backdrop-blur-sm border-b border-white/5 px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm font-bold tracking-tight">
          <span className="text-crystal-400">IDLE</span>
          <span className="text-white/60"> ABYSS</span>
        </div>
        <div className="text-[10px] opacity-30">
          {getFloorName(state.currentFloor)} · F{state.currentFloor}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-xs">💰</span>
          <span className="text-xs font-bold text-gold-400 font-mono">{formatNumber(state.gold)}</span>
        </div>
        {state.abyssShards > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs">💎</span>
            <span className="text-xs font-bold text-crystal-400 font-mono">{formatNumber(state.abyssShards)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
