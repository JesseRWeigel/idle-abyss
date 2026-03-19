import { useReducer, useEffect, useRef, useCallback } from 'react';
import { GameState, GameAction } from '../engine/types';
import { gameReducer, createInitialState, calculateOfflineEarnings } from '../engine/gameEngine';
import { saveGame, loadGame, SAVE_INTERVAL } from '../engine/saveSystem';

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const saved = loadGame();
    if (saved) {
      // Calculate offline earnings
      const offline = calculateOfflineEarnings(saved);
      if (offline.gold > 0) {
        return {
          ...saved,
          gold: saved.gold + offline.gold,
          totalGold: saved.totalGold + offline.gold,
          showOfflineEarnings: true,
          offlineEarnings: offline,
          lastOnlineTime: Date.now(),
        };
      }
      return { ...saved, lastOnlineTime: Date.now() };
    }
    return createInitialState();
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Game loop - 100ms tick
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', dt: 100 });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(stateRef.current);
    }, SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Save on page unload
  useEffect(() => {
    const handleUnload = () => saveGame(stateRef.current);
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveGame(stateRef.current);
    });
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const act = useCallback((action: GameAction) => dispatch(action), []);

  return { state, dispatch: act };
}
