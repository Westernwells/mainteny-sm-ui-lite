function sortOptions(
  a: {label: string; value: string},
  b: {label: string; value: string},
) {
  const labelA = a.label.toUpperCase();
  const labelB = b.label.toUpperCase();

  let comparison = 0;
  if (labelA > labelB) {
    comparison = 1;
  } else if (labelA < labelB) {
    comparison = -1;
  }
  return comparison;
}

export default sortOptions;
