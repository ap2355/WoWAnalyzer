import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Example Report: https://www.warcraftlogs.com/reports/Mz8cTFgNkxXaJt3j/#fight=4&source=18
 */

class FelBarrage extends Analyzer {
  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  damage = 0;
  casts = 0;
  badCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_BARRAGE_DAMAGE),
      this.felBarrage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEL_BARRAGE_TALENT),
      this.felBarrageCasts,
    );
  }

  felBarrage(event) {
    this.damage += event.amount;
  }

  felBarrageCasts(event) {
    this.casts += 1;

    const hasMetaBuff = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
      event.timestamp,
    );

    if (!hasMetaBuff) {
      this.badCasts += 1;
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to cast <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} /> during{' '}
          <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} />.
        </>,
      )
        .icon(SPELLS.FEL_BARRAGE_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} /> casts without{' '}
            <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} />.
          </>,
        )
        .recommended(`No bad casts is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            A bad cast is casting Fel Barage without Metamorphosis up.
            <br />
            <br />
            {formatThousands(this.damage)} total damage
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FEL_BARRAGE_TALENT.id}>
          <ItemDamageDone amount={this.damage} /> <br />
          {this.badCasts}
          <small>
            casts without <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} />
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FelBarrage;
