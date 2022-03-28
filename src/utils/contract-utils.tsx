export const costRangeConvertor = (selectedItems: string[]) => {
  const range: number[][] = [];
  selectedItems.forEach((item) => {
    switch (item) {
      case 'Below 1000 €':
        range.push([0, 1000]);
        break;

      case '1000 - 3000 €':
        range.push([1000, 3000]);
        break;

      case '3000 - 5000 €':
        range.push([3000, 5000]);
        break;

      case 'Above 5000 €':
        range.push([5000, 99999]);
        break;

      default:
        break;
    }
  });
  return range;
};
