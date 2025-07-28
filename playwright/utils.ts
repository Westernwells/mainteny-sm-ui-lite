export const randomEnumKey = (enumeration: {}) => {
  const keys = Object.keys(enumeration).filter(
    (k) => !(Math.abs(Number.parseInt(k, 10)) + 1),
  );
  const enumKey = keys[Math.floor(Math.random() * keys.length)];
  return enumKey;
};

/**
 * Executes an async callback a specified number of times sequentially,
 * chaining promises to avoid ESLint await-in-loop issues.
 * @param times Number of times to execute the callback
 * @param callback Async function to execute, receives current index
 */
export async function asyncLoop(
  times: number,
  callback: (index: number) => Promise<void>,
): Promise<void> {
  await Array.from({length: times}).reduce(async (prev, _, index) => {
    await prev;
    await callback(index);
  }, Promise.resolve());
}
