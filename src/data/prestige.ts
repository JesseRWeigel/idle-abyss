import { PrestigeUpgrade, GameState } from '../engine/types';

export function createPrestigeUpgrades(): PrestigeUpgrade[] {
  return [
    {
      id: 'damage_mult',
      name: 'Abyssal Might',
      description: '+25% base damage per level',
      emoji: '⚔️',
      cost: 1,
      maxLevel: 50,
      currentLevel: 0,
      effect: 'damage',
      effectPerLevel: 0.25,
    },
    {
      id: 'gold_mult',
      name: 'Golden Touch',
      description: '+30% gold earned per level',
      emoji: '💰',
      cost: 1,
      maxLevel: 50,
      currentLevel: 0,
      effect: 'gold',
      effectPerLevel: 0.30,
    },
    {
      id: 'xp_mult',
      name: 'Wisdom of Ages',
      description: '+20% XP gained per level',
      emoji: '📚',
      cost: 2,
      maxLevel: 30,
      currentLevel: 0,
      effect: 'xp',
      effectPerLevel: 0.20,
    },
    {
      id: 'hp_mult',
      name: 'Undying Will',
      description: '+20% max HP per level',
      emoji: '❤️',
      cost: 2,
      maxLevel: 30,
      currentLevel: 0,
      effect: 'hp',
      effectPerLevel: 0.20,
    },
    {
      id: 'crit_chance',
      name: 'Keen Edge',
      description: '+2% crit chance per level',
      emoji: '🎯',
      cost: 3,
      maxLevel: 20,
      currentLevel: 0,
      effect: 'crit',
      effectPerLevel: 0.02,
    },
    {
      id: 'tap_mult',
      name: 'Titan\'s Finger',
      description: '+50% tap damage per level',
      emoji: '👆',
      cost: 2,
      maxLevel: 40,
      currentLevel: 0,
      effect: 'tap',
      effectPerLevel: 0.50,
    },
    {
      id: 'start_gold',
      name: 'Inherited Fortune',
      description: 'Start with 500 gold per level',
      emoji: '🏦',
      cost: 3,
      maxLevel: 20,
      currentLevel: 0,
      effect: 'startGold',
      effectPerLevel: 500,
    },
    {
      id: 'start_floor',
      name: 'Dimensional Skip',
      description: 'Start on floor +2 per level',
      emoji: '🚀',
      cost: 5,
      maxLevel: 10,
      currentLevel: 0,
      effect: 'startFloor',
      effectPerLevel: 2,
    },
  ];
}

export function getPrestigeUpgradeCost(upgrade: PrestigeUpgrade): number {
  return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.currentLevel));
}

export function calculatePrestigeShards(state: GameState): number {
  const floorBonus = Math.floor(Math.pow(state.highestFloor / 10, 1.5));
  const killBonus = Math.floor(state.monstersKilled / 100);
  return Math.max(1, floorBonus + killBonus);
}

export function getPrestigeMultiplier(upgrades: PrestigeUpgrade[], effect: string): number {
  const upgrade = upgrades.find(u => u.effect === effect);
  if (!upgrade) return 1;
  return 1 + upgrade.currentLevel * upgrade.effectPerLevel;
}

export function getPrestigeFlat(upgrades: PrestigeUpgrade[], effect: string): number {
  const upgrade = upgrades.find(u => u.effect === effect);
  if (!upgrade) return 0;
  return upgrade.currentLevel * upgrade.effectPerLevel;
}
