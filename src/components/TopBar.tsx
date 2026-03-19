import { useState, useCallback } from 'react';
import { GameState } from '../engine/types';
import { formatNumber } from '../engine/format';
import { getFloorName } from '../data/monsters';
import { isMuted, toggleMuted } from '../engine/sounds';

interface Props {
  state: GameState;
}

export function TopBar({ state }: Props) {
  const [muted, setMuted] = useState(isMuted);

  const handleToggleMute = useCallback(() => {
    toggleMuted();
    setMuted(isMuted());
  }, []);

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
        <button
          onClick={handleToggleMute}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm"
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
