import { GameState } from './types';
import { createInitialState } from './gameEngine';
import { createAchievements } from '../data/achievements';

const SAVE_KEY = 'idle_abyss_save';
const SAVE_INTERVAL = 30000; // 30 seconds

export function saveGame(state: GameState): void {
  try {
    const saveData = {
      ...state,
      // Strip non-serializable and transient data
      combatLog: [],
      floatingNumbers: [],
      achievements: state.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
      lastOnlineTime: Date.now(),
      lastSaveTime: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    const initial = createInitialState();

    // Restore achievements with their condition functions
    const freshAchievements = createAchievements();
    const savedAchievementState = data.achievements || [];
    const achievements = freshAchievements.map(a => {
      const saved = savedAchievementState.find((sa: { id: string; unlocked: boolean }) => sa.id === a.id);
      return { ...a, unlocked: saved?.unlocked ?? false };
    });

    return {
      ...initial,
      ...data,
      achievements,
      combatLog: [],
      floatingNumbers: [],
      notifications: [],
    };
  } catch (e) {
    console.warn('Failed to load save:', e);
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export { SAVE_INTERVAL };
