// ============================================================
// Idle Abyss — Core Type Definitions
// ============================================================

export type HeroClass = 'warrior' | 'mage' | 'rogue' | 'cleric' | 'ranger' | 'berserker';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export interface HeroStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
}

export interface Hero {
  id: string;
  name: string;
  class: HeroClass;
  level: number;
  xp: number;
  xpToNext: number;
  baseStats: HeroStats;
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
  skills: HeroSkill[];
  unlocked: boolean;
  emoji: string;
}

export interface HeroSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  damage: number;
  effect?: 'heal' | 'buff_attack' | 'buff_defense' | 'aoe' | 'stun';
  effectValue?: number;
  unlockLevel: number;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: Rarity;
  stats: Partial<HeroStats>;
  level: number;
  emoji: string;
}

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  goldReward: number;
  xpReward: number;
  isBoss: boolean;
}

export interface DungeonFloor {
  floor: number;
  monsters: MonsterTemplate[];
  boss: MonsterTemplate;
  goldMultiplier: number;
  xpMultiplier: number;
}

export interface MonsterTemplate {
  name: string;
  emoji: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseGold: number;
  baseXp: number;
  isBoss: boolean;
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: string;
  effectPerLevel: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (state: GameState) => boolean;
  reward: { type: 'gold' | 'shards' | 'damage'; amount: number };
  unlocked: boolean;
}

export interface CombatLog {
  id: number;
  text: string;
  type: 'damage' | 'heal' | 'kill' | 'loot' | 'level' | 'boss' | 'prestige' | 'skill';
  timestamp: number;
}

export interface FloatingNumber {
  id: number;
  value: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

export interface GameState {
  // Resources
  gold: number;
  totalGold: number;
  abyssShards: number;
  totalAbyssShards: number;

  // Dungeon
  currentFloor: number;
  highestFloor: number;
  currentMonster: Monster | null;
  monstersKilled: number;
  bossesKilled: number;
  monstersOnFloor: number;
  monstersRemainingOnFloor: number;

  // Heroes
  heroes: Hero[];
  activeHeroIds: string[];

  // Equipment
  inventory: Equipment[];

  // Prestige
  prestigeCount: number;
  prestigeUpgrades: PrestigeUpgrade[];

  // Achievements
  achievements: Achievement[];

  // Combat
  combatLog: CombatLog[];
  floatingNumbers: FloatingNumber[];
  dps: number;
  tapDamage: number;
  tapCount: number;

  // Meta
  tickSpeed: number;
  lastSaveTime: number;
  lastOnlineTime: number;
  totalPlayTime: number;
  autoProgressEnabled: boolean;

  // UI
  activeTab: 'dungeon' | 'heroes' | 'upgrades' | 'prestige' | 'achievements';
  showOfflineEarnings: boolean;
  offlineEarnings: { gold: number; time: number } | null;
  showPrestigeConfirm: boolean;
  notifications: string[];
}

export type GameAction =
  | { type: 'TICK'; dt: number }
  | { type: 'TAP_MONSTER' }
  | { type: 'UPGRADE_HERO'; heroId: string }
  | { type: 'EQUIP_ITEM'; heroId: string; itemId: string }
  | { type: 'UNEQUIP_ITEM'; heroId: string; slot: EquipSlot }
  | { type: 'SELL_ITEM'; itemId: string }
  | { type: 'UNLOCK_HERO'; heroId: string }
  | { type: 'SET_ACTIVE_HERO'; heroId: string; active: boolean }
  | { type: 'PRESTIGE' }
  | { type: 'BUY_PRESTIGE_UPGRADE'; upgradeId: string }
  | { type: 'SET_TAB'; tab: GameState['activeTab'] }
  | { type: 'TOGGLE_AUTO_PROGRESS' }
  | { type: 'DISMISS_OFFLINE' }
  | { type: 'DISMISS_PRESTIGE_CONFIRM' }
  | { type: 'SHOW_PRESTIGE_CONFIRM' }
  | { type: 'LOAD_SAVE'; state: Partial<GameState> }
  | { type: 'USE_SKILL'; heroId: string; skillId: string }
  | { type: 'CLEAR_NOTIFICATIONS' };
