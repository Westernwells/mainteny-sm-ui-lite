import {OptionWithTranslationKey} from 'models/filter';
import {ServiceOrderStatusFilter} from 'models/service-order';
import {capitalize} from 'lodash';

const getLabelKey = (key: string): string =>
  capitalize(key.split('_').join(' '));

export const createQuickFilterOptions = (
  object: Object,
): OptionWithTranslationKey[] =>
  Object.values(object).map((entry: string) => ({
    value: entry,
    labelKey: getLabelKey(entry),
  }));

export const filterOutQuickFilterOptions = ({
  options,
  statusToExclude = ['ALL'], // default case for most filter, expected to have the ALL value
}: {
  options: OptionWithTranslationKey[];
  statusToExclude?: string[];
}): OptionWithTranslationKey[] =>
  options.filter(
    (option) =>
      !statusToExclude.includes(option.value as ServiceOrderStatusFilter),
  );
