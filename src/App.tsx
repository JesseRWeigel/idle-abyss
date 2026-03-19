import { useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { DungeonView } from './components/DungeonView';
import { HeroPanel } from './components/HeroPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { PrestigePanel } from './components/PrestigePanel';
import { AchievementsPanel } from './components/AchievementsPanel';
import { CombatLog } from './components/CombatLog';
import { OfflineModal, PrestigeConfirmModal, NotificationToast } from './components/Modals';

export default function App() {
  const { state, dispatch } = useGame();

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications, dispatch]);

  const renderActiveTab = () => {
    switch (state.activeTab) {
      case 'dungeon':
        return <DungeonView state={state} dispatch={dispatch} />;
      case 'heroes':
        return <HeroPanel state={state} dispatch={dispatch} />;
      case 'upgrades':
        return <EquipmentPanel state={state} dispatch={dispatch} />;
      case 'prestige':
        return <PrestigePanel state={state} dispatch={dispatch} />;
      case 'achievements':
        return <AchievementsPanel state={state} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-abyss-900 max-w-lg mx-auto">
      <TopBar state={state} />
      <div className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </div>
      {state.activeTab === 'dungeon' && <CombatLog state={state} />}
      <TabBar state={state} dispatch={dispatch} />

      {/* Modals */}
      <OfflineModal state={state} dispatch={dispatch} />
      <PrestigeConfirmModal state={state} dispatch={dispatch} />
      <NotificationToast state={state} dispatch={dispatch} />
    </div>
  );
}
