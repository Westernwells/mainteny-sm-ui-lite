import {useCurrentCurrency} from 'utils/currency';
import {rangeConvertorInverse} from 'utils/contract';
import {
  MultipleSelectCheckmarks,
  Props as MultipleSelectCheckmarksProps,
} from './MultipleSelectCheckmarks';

export const PriceRangeDropdown = ({
  cost,
  costRangeConvertor,
  ...props
}: {
  cost: number[][];
  costRangeConvertor: (selectedItems: string[]) => void;
} & Partial<MultipleSelectCheckmarksProps>) => {
  const {symbol} = useCurrentCurrency();

  return (
    <MultipleSelectCheckmarks
      label="Price Range"
      options={[
        `0 - ${symbol}500`,
        `${symbol}500 - ${symbol}1,000`,
        `> ${symbol}1,000`,
      ]}
      initialSelectedItems={rangeConvertorInverse(cost, symbol)}
      getSelectedValue={(item) => costRangeConvertor(item)}
      {...props}
    />
  );
};
