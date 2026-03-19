import { useState } from 'react';
import { GameState, GameAction, Equipment, Hero } from '../engine/types';
import { formatNumber, getRarityColor } from '../engine/format';
import { getEquipmentSellValue } from '../data/equipment';

interface Props {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function ItemCard({ item, onAction, actionLabel, actionColor }: {
  item: Equipment;
  onAction: () => void;
  actionLabel: string;
  actionColor: string;
}) {
  const color = getRarityColor(item.rarity);
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color }}>{item.name}</div>
          <div className="text-[9px] opacity-40 capitalize">{item.rarity} · Lv.{item.level} · {item.slot}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {item.stats.attack && <span className="text-[9px] bg-ruby-500/20 text-ruby-400 px-1 rounded">+{item.stats.attack} ATK</span>}
        {item.stats.defense && <span className="text-[9px] bg-soul-400/20 text-soul-400 px-1 rounded">+{item.stats.defense} DEF</span>}
        {item.stats.hp && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">+{item.stats.hp} HP</span>}
        {item.stats.speed && <span className="text-[9px] bg-white/10 text-white/60 px-1 rounded">+{item.stats.speed} SPD</span>}
        {item.stats.critChance && <span className="text-[9px] bg-gold-500/20 text-gold-400 px-1 rounded">+{(item.stats.critChance * 100).toFixed(0)}% CRIT</span>}
        {item.stats.critDamage && <span className="text-[9px] bg-gold-500/20 text-gold-400 px-1 rounded">+{(item.stats.critDamage * 100).toFixed(0)}% CDMG</span>}
      </div>
      <button
        className={`w-full py-1 rounded text-[10px] font-medium transition-all active:scale-95`}
        style={{ background: `${actionColor}20`, color: actionColor, borderColor: `${actionColor}40` }}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function EquipmentPanel({ state, dispatch }: Props) {
  const [selectedHero, setSelectedHero] = useState<string>(state.heroes.find(h => h.unlocked)?.id ?? '');
  const hero = state.heroes.find(h => h.id === selectedHero);

  const unlockedHeroes = state.heroes.filter(h => h.unlocked);

  return (
    <div className="h-full overflow-y-auto px-3 py-2">
      {/* Hero selector */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {unlockedHeroes.map(h => (
          <button
            key={h.id}
            className={`flex-shrink-0 px-2 py-1 rounded text-xs transition-all ${
              selectedHero === h.id
                ? 'bg-crystal-500/20 text-crystal-400 border border-crystal-500/30'
                : 'bg-white/5 text-white/40 border border-white/5'
            }`}
            onClick={() => setSelectedHero(h.id)}
          >
            {h.emoji} {h.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Currently equipped */}
      {hero && (
        <div className="mb-3">
          <div className="text-[10px] opacity-40 mb-1 uppercase tracking-wider">Equipped</div>
          <div className="space-y-1">
            {(['weapon', 'armor', 'accessory'] as const).map(slot => {
              const item = hero.equipment[slot];
              return item ? (
                <ItemCard
                  key={slot}
                  item={item}
                  onAction={() => dispatch({ type: 'UNEQUIP_ITEM', heroId: hero.id, slot })}
                  actionLabel="Unequip"
                  actionColor="#9ca3af"
                />
              ) : (
                <div key={slot} className="bg-white/3 rounded-lg p-2 border border-dashed border-white/10 text-center">
                  <span className="text-[10px] opacity-20 capitalize">{slot} — empty</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory */}
      <div className="text-[10px] opacity-40 mb-1 uppercase tracking-wider">
        Inventory ({state.inventory.length}/30)
      </div>
      {state.inventory.length === 0 ? (
        <div className="text-center py-6 opacity-20 text-xs">
          Kill monsters to find loot!
        </div>
      ) : (
        <div className="space-y-1">
          {state.inventory
            .sort((a, b) => {
              const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
              return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
            })
            .map(item => (
              <div key={item.id} className="flex gap-1">
                <div className="flex-1">
                  <ItemCard
                    item={item}
                    onAction={() => hero && dispatch({ type: 'EQUIP_ITEM', heroId: hero.id, itemId: item.id })}
                    actionLabel={hero ? `Equip on ${hero.name.split(' ')[0]}` : 'Select hero'}
                    actionColor="#8b5cf6"
                  />
                </div>
                <button
                  className="self-end px-2 py-1 rounded text-[9px] bg-white/5 text-gold-400 border border-white/5 active:scale-95"
                  onClick={() => dispatch({ type: 'SELL_ITEM', itemId: item.id })}
                  title={`Sell for ${formatNumber(getEquipmentSellValue(item))}g`}
                >
                  💰 {formatNumber(getEquipmentSellValue(item))}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
