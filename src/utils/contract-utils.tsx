export const costRangeConvertor = (
  selectedItems: string[],
  currencySymbol: string,
) => {
  const range: number[][] = [];
  selectedItems.forEach((item) => {
    switch (item) {
      case `0 - ${currencySymbol}500`:
        range.push([0, 50000]);
        break;

      case `${currencySymbol}500 - ${currencySymbol}1,000`:
        range.push([50000, 100000]);
        break;

      case `> ${currencySymbol}1,000`:
        range.push([100000, 9999999]);
        break;

      default:
        break;
    }
  });
  return range;
};

export const getStartEndPrice = (price: number[][]) => {
  const numbers =
    price.length &&
    price?.reduce<number[]>((acc, item) => [...acc, ...item], []);

  const newPrice = numbers && numbers.length ? numbers : [-9999999, 9999999];

  return [
    Math.min(...(newPrice as number[])),
    Math.max(...(newPrice as number[])),
  ];
};
