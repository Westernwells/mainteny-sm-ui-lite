export const capitalize = (role: any[]) => {
  let roles = '';
  role.forEach((value: string, index: number) => {
    const item = value
      .split('_')
      .map((x) => `${x[0]}${x.slice(1).toLowerCase()}`)
      .join(' ');

    if (index > 0) {
      roles += `, ${item}`;
    } else {
      roles = item;
    }
  });
  return roles;
};

export const formatSearchParamsPageIndex = (
  pageIndex: number,
  queryParams: URLSearchParams,
) => {
  const currentParams = Object.fromEntries([...queryParams]);
  return {...currentParams, pageIndex: pageIndex.toString()};
};

export const formatSearchParams = (
  options: {[key: string]: string},
  queryParams: URLSearchParams,
) => {
  const currentParams = Object.fromEntries([...queryParams]);
  return {...currentParams, ...options};
};

export const formatSearchParamsPageSize = (
  newPageSize: number,
  queryParams: URLSearchParams,
) => {
  const currentParams = Object.fromEntries([...queryParams]);
  return {...currentParams, pageSize: newPageSize.toString()};
};

// Converts macro to text, eg: 'SERVICE_MANAGER' -> 'Service Manager'
export const convertToText = (macro: string) =>
  macro
    .toLowerCase()
    .split('_')
    .join(' ')
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

// Converts text to macro, eg: 'Service Manager' -> 'SERVICE_MANAGER'
export const convertToMacro = (text: string) =>
  text.toUpperCase().split(' ').join('_');

export const removeFromList = (remove: any[], from: any[]) =>
  from.filter((item) => !remove.includes(item));

export const twentyFourHourTime = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

export const daysTime: {[key: number]: string[]}[] = [
  {0: twentyFourHourTime},
  {1: twentyFourHourTime},
  {2: twentyFourHourTime},
  {3: twentyFourHourTime},
  {4: twentyFourHourTime},
  {5: twentyFourHourTime},
  {6: twentyFourHourTime},
];

export const languageMap: {[key: string]: string} = {
  'en-US': 'en-us',
  'de-DE': 'de-de',
};

export const getDataGridHeight = (
  currentTotal: number,
  maxItems: number,
  headerHeight?: number,
) => {
  const height = headerHeight || 50;
  if (currentTotal === 0) {
    return 70 * 3 + height;
  }
  if (currentTotal >= maxItems) {
    return 52 * maxItems + height;
  }

  return 52 * currentTotal + height;
};

export const padNumber = (num: number) => (num < 10 ? `0${num}` : num);
