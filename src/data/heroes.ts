import { Hero, HeroClass } from '../engine/types';

const heroTemplates: Array<{
  id: string;
  name: string;
  class: HeroClass;
  emoji: string;
  unlockCost: number;
  baseStats: {
    hp: number; attack: number; defense: number;
    speed: number; critChance: number; critDamage: number;
  };
  skills: Array<{
    id: string; name: string; description: string;
    cooldown: number; damage: number;
    effect?: 'heal' | 'buff_attack' | 'buff_defense' | 'aoe' | 'stun';
    effectValue?: number; unlockLevel: number;
  }>;
}> = [
  {
    id: 'knight',
    name: 'Sir Aldric',
    class: 'warrior',
    emoji: '⚔️',
    unlockCost: 0,
    baseStats: { hp: 120, attack: 15, defense: 12, speed: 8, critChance: 0.05, critDamage: 1.5 },
    skills: [
      { id: 'shield_bash', name: 'Shield Bash', description: 'Stuns enemy for 2s', cooldown: 8, damage: 20, effect: 'stun', effectValue: 2, unlockLevel: 1 },
      { id: 'war_cry', name: 'War Cry', description: '+50% team ATK for 5s', cooldown: 15, damage: 0, effect: 'buff_attack', effectValue: 0.5, unlockLevel: 5 },
      { id: 'cleave', name: 'Cleave', description: 'Heavy strike for 3x damage', cooldown: 10, damage: 45, unlockLevel: 10 },
    ],
  },
  {
    id: 'sorceress',
    name: 'Lyra the Arcane',
    class: 'mage',
    emoji: '🔮',
    unlockCost: 500,
    baseStats: { hp: 60, attack: 25, defense: 5, speed: 10, critChance: 0.1, critDamage: 2.0 },
    skills: [
      { id: 'fireball', name: 'Fireball', description: 'Blazing AoE damage', cooldown: 6, damage: 35, effect: 'aoe', effectValue: 0.5, unlockLevel: 1 },
      { id: 'ice_lance', name: 'Ice Lance', description: 'Piercing frost + stun', cooldown: 10, damage: 50, effect: 'stun', effectValue: 1.5, unlockLevel: 5 },
      { id: 'arcane_surge', name: 'Arcane Surge', description: '+100% ATK for 3s', cooldown: 20, damage: 0, effect: 'buff_attack', effectValue: 1.0, unlockLevel: 12 },
    ],
  },
  {
    id: 'shadow',
    name: 'Kael Shadowstep',
    class: 'rogue',
    emoji: '🗡️',
    unlockCost: 2000,
    baseStats: { hp: 70, attack: 22, defense: 6, speed: 15, critChance: 0.25, critDamage: 2.5 },
    skills: [
      { id: 'backstab', name: 'Backstab', description: 'Guaranteed crit strike', cooldown: 7, damage: 55, unlockLevel: 1 },
      { id: 'poison', name: 'Venomous Blade', description: 'DoT for 5s', cooldown: 12, damage: 15, unlockLevel: 5 },
      { id: 'assassinate', name: 'Assassinate', description: '5x damage to low HP', cooldown: 18, damage: 100, unlockLevel: 15 },
    ],
  },
  {
    id: 'priestess',
    name: 'Sister Elara',
    class: 'cleric',
    emoji: '✨',
    unlockCost: 5000,
    baseStats: { hp: 90, attack: 10, defense: 10, speed: 9, critChance: 0.05, critDamage: 1.5 },
    skills: [
      { id: 'heal', name: 'Divine Light', description: 'Heal all heroes 30%', cooldown: 10, damage: 0, effect: 'heal', effectValue: 0.3, unlockLevel: 1 },
      { id: 'smite', name: 'Holy Smite', description: 'Divine damage + stun', cooldown: 8, damage: 30, effect: 'stun', effectValue: 1, unlockLevel: 5 },
      { id: 'barrier', name: 'Sacred Barrier', description: '+80% team DEF 5s', cooldown: 15, damage: 0, effect: 'buff_defense', effectValue: 0.8, unlockLevel: 10 },
    ],
  },
  {
    id: 'archer',
    name: 'Finn Swiftbow',
    class: 'ranger',
    emoji: '🏹',
    unlockCost: 15000,
    baseStats: { hp: 75, attack: 20, defense: 7, speed: 14, critChance: 0.15, critDamage: 2.0 },
    skills: [
      { id: 'multishot', name: 'Multishot', description: 'Triple arrow volley', cooldown: 6, damage: 40, effect: 'aoe', effectValue: 0.4, unlockLevel: 1 },
      { id: 'snipe', name: 'Snipe', description: 'Perfect aim, huge crit', cooldown: 12, damage: 80, unlockLevel: 8 },
      { id: 'rain', name: 'Arrow Rain', description: 'Devastating AoE barrage', cooldown: 20, damage: 60, effect: 'aoe', effectValue: 1.0, unlockLevel: 15 },
    ],
  },
  {
    id: 'berserker',
    name: 'Grimjaw the Mad',
    class: 'berserker',
    emoji: '🪓',
    unlockCost: 50000,
    baseStats: { hp: 150, attack: 30, defense: 3, speed: 12, critChance: 0.2, critDamage: 3.0 },
    skills: [
      { id: 'frenzy', name: 'Blood Frenzy', description: '+200% ATK, -50% DEF', cooldown: 10, damage: 0, effect: 'buff_attack', effectValue: 2.0, unlockLevel: 1 },
      { id: 'rampage', name: 'Rampage', description: 'Massive AoE cleave', cooldown: 8, damage: 70, effect: 'aoe', effectValue: 0.8, unlockLevel: 10 },
      { id: 'deathwish', name: 'Deathwish', description: 'More damage at low HP', cooldown: 15, damage: 150, unlockLevel: 20 },
    ],
  },
];

export function createHero(templateId: string): Hero {
  const t = heroTemplates.find(h => h.id === templateId);
  if (!t) throw new Error(`Unknown hero: ${templateId}`);
  return {
    id: t.id,
    name: t.name,
    class: t.class,
    level: 1,
    xp: 0,
    xpToNext: 100,
    baseStats: { ...t.baseStats, maxHp: t.baseStats.hp },
    equipment: { weapon: null, armor: null, accessory: null },
    skills: t.skills.map(s => ({ ...s, currentCooldown: 0 })),
    unlocked: t.unlockCost === 0,
    emoji: t.emoji,
  };
}

export function getHeroUnlockCost(heroId: string): number {
  return heroTemplates.find(h => h.id === heroId)?.unlockCost ?? Infinity;
}

export function getAllHeroTemplates() {
  return heroTemplates;
}

export function createAllHeroes(): Hero[] {
  return heroTemplates.map(t => createHero(t.id));
}
