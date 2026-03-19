import { Equipment, EquipSlot, Rarity } from '../engine/types';

interface EquipmentTemplate {
  names: string[];
  slot: EquipSlot;
  emoji: string;
  statWeights: Record<string, number>;
}

const templates: EquipmentTemplate[] = [
  { names: ['Rusty Sword', 'Iron Blade', 'Steel Longsword', 'Enchanted Saber', 'Abyssal Edge'], slot: 'weapon', emoji: '⚔️', statWeights: { attack: 1.0, critChance: 0.3, speed: 0.2 } },
  { names: ['Wooden Staff', 'Crystal Rod', 'Arcane Scepter', 'Void Catalyst', 'Elder Wand'], slot: 'weapon', emoji: '🪄', statWeights: { attack: 1.2, critDamage: 0.5 } },
  { names: ['Hunting Bow', 'Longbow', 'Composite Bow', 'Shadow Bow', 'Celestial Bow'], slot: 'weapon', emoji: '🏹', statWeights: { attack: 0.8, speed: 0.5, critChance: 0.5 } },
  { names: ['Leather Armor', 'Chain Mail', 'Plate Armor', 'Dragon Scale', 'Void Plate'], slot: 'armor', emoji: '🛡️', statWeights: { defense: 1.0, hp: 0.8 } },
  { names: ['Cloth Robe', 'Silk Vestments', 'Mage Robes', 'Arcane Mantle', 'Void Shroud'], slot: 'armor', emoji: '👘', statWeights: { defense: 0.4, hp: 0.3, attack: 0.5 } },
  { names: ['Copper Ring', 'Silver Ring', 'Gold Ring', 'Diamond Ring', 'Abyssal Signet'], slot: 'accessory', emoji: '💍', statWeights: { critChance: 0.8, critDamage: 0.6 } },
  { names: ['Bone Amulet', 'Jade Pendant', 'Ruby Necklace', 'Phoenix Charm', 'Void Heart'], slot: 'accessory', emoji: '📿', statWeights: { hp: 1.0, defense: 0.4 } },
  { names: ['Torn Cape', 'Hunter\'s Cloak', 'Shadow Cape', 'Phantom Shroud', 'Wings of the Abyss'], slot: 'accessory', emoji: '🧣', statWeights: { speed: 1.0, critChance: 0.3 } },
];

const rarityMultipliers: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.2,
  epic: 3.5,
  legendary: 6.0,
};

const rarityColors: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

function pickRarity(floor: number): Rarity {
  const roll = Math.random();
  const legendaryChance = Math.min(0.01 + floor * 0.001, 0.05);
  const epicChance = Math.min(0.03 + floor * 0.003, 0.12);
  const rareChance = Math.min(0.08 + floor * 0.005, 0.25);
  const uncommonChance = 0.30;

  if (roll < legendaryChance) return 'legendary';
  if (roll < legendaryChance + epicChance) return 'epic';
  if (roll < legendaryChance + epicChance + rareChance) return 'rare';
  if (roll < legendaryChance + epicChance + rareChance + uncommonChance) return 'uncommon';
  return 'common';
}

export function generateEquipment(floor: number): Equipment | null {
  // 15% drop chance, higher on boss floors
  const dropChance = 0.15;
  if (Math.random() > dropChance) return null;

  const template = templates[Math.floor(Math.random() * templates.length)];
  const rarity = pickRarity(floor);
  const rarityIndex = ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(rarity);
  const nameIndex = Math.min(rarityIndex, template.names.length - 1);
  const mult = rarityMultipliers[rarity];
  const basePower = 3 + floor * 2;

  const stats: Partial<Record<string, number>> = {};
  for (const [stat, weight] of Object.entries(template.statWeights)) {
    let value = basePower * weight * mult * (0.8 + Math.random() * 0.4);
    // Crit stats are percentages stored as decimals (0.05 = 5%)
    if (stat === 'critChance') {
      value = parseFloat((value * 0.01).toFixed(3)); // e.g. 5 -> 0.05
    } else if (stat === 'critDamage') {
      value = parseFloat((value * 0.05).toFixed(2)); // e.g. 5 -> 0.25
    } else {
      value = Math.floor(value);
    }
    if (value > 0) stats[stat] = value;
  }

  return {
    id: `equip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: template.names[nameIndex],
    slot: template.slot,
    rarity,
    stats: stats as Equipment['stats'],
    level: floor,
    emoji: template.emoji,
  };
}

export function getEquipmentSellValue(item: Equipment): number {
  const rarityMult = rarityMultipliers[item.rarity];
  return Math.floor(item.level * 10 * rarityMult);
}

export { rarityColors };
