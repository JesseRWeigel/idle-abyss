import { MonsterTemplate, Monster } from '../engine/types';

// Monster pools by biome/theme
const monsterPools: MonsterTemplate[][] = [
  // Floors 1-10: Dungeon Entrance
  [
    { name: 'Goblin Scout', emoji: '👺', baseHp: 30, baseAttack: 5, baseDefense: 2, baseSpeed: 8, baseGold: 5, baseXp: 10, isBoss: false },
    { name: 'Giant Rat', emoji: '🐀', baseHp: 20, baseAttack: 4, baseDefense: 1, baseSpeed: 10, baseGold: 3, baseXp: 8, isBoss: false },
    { name: 'Skeleton', emoji: '💀', baseHp: 35, baseAttack: 6, baseDefense: 3, baseSpeed: 6, baseGold: 7, baseXp: 12, isBoss: false },
    { name: 'Slime', emoji: '🟢', baseHp: 25, baseAttack: 3, baseDefense: 5, baseSpeed: 4, baseGold: 4, baseXp: 9, isBoss: false },
  ],
  // Floors 11-25: Dark Caverns
  [
    { name: 'Cave Troll', emoji: '👹', baseHp: 80, baseAttack: 12, baseDefense: 8, baseSpeed: 5, baseGold: 15, baseXp: 25, isBoss: false },
    { name: 'Dark Spider', emoji: '🕷️', baseHp: 45, baseAttack: 14, baseDefense: 4, baseSpeed: 12, baseGold: 12, baseXp: 20, isBoss: false },
    { name: 'Ghost', emoji: '👻', baseHp: 55, baseAttack: 10, baseDefense: 2, baseSpeed: 14, baseGold: 18, baseXp: 22, isBoss: false },
    { name: 'Mushroom Fiend', emoji: '🍄', baseHp: 60, baseAttack: 8, baseDefense: 10, baseSpeed: 6, baseGold: 14, baseXp: 18, isBoss: false },
  ],
  // Floors 26-50: Infernal Depths
  [
    { name: 'Fire Elemental', emoji: '🔥', baseHp: 120, baseAttack: 22, baseDefense: 10, baseSpeed: 9, baseGold: 30, baseXp: 45, isBoss: false },
    { name: 'Demon Imp', emoji: '😈', baseHp: 90, baseAttack: 18, baseDefense: 8, baseSpeed: 13, baseGold: 25, baseXp: 35, isBoss: false },
    { name: 'Lava Golem', emoji: '🌋', baseHp: 200, baseAttack: 15, baseDefense: 20, baseSpeed: 4, baseGold: 40, baseXp: 50, isBoss: false },
    { name: 'Hellhound', emoji: '🐕‍🦺', baseHp: 100, baseAttack: 25, baseDefense: 6, baseSpeed: 16, baseGold: 28, baseXp: 40, isBoss: false },
  ],
  // Floors 51-100: Frozen Abyss
  [
    { name: 'Ice Wraith', emoji: '🥶', baseHp: 180, baseAttack: 30, baseDefense: 15, baseSpeed: 11, baseGold: 55, baseXp: 70, isBoss: false },
    { name: 'Frost Giant', emoji: '🏔️', baseHp: 350, baseAttack: 25, baseDefense: 25, baseSpeed: 5, baseGold: 65, baseXp: 80, isBoss: false },
    { name: 'Crystal Golem', emoji: '💎', baseHp: 280, baseAttack: 20, baseDefense: 30, baseSpeed: 6, baseGold: 70, baseXp: 75, isBoss: false },
    { name: 'Banshee', emoji: '👻', baseHp: 150, baseAttack: 35, baseDefense: 8, baseSpeed: 15, baseGold: 60, baseXp: 65, isBoss: false },
  ],
  // Floors 101+: The Void
  [
    { name: 'Void Walker', emoji: '🌀', baseHp: 400, baseAttack: 50, baseDefense: 25, baseSpeed: 12, baseGold: 100, baseXp: 120, isBoss: false },
    { name: 'Shadow Dragon', emoji: '🐉', baseHp: 600, baseAttack: 40, baseDefense: 35, baseSpeed: 10, baseGold: 130, baseXp: 150, isBoss: false },
    { name: 'Eldritch Horror', emoji: '🦑', baseHp: 500, baseAttack: 55, baseDefense: 20, baseSpeed: 8, baseGold: 120, baseXp: 140, isBoss: false },
    { name: 'Abyssal Knight', emoji: '🛡️', baseHp: 450, baseAttack: 45, baseDefense: 40, baseSpeed: 9, baseGold: 110, baseXp: 130, isBoss: false },
  ],
];

const bossTemplates: MonsterTemplate[] = [
  { name: 'Goblin King', emoji: '👑', baseHp: 200, baseAttack: 15, baseDefense: 8, baseSpeed: 7, baseGold: 100, baseXp: 80, isBoss: true },
  { name: 'Spider Queen', emoji: '🕸️', baseHp: 400, baseAttack: 25, baseDefense: 12, baseSpeed: 10, baseGold: 250, baseXp: 150, isBoss: true },
  { name: 'Inferno Lord', emoji: '👿', baseHp: 800, baseAttack: 40, baseDefense: 18, baseSpeed: 8, baseGold: 500, baseXp: 300, isBoss: true },
  { name: 'Lich King', emoji: '☠️', baseHp: 1500, baseAttack: 55, baseDefense: 25, baseSpeed: 9, baseGold: 1000, baseXp: 500, isBoss: true },
  { name: 'The Void Emperor', emoji: '🌑', baseHp: 3000, baseAttack: 80, baseDefense: 40, baseSpeed: 11, baseGold: 2000, baseXp: 1000, isBoss: true },
];

function getMonsterPool(floor: number): MonsterTemplate[] {
  if (floor <= 10) return monsterPools[0];
  if (floor <= 25) return monsterPools[1];
  if (floor <= 50) return monsterPools[2];
  if (floor <= 100) return monsterPools[3];
  return monsterPools[4];
}

function getBossTemplate(floor: number): MonsterTemplate {
  const bossIndex = Math.min(Math.floor(floor / 10), bossTemplates.length - 1);
  return bossTemplates[bossIndex];
}

// Scale monster stats based on floor
function scaleStats(base: number, floor: number): number {
  return Math.floor(base * Math.pow(1.12, floor - 1));
}

export function spawnMonster(floor: number, isBoss: boolean): Monster {
  const template = isBoss
    ? getBossTemplate(floor)
    : getMonsterPool(floor)[Math.floor(Math.random() * getMonsterPool(floor).length)];

  const scaledHp = scaleStats(template.baseHp, floor);
  const bossMultiplier = isBoss ? 5 : 1;

  return {
    id: `monster_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: template.name,
    emoji: template.emoji,
    hp: scaledHp * bossMultiplier,
    maxHp: scaledHp * bossMultiplier,
    attack: scaleStats(template.baseAttack, floor),
    defense: scaleStats(template.baseDefense, floor),
    speed: template.baseSpeed,
    goldReward: Math.floor(scaleStats(template.baseGold, floor) * (isBoss ? 10 : 1)),
    xpReward: Math.floor(scaleStats(template.baseXp, floor) * (isBoss ? 5 : 1)),
    isBoss: template.isBoss,
  };
}

export function getMonstersPerFloor(floor: number): number {
  return 8 + Math.floor(floor / 5);
}

export function getFloorName(floor: number): string {
  if (floor <= 10) return 'Dungeon Entrance';
  if (floor <= 25) return 'Dark Caverns';
  if (floor <= 50) return 'Infernal Depths';
  if (floor <= 100) return 'Frozen Abyss';
  return 'The Void';
}

export function getFloorColor(floor: number): string {
  if (floor <= 10) return '#6b7280';
  if (floor <= 25) return '#8b5cf6';
  if (floor <= 50) return '#ef4444';
  if (floor <= 100) return '#06b6d4';
  return '#a855f7';
}
