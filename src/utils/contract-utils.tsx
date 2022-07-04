export const costRangeConvertor = (selectedItems: string[]) => {
  const range: number[][] = [];
  selectedItems.forEach((item) => {
    switch (item) {
      case '0 - €500':
        range.push([0, 50000]);
        break;

      case '€500 - €1,000':
        range.push([50000, 100000]);
        break;

      case '> €1,000':
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

  const newPrice = numbers && numbers.length ? numbers : [0, 9999999];

  return [
    Math.min(...(newPrice as number[])),
    Math.max(...(newPrice as number[])),
  ];
};
