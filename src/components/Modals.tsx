import { GameState, GameAction } from '../engine/types';
import { formatNumber, formatTime } from '../engine/format';
import { calculatePrestigeShards } from '../data/prestige';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function OfflineModal({ state, dispatch }: Props) {
  if (!state.showOfflineEarnings || !state.offlineEarnings) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-abyss-700 rounded-xl p-6 max-w-xs w-full border border-crystal-500/20 animate-slide-in text-center">
        <div className="text-4xl mb-3">🌙</div>
        <div className="text-lg font-bold text-crystal-400 mb-1">Welcome Back!</div>
        <div className="text-xs opacity-40 mb-4">
          You were away for {formatTime(state.offlineEarnings.time)}
        </div>
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="text-2xl font-bold text-gold-400">
            +{formatNumber(state.offlineEarnings.gold)} 💰
          </div>
          <div className="text-[10px] opacity-40 mt-1">Gold earned while offline</div>
        </div>
        <button
          className="w-full py-2.5 rounded-lg bg-crystal-500/30 text-crystal-400 font-medium text-sm border border-crystal-500/40 active:scale-95 transition-all"
          onClick={() => dispatch({ type: 'DISMISS_OFFLINE' })}
        >
          Continue Adventure
        </button>
      </div>
    </div>
  );
}

export function PrestigeConfirmModal({ state, dispatch }: Props) {
  if (!state.showPrestigeConfirm) return null;

  const shards = calculatePrestigeShards(state);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-abyss-700 rounded-xl p-6 max-w-xs w-full border border-crystal-500/20 animate-slide-in text-center">
        <div className="text-4xl mb-3">🌀</div>
        <div className="text-lg font-bold text-crystal-400 mb-1">Prestige?</div>
        <div className="text-xs opacity-40 mb-4">
          This will reset your floor progress, gold, hero levels, and equipment.
          <br />You keep: Abyss Shards, prestige upgrades, and achievements.
        </div>
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="text-xl font-bold text-crystal-400">
            +{shards} 💎 Abyss Shards
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-lg bg-white/5 text-white/40 text-sm border border-white/10 active:scale-95 transition-all"
            onClick={() => dispatch({ type: 'DISMISS_PRESTIGE_CONFIRM' })}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-crystal-500/30 text-crystal-400 font-medium text-sm border border-crystal-500/40 active:scale-95 transition-all"
            onClick={() => dispatch({ type: 'PRESTIGE' })}
          >
            Prestige!
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationToast({ state, dispatch }: Props) {
  if (state.notifications.length === 0) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-40 space-y-1 w-[90%] max-w-sm">
      {state.notifications.slice(0, 3).map((notif, i) => (
        <div
          key={i}
          className="bg-abyss-700/95 backdrop-blur-sm border border-gold-500/30 rounded-lg px-3 py-2 text-xs text-gold-400 text-center animate-slide-in cursor-pointer"
          onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
        >
          {notif}
        </div>
      ))}
    </div>
  );
}
