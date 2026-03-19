import { Achievement, GameState } from '../engine/types';

export function createAchievements(): Achievement[] {
  return [
    // Kill milestones
    { id: 'kill_10', name: 'First Blood', description: 'Kill 10 monsters', emoji: '🗡️',
      condition: (s: GameState) => s.monstersKilled >= 10, reward: { type: 'gold', amount: 50 }, unlocked: false },
    { id: 'kill_100', name: 'Monster Slayer', description: 'Kill 100 monsters', emoji: '⚔️',
      condition: (s: GameState) => s.monstersKilled >= 100, reward: { type: 'gold', amount: 500 }, unlocked: false },
    { id: 'kill_1000', name: 'Butcher', description: 'Kill 1,000 monsters', emoji: '🪓',
      condition: (s: GameState) => s.monstersKilled >= 1000, reward: { type: 'gold', amount: 5000 }, unlocked: false },
    { id: 'kill_10000', name: 'Extinction Event', description: 'Kill 10,000 monsters', emoji: '💀',
      condition: (s: GameState) => s.monstersKilled >= 10000, reward: { type: 'shards', amount: 10 }, unlocked: false },

    // Floor milestones
    { id: 'floor_5', name: 'Getting Deeper', description: 'Reach floor 5', emoji: '🪜',
      condition: (s: GameState) => s.highestFloor >= 5, reward: { type: 'gold', amount: 100 }, unlocked: false },
    { id: 'floor_10', name: 'Into Darkness', description: 'Reach floor 10', emoji: '🕳️',
      condition: (s: GameState) => s.highestFloor >= 10, reward: { type: 'gold', amount: 300 }, unlocked: false },
    { id: 'floor_25', name: 'Cavern Explorer', description: 'Reach floor 25', emoji: '🗺️',
      condition: (s: GameState) => s.highestFloor >= 25, reward: { type: 'gold', amount: 1000 }, unlocked: false },
    { id: 'floor_50', name: 'Hellwalker', description: 'Reach floor 50', emoji: '🔥',
      condition: (s: GameState) => s.highestFloor >= 50, reward: { type: 'shards', amount: 5 }, unlocked: false },
    { id: 'floor_100', name: 'Abyssal Pioneer', description: 'Reach floor 100', emoji: '🌀',
      condition: (s: GameState) => s.highestFloor >= 100, reward: { type: 'shards', amount: 20 }, unlocked: false },

    // Gold milestones
    { id: 'gold_1k', name: 'Coin Purse', description: 'Earn 1,000 total gold', emoji: '💰',
      condition: (s: GameState) => s.totalGold >= 1000, reward: { type: 'gold', amount: 200 }, unlocked: false },
    { id: 'gold_100k', name: 'Treasure Hoard', description: 'Earn 100,000 total gold', emoji: '🏆',
      condition: (s: GameState) => s.totalGold >= 100000, reward: { type: 'gold', amount: 10000 }, unlocked: false },
    { id: 'gold_1m', name: 'Dragon\'s Vault', description: 'Earn 1,000,000 total gold', emoji: '🐲',
      condition: (s: GameState) => s.totalGold >= 1000000, reward: { type: 'shards', amount: 15 }, unlocked: false },

    // Boss milestones
    { id: 'boss_1', name: 'Boss Slayer', description: 'Defeat your first boss', emoji: '👑',
      condition: (s: GameState) => s.bossesKilled >= 1, reward: { type: 'gold', amount: 200 }, unlocked: false },
    { id: 'boss_10', name: 'Boss Hunter', description: 'Defeat 10 bosses', emoji: '🏅',
      condition: (s: GameState) => s.bossesKilled >= 10, reward: { type: 'gold', amount: 2000 }, unlocked: false },
    { id: 'boss_50', name: 'Kingslayer', description: 'Defeat 50 bosses', emoji: '⚜️',
      condition: (s: GameState) => s.bossesKilled >= 50, reward: { type: 'shards', amount: 10 }, unlocked: false },

    // Prestige milestones
    { id: 'prestige_1', name: 'Rebirth', description: 'Prestige for the first time', emoji: '🔄',
      condition: (s: GameState) => s.prestigeCount >= 1, reward: { type: 'shards', amount: 3 }, unlocked: false },
    { id: 'prestige_5', name: 'Cycle of Ages', description: 'Prestige 5 times', emoji: '♾️',
      condition: (s: GameState) => s.prestigeCount >= 5, reward: { type: 'shards', amount: 10 }, unlocked: false },
    { id: 'prestige_10', name: 'Eternal Champion', description: 'Prestige 10 times', emoji: '🌟',
      condition: (s: GameState) => s.prestigeCount >= 10, reward: { type: 'shards', amount: 25 }, unlocked: false },

    // Hero milestones
    { id: 'heroes_3', name: 'Party Assembled', description: 'Unlock 3 heroes', emoji: '👥',
      condition: (s: GameState) => s.heroes.filter(h => h.unlocked).length >= 3, reward: { type: 'gold', amount: 1000 }, unlocked: false },
    { id: 'heroes_all', name: 'Full Roster', description: 'Unlock all 6 heroes', emoji: '🌈',
      condition: (s: GameState) => s.heroes.filter(h => h.unlocked).length >= 6, reward: { type: 'shards', amount: 15 }, unlocked: false },
    { id: 'hero_lv10', name: 'Veteran', description: 'Get a hero to level 10', emoji: '⭐',
      condition: (s: GameState) => s.heroes.some(h => h.level >= 10), reward: { type: 'gold', amount: 500 }, unlocked: false },
    { id: 'hero_lv25', name: 'Champion', description: 'Get a hero to level 25', emoji: '🏆',
      condition: (s: GameState) => s.heroes.some(h => h.level >= 25), reward: { type: 'gold', amount: 5000 }, unlocked: false },
    { id: 'hero_lv50', name: 'Legendary', description: 'Get a hero to level 50', emoji: '🌟',
      condition: (s: GameState) => s.heroes.some(h => h.level >= 50), reward: { type: 'shards', amount: 10 }, unlocked: false },

    // Tap milestones
    { id: 'tap_100', name: 'Clicker', description: 'Tap 100 times', emoji: '👆',
      condition: (s: GameState) => s.tapCount >= 100, reward: { type: 'gold', amount: 100 }, unlocked: false },
    { id: 'tap_1000', name: 'Tap Master', description: 'Tap 1,000 times', emoji: '🖱️',
      condition: (s: GameState) => s.tapCount >= 1000, reward: { type: 'gold', amount: 1000 }, unlocked: false },
    { id: 'tap_10000', name: 'Speed Demon', description: 'Tap 10,000 times', emoji: '⚡',
      condition: (s: GameState) => s.tapCount >= 10000, reward: { type: 'shards', amount: 5 }, unlocked: false },
  ];
}
