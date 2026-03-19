import { GameState, GameAction } from '../engine/types';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

const tabs: Array<{ id: GameState['activeTab']; emoji: string; label: string }> = [
  { id: 'dungeon', emoji: '⚔️', label: 'Dungeon' },
  { id: 'heroes', emoji: '👥', label: 'Heroes' },
  { id: 'upgrades', emoji: '🛡️', label: 'Equip' },
  { id: 'prestige', emoji: '🌀', label: 'Prestige' },
  { id: 'achievements', emoji: '🏆', label: 'Stats' },
];

export function TabBar({ state, dispatch }: Props) {
  return (
    <div className="bg-abyss-800/80 backdrop-blur-sm border-t border-white/5 flex">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${
            state.activeTab === tab.id
              ? 'tab-active text-crystal-400'
              : 'text-white/30 active:text-white/50'
          }`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
        >
          <span className="text-base">{tab.emoji}</span>
          <span className="text-[9px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
