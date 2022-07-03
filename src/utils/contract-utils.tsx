export const costRangeConvertor = (selectedItems: string[]) => {
  const range: number[][] = [];
  selectedItems.forEach((item) => {
    switch (item) {
      case '0 - €500':
        range.push([0, 500]);
        break;

      case '€500 - €1,000':
        range.push([500, 1000]);
        break;

      case '> €1,000':
        range.push([1000, 99999]);
        break;

      default:
        break;
    }
  });
  return range;
};
