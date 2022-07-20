import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/*
  example report: https://www.warcraftlogs.com/reports/LvmF6W4C3TgcZxj8/#fight=last
 */

const DAMAGE_SPELLS = [
  SPELLS.CHAOS_STRIKE_MH_DAMAGE,
  SPELLS.CHAOS_STRIKE_OH_DAMAGE,
  SPELLS.ANNIHILATION_MH_DAMAGE,
  SPELLS.ANNIHILATION_OH_DAMAGE,
];
const DAMAGE_INCREASE = 0.4;

class EssenceBreak extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  extraDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ESSENCE_BREAK_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS), this.damage);
  }

  damage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasEssenceBreakDebuff = target.hasBuff(SPELLS.ESSENCE_BREAK_DAMAGE.id, event.timestamp);

    if (hasEssenceBreakDebuff) {
      this.extraDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.extraDamage)} total damage`}
      >
        <BoringSpellValueText spellId={SPELLS.ESSENCE_BREAK_TALENT.id}>
          <ItemDamageDone amount={this.extraDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EssenceBreak;
