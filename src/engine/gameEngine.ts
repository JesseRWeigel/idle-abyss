import { GameState, GameAction, Hero, Monster, CombatLog } from './types';
import { createAllHeroes, getHeroUnlockCost } from '../data/heroes';
import { spawnMonster, getMonstersPerFloor } from '../data/monsters';
import { createPrestigeUpgrades, calculatePrestigeShards, getPrestigeUpgradeCost, getPrestigeMultiplier, getPrestigeFlat } from '../data/prestige';
import { createAchievements } from '../data/achievements';
import { generateEquipment, getEquipmentSellValue } from '../data/equipment';

let logId = 0;
function addLog(state: GameState, text: string, type: CombatLog['type']): void {
  state.combatLog.unshift({ id: logId++, text, type, timestamp: Date.now() });
  if (state.combatLog.length > 50) state.combatLog.length = 50;
}

function getHeroEffectiveStats(hero: Hero, prestigeUpgrades: GameState['prestigeUpgrades']) {
  const dmgMult = getPrestigeMultiplier(prestigeUpgrades, 'damage');
  const hpMult = getPrestigeMultiplier(prestigeUpgrades, 'hp');
  const critBonus = getPrestigeFlat(prestigeUpgrades, 'crit');

  let attack = hero.baseStats.attack * (1 + (hero.level - 1) * 0.15) * dmgMult;
  let defense = hero.baseStats.defense * (1 + (hero.level - 1) * 0.1);
  let maxHp = hero.baseStats.maxHp * (1 + (hero.level - 1) * 0.12) * hpMult;
  let speed = hero.baseStats.speed;
  let critChance = hero.baseStats.critChance + critBonus;
  let critDamage = hero.baseStats.critDamage;

  // Equipment bonuses
  for (const slot of ['weapon', 'armor', 'accessory'] as const) {
    const eq = hero.equipment[slot];
    if (eq) {
      attack += eq.stats.attack ?? 0;
      defense += eq.stats.defense ?? 0;
      maxHp += eq.stats.hp ?? 0;
      speed += eq.stats.speed ?? 0;
      critChance += eq.stats.critChance ?? 0;
      critDamage += eq.stats.critDamage ?? 0;
    }
  }

  return { attack: Math.floor(attack), defense: Math.floor(defense), maxHp: Math.floor(maxHp), hp: Math.floor(maxHp), speed, critChance: Math.min(critChance, 0.95), critDamage };
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

function heroUpgradeCost(hero: Hero): number {
  return Math.floor(10 * Math.pow(1.25, hero.level - 1));
}

function getActiveHeroes(state: GameState): Hero[] {
  return state.heroes.filter(h => h.unlocked && state.activeHeroIds.includes(h.id));
}

function calculateDPS(state: GameState): number {
  const heroes = getActiveHeroes(state);
  let totalDps = 0;
  for (const hero of heroes) {
    const stats = getHeroEffectiveStats(hero, state.prestigeUpgrades);
    const baseDmg = Math.max(1, stats.attack - (state.currentMonster?.defense ?? 0) * 0.3);
    const avgCrit = 1 + stats.critChance * (stats.critDamage - 1);
    const hitsPerSec = stats.speed / 10;
    totalDps += baseDmg * avgCrit * hitsPerSec;
  }
  return Math.floor(totalDps);
}

export function createInitialState(): GameState {
  const heroes = createAllHeroes();
  const state: GameState = {
    gold: 0,
    totalGold: 0,
    abyssShards: 0,
    totalAbyssShards: 0,
    currentFloor: 1,
    highestFloor: 1,
    currentMonster: null,
    monstersKilled: 0,
    bossesKilled: 0,
    monstersOnFloor: getMonstersPerFloor(1),
    monstersRemainingOnFloor: getMonstersPerFloor(1),
    heroes,
    activeHeroIds: ['knight'],
    inventory: [],
    prestigeCount: 0,
    prestigeUpgrades: createPrestigeUpgrades(),
    achievements: createAchievements(),
    combatLog: [],
    floatingNumbers: [],
    dps: 0,
    tapDamage: 5,
    tapCount: 0,
    tickSpeed: 100,
    lastSaveTime: Date.now(),
    lastOnlineTime: Date.now(),
    totalPlayTime: 0,
    autoProgressEnabled: true,
    activeTab: 'dungeon',
    showOfflineEarnings: false,
    offlineEarnings: null,
    showPrestigeConfirm: false,
    notifications: [],
  };
  state.currentMonster = spawnMonster(1, false);
  return state;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  // Clone state for immutability
  const s = { ...state };
  s.heroes = state.heroes.map(h => ({ ...h, baseStats: { ...h.baseStats }, equipment: { ...h.equipment }, skills: h.skills.map(sk => ({ ...sk })) }));
  s.combatLog = [...state.combatLog];
  s.floatingNumbers = [...state.floatingNumbers];
  s.inventory = [...state.inventory];
  s.prestigeUpgrades = state.prestigeUpgrades.map(u => ({ ...u }));
  s.achievements = state.achievements.map(a => ({ ...a }));
  s.activeHeroIds = [...state.activeHeroIds];
  s.notifications = [...state.notifications];

  switch (action.type) {
    case 'TICK': {
      const dt = action.dt / 1000; // Convert to seconds
      s.totalPlayTime += action.dt;

      // Clean up old floating numbers
      const now = Date.now();
      s.floatingNumbers = s.floatingNumbers.filter(f => now - f.timestamp < 1000);

      // Spawn monster if needed
      if (!s.currentMonster) {
        if (s.monstersRemainingOnFloor <= 0) {
          // Boss fight!
          if (s.monstersRemainingOnFloor === 0) {
            s.currentMonster = spawnMonster(s.currentFloor, true);
            s.monstersRemainingOnFloor = -1; // Flag: boss active
            addLog(s, `⚠️ BOSS: ${s.currentMonster.name} appears!`, 'boss');
          }
        } else {
          s.currentMonster = spawnMonster(s.currentFloor, false);
        }
      }

      if (!s.currentMonster) return s;

      // Combat tick — each active hero attacks
      const activeHeroes = getActiveHeroes(s);
      for (const hero of activeHeroes) {
        if (!s.currentMonster || s.currentMonster.hp <= 0) break;

        const stats = getHeroEffectiveStats(hero, s.prestigeUpgrades);
        const attacksThisTick = stats.speed / 10 * dt;

        // Only attack if enough speed accumulated
        if (Math.random() < attacksThisTick) {
          let damage = Math.max(1, stats.attack - s.currentMonster.defense * 0.3);
          let isCrit = false;

          if (Math.random() < stats.critChance) {
            damage *= stats.critDamage;
            isCrit = true;
          }

          damage = Math.floor(damage);
          s.currentMonster = { ...s.currentMonster, hp: s.currentMonster.hp - damage };

          // Add floating number
          s.floatingNumbers.push({
            id: now + Math.random(),
            value: isCrit ? `${damage}!` : `${damage}`,
            x: 40 + Math.random() * 20,
            y: 30 + Math.random() * 20,
            color: isCrit ? '#fbbf24' : '#e2e8f0',
            timestamp: now,
          });
        }

        // Skill cooldown
        for (const skill of hero.skills) {
          if (skill.currentCooldown > 0) {
            skill.currentCooldown = Math.max(0, skill.currentCooldown - dt);
          }
        }
      }

      // Monster attacks heroes back (damage their HP for healing mechanic)
      if (s.currentMonster && s.currentMonster.hp > 0) {
        for (const hero of activeHeroes) {
          const monsterDmg = Math.max(1, s.currentMonster.attack * dt * 0.5 - getHeroEffectiveStats(hero, s.prestigeUpgrades).defense * 0.2);
          hero.baseStats.hp = Math.max(0, hero.baseStats.hp - monsterDmg);

          // Auto-heal when not taking damage
          if (hero.baseStats.hp < hero.baseStats.maxHp) {
            hero.baseStats.hp = Math.min(hero.baseStats.maxHp, hero.baseStats.hp + hero.baseStats.maxHp * 0.02 * dt);
          }
        }
      }

      // Check if monster died
      if (s.currentMonster && s.currentMonster.hp <= 0) {
        const monster = s.currentMonster;
        const goldMult = getPrestigeMultiplier(s.prestigeUpgrades, 'gold');
        const xpMult = getPrestigeMultiplier(s.prestigeUpgrades, 'xp');
        const goldEarned = Math.floor(monster.goldReward * goldMult);
        const xpEarned = Math.floor(monster.xpReward * xpMult);

        s.gold += goldEarned;
        s.totalGold += goldEarned;
        s.monstersKilled++;

        // Distribute XP to active heroes
        for (const hero of activeHeroes) {
          hero.xp += Math.floor(xpEarned / activeHeroes.length);
          while (hero.xp >= hero.xpToNext) {
            hero.xp -= hero.xpToNext;
            hero.level++;
            hero.xpToNext = xpForLevel(hero.level);
            hero.baseStats.maxHp = Math.floor(hero.baseStats.maxHp * 1.12);
            hero.baseStats.hp = hero.baseStats.maxHp;
            addLog(s, `⬆️ ${hero.name} reached level ${hero.level}!`, 'level');
          }
        }

        // Equipment drop
        const drop = generateEquipment(s.currentFloor);
        if (drop) {
          if (s.inventory.length < 30) {
            s.inventory.push(drop);
            addLog(s, `🎁 Found: ${drop.emoji} ${drop.name} (${drop.rarity})`, 'loot');
          } else {
            // Auto-sell if inventory full
            const sellValue = getEquipmentSellValue(drop);
            s.gold += sellValue;
            s.totalGold += sellValue;
          }
        }

        if (monster.isBoss) {
          s.bossesKilled++;
          addLog(s, `👑 BOSS DEFEATED: ${monster.name}! +${goldEarned}g`, 'kill');

          // Advance floor
          s.currentFloor++;
          s.highestFloor = Math.max(s.highestFloor, s.currentFloor);
          s.monstersOnFloor = getMonstersPerFloor(s.currentFloor);
          s.monstersRemainingOnFloor = s.monstersOnFloor;
          addLog(s, `📍 Entered Floor ${s.currentFloor}`, 'boss');
        } else {
          s.monstersRemainingOnFloor--;
        }

        s.currentMonster = null;

        // Floating gold number
        s.floatingNumbers.push({
          id: now + Math.random() + 0.5,
          value: `+${goldEarned}g`,
          x: 50,
          y: 60,
          color: '#fbbf24',
          timestamp: now,
        });
      }

      // Recalculate DPS
      s.dps = calculateDPS(s);

      // Update tap damage
      const tapMult = getPrestigeMultiplier(s.prestigeUpgrades, 'tap');
      s.tapDamage = Math.floor((5 + s.dps * 0.1) * tapMult);

      // Check achievements
      for (const achievement of s.achievements) {
        if (!achievement.unlocked && achievement.condition(s)) {
          achievement.unlocked = true;
          if (achievement.reward.type === 'gold') {
            s.gold += achievement.reward.amount;
            s.totalGold += achievement.reward.amount;
          } else if (achievement.reward.type === 'shards') {
            s.abyssShards += achievement.reward.amount;
            s.totalAbyssShards += achievement.reward.amount;
          }
          s.notifications.push(`🏆 Achievement: ${achievement.name}!`);
          addLog(s, `🏆 Achievement unlocked: ${achievement.name}!`, 'loot');
        }
      }

      return s;
    }

    case 'TAP_MONSTER': {
      if (!s.currentMonster || s.currentMonster.hp <= 0) return s;
      s.tapCount++;

      const tapMult = getPrestigeMultiplier(s.prestigeUpgrades, 'tap');
      const damage = Math.floor((5 + s.dps * 0.1) * tapMult);
      s.currentMonster = { ...s.currentMonster, hp: s.currentMonster.hp - damage };

      s.floatingNumbers.push({
        id: Date.now() + Math.random(),
        value: `${damage}`,
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 30,
        color: '#f59e0b',
        timestamp: Date.now(),
      });

      return s;
    }

    case 'UPGRADE_HERO': {
      const hero = s.heroes.find(h => h.id === action.heroId);
      if (!hero || !hero.unlocked) return s;

      const cost = heroUpgradeCost(hero);
      if (s.gold < cost) return s;

      s.gold -= cost;
      hero.level++;
      hero.xpToNext = xpForLevel(hero.level);
      hero.baseStats.maxHp = Math.floor(hero.baseStats.maxHp * 1.12);
      hero.baseStats.hp = hero.baseStats.maxHp;
      hero.baseStats.attack = Math.floor(hero.baseStats.attack * 1.08);
      hero.baseStats.defense = Math.floor(hero.baseStats.defense * 1.06);

      return s;
    }

    case 'UNLOCK_HERO': {
      const hero = s.heroes.find(h => h.id === action.heroId);
      if (!hero || hero.unlocked) return s;

      const cost = getHeroUnlockCost(action.heroId);
      if (s.gold < cost) return s;

      s.gold -= cost;
      hero.unlocked = true;
      s.activeHeroIds.push(hero.id);
      addLog(s, `🎉 ${hero.name} has joined your party!`, 'loot');
      s.notifications.push(`🎉 ${hero.name} unlocked!`);

      return s;
    }

    case 'SET_ACTIVE_HERO': {
      if (action.active) {
        if (!s.activeHeroIds.includes(action.heroId)) {
          s.activeHeroIds.push(action.heroId);
        }
      } else {
        s.activeHeroIds = s.activeHeroIds.filter(id => id !== action.heroId);
      }
      return s;
    }

    case 'EQUIP_ITEM': {
      const hero = s.heroes.find(h => h.id === action.heroId);
      const item = s.inventory.find(i => i.id === action.itemId);
      if (!hero || !item) return s;

      // Unequip current item in that slot
      const currentEquip = hero.equipment[item.slot];
      if (currentEquip) {
        s.inventory.push(currentEquip);
      }

      hero.equipment[item.slot] = item;
      s.inventory = s.inventory.filter(i => i.id !== action.itemId);
      return s;
    }

    case 'UNEQUIP_ITEM': {
      const hero = s.heroes.find(h => h.id === action.heroId);
      if (!hero) return s;

      const item = hero.equipment[action.slot];
      if (!item) return s;
      if (s.inventory.length >= 30) return s; // Inventory full

      s.inventory.push(item);
      hero.equipment[action.slot] = null;
      return s;
    }

    case 'SELL_ITEM': {
      const item = s.inventory.find(i => i.id === action.itemId);
      if (!item) return s;

      const value = getEquipmentSellValue(item);
      s.gold += value;
      s.totalGold += value;
      s.inventory = s.inventory.filter(i => i.id !== action.itemId);
      return s;
    }

    case 'USE_SKILL': {
      const hero = s.heroes.find(h => h.id === action.heroId);
      if (!hero || !s.currentMonster) return s;

      const skill = hero.skills.find(sk => sk.id === action.skillId);
      if (!skill || skill.currentCooldown > 0 || hero.level < skill.unlockLevel) return s;

      skill.currentCooldown = skill.cooldown;

      if (skill.effect === 'heal') {
        const healAmount = Math.floor(hero.baseStats.maxHp * (skill.effectValue ?? 0.3));
        for (const h of getActiveHeroes(s)) {
          h.baseStats.hp = Math.min(h.baseStats.maxHp, h.baseStats.hp + healAmount);
        }
        addLog(s, `✨ ${hero.name} uses ${skill.name}! Healed ${healAmount} HP`, 'skill');
      } else if (skill.damage > 0) {
        const stats = getHeroEffectiveStats(hero, s.prestigeUpgrades);
        const dmg = Math.floor(skill.damage * (stats.attack / 15));
        s.currentMonster = { ...s.currentMonster, hp: s.currentMonster.hp - dmg };
        addLog(s, `💥 ${hero.name} uses ${skill.name}! ${dmg} damage!`, 'skill');

        s.floatingNumbers.push({
          id: Date.now() + Math.random(),
          value: `${dmg}`,
          x: 30 + Math.random() * 40,
          y: 15 + Math.random() * 25,
          color: '#a78bfa',
          timestamp: Date.now(),
        });
      }

      return s;
    }

    case 'SHOW_PRESTIGE_CONFIRM': {
      s.showPrestigeConfirm = true;
      return s;
    }

    case 'DISMISS_PRESTIGE_CONFIRM': {
      s.showPrestigeConfirm = false;
      return s;
    }

    case 'PRESTIGE': {
      if (s.currentFloor < 10) return s; // Min floor 10 to prestige

      const shards = calculatePrestigeShards(s);
      s.abyssShards += shards;
      s.totalAbyssShards += shards;
      s.prestigeCount++;

      // Keep prestige upgrades and achievements
      const keepUpgrades = s.prestigeUpgrades;
      const keepAchievements = s.achievements;
      const keepShards = s.abyssShards;
      const keepTotalShards = s.totalAbyssShards;
      const keepPrestigeCount = s.prestigeCount;
      const keepTotalGold = s.totalGold;
      const keepMonstersKilled = s.monstersKilled;
      const keepBossesKilled = s.bossesKilled;
      const keepTapCount = s.tapCount;
      const keepHighestFloor = s.highestFloor;
      const keepTotalPlayTime = s.totalPlayTime;

      // Reset to initial state
      const fresh = createInitialState();
      Object.assign(s, fresh);

      // Restore persistent data
      s.prestigeUpgrades = keepUpgrades;
      s.achievements = keepAchievements;
      s.abyssShards = keepShards;
      s.totalAbyssShards = keepTotalShards;
      s.prestigeCount = keepPrestigeCount;
      s.totalGold = keepTotalGold;
      s.monstersKilled = keepMonstersKilled;
      s.bossesKilled = keepBossesKilled;
      s.tapCount = keepTapCount;
      s.highestFloor = keepHighestFloor;
      s.totalPlayTime = keepTotalPlayTime;
      s.showPrestigeConfirm = false;

      // Apply start bonuses
      const startGold = getPrestigeFlat(s.prestigeUpgrades, 'startGold');
      const startFloor = Math.floor(getPrestigeFlat(s.prestigeUpgrades, 'startFloor'));

      s.gold = startGold;
      if (startFloor > 1) {
        s.currentFloor = startFloor;
        s.monstersOnFloor = getMonstersPerFloor(startFloor);
        s.monstersRemainingOnFloor = s.monstersOnFloor;
        s.currentMonster = spawnMonster(startFloor, false);
      }

      addLog(s, `🔄 PRESTIGE #${s.prestigeCount}! Earned ${shards} Abyss Shards!`, 'prestige');
      s.notifications.push(`🔄 Prestige complete! +${shards} Abyss Shards`);

      return s;
    }

    case 'BUY_PRESTIGE_UPGRADE': {
      const upgrade = s.prestigeUpgrades.find(u => u.id === action.upgradeId);
      if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) return s;

      const cost = getPrestigeUpgradeCost(upgrade);
      if (s.abyssShards < cost) return s;

      s.abyssShards -= cost;
      upgrade.currentLevel++;
      return s;
    }

    case 'SET_TAB': {
      s.activeTab = action.tab;
      return s;
    }

    case 'TOGGLE_AUTO_PROGRESS': {
      s.autoProgressEnabled = !s.autoProgressEnabled;
      return s;
    }

    case 'DISMISS_OFFLINE': {
      s.showOfflineEarnings = false;
      s.offlineEarnings = null;
      return s;
    }

    case 'CLEAR_NOTIFICATIONS': {
      s.notifications = [];
      return s;
    }

    case 'LOAD_SAVE': {
      // Merge save data with initial state to handle new fields
      const initial = createInitialState();
      return { ...initial, ...action.state } as GameState;
    }

    default:
      return s;
  }
}

// Calculate offline earnings
export function calculateOfflineEarnings(state: GameState): { gold: number; time: number } {
  const now = Date.now();
  const offlineMs = now - state.lastOnlineTime;
  const maxOfflineMs = 8 * 60 * 60 * 1000; // 8 hours max
  const effectiveMs = Math.min(offlineMs, maxOfflineMs);

  if (effectiveMs < 60000) return { gold: 0, time: 0 }; // Less than 1 minute

  const goldMult = getPrestigeMultiplier(state.prestigeUpgrades, 'gold');
  const dps = calculateDPS(state);
  // Offline earns 50% of DPS rate in gold
  const goldPerSecond = dps * 0.5 * goldMult;
  const totalGold = Math.floor(goldPerSecond * (effectiveMs / 1000));

  return { gold: totalGold, time: effectiveMs };
}

export function getHeroUpgradeCost(hero: Hero): number {
  return heroUpgradeCost(hero);
}

export function getHeroStats(hero: Hero, prestigeUpgrades: GameState['prestigeUpgrades']) {
  return getHeroEffectiveStats(hero, prestigeUpgrades);
}
