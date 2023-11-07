import {AddressRecord, Coord, GeocodeAddress, Language} from 'models/misc';

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
  'sr-SP': 'sr-sp',
  'it-IT': 'it-it',
};

export const mapLanguageToLocale: {[key: string]: string} = {
  'en-us': 'enUS',
  'de-de': 'de',
  'sr-SP': 'sr',
  'it-it': 'it',
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

export const onVisibilityChange = (callback: (visible: boolean) => void) => {
  let visible: boolean = true;
  let prefix: string = '';

  const focused = () => {
    if (!visible) {
      callback((visible = true));
    }
  };

  const unfocused = () => {
    if (visible) {
      callback((visible = false));
    }
  };

  if ('hidden' in document) {
    prefix = 'h';
  } else if ('webkitHidden' in document) {
    prefix = 'webkitH';
  } else if ('mozHidden' in document) {
    prefix = 'mozH';
  } else if ('msHidden' in document) {
    prefix = 'msH';
  }
  window.onpageshow = focused;
  window.onfocus = focused;
  window.onpagehide = unfocused;
  window.onblur = unfocused;
  if (prefix) {
    visible = !document[`${prefix}idden` as keyof Document];
    document.addEventListener(
      `${prefix.substring(0, prefix.length - 1)}visibilitychange`,
      () => {
        (document[`${prefix}idden` as keyof Document] ? unfocused : focused)();
      },
    );
  }
};

export const nameToInitials = (name: string) => {
  const words = name.split(' ');
  return `${words?.[0]?.[0] ?? ''}${words?.[1]?.[0] ?? ''}`;
};

export const waitForSeconds = (seconds: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('done');
    }, seconds * 1000);
  });

export const languageContextMap: {[key: string]: Language} = {
  EN: Language.EN_US,
  DE: Language.DE_DE,
  SR: Language.SR_RS,
};

export const companyLanguageContextMap: {[key: string]: string} = {
  'de-de': 'de',
  'en-us': 'en',
  'sr-rs': 'sr',
  'it-it': 'it',
};

export const companyLanguageToUppercaseMap: {[key: string]: string} = {
  'de-de': Language.DE_DE,
  'en-us': Language.EN_US,
  'sr-rs': Language.SR_RS,
  'it-it': Language.IT_IT,
};

export const titleCase = (str: string) =>
  `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

export const getUniqueId = () => Math.random().toString(36).substring(2, 9);

export const getPercentage = (num: number, total: number) =>
  Math.round((num / total) * 100);

export const formatAddressFullname = (address: AddressRecord | null) => {
  if (!address) return null;

  const name = address?.component?.name ? address?.component?.name : '';
  const address1 = address?.component?.street ? address?.component?.street : '';
  const address2 = address?.component?.street2
    ? address?.component?.street2
    : '';
  const zip = address?.component?.postalCode
    ? address?.component?.postalCode
    : '';
  const city = address?.component?.city ? address?.component?.city : '';
  const state = address?.component?.state ? address?.component?.state : '';
  const country = address?.component?.country
    ? address?.component?.country
    : '';

  return {
    ...address,
    component: {
      name,
      street: address1,
      street2: address2,
      postalCode: zip,
      city,
      state,
      country,
    },
    fullName:
      address.fullName === null
        ? null
        : [name, address1, address2, zip, city, state, country]
            .filter((x) => x !== '')
            .join(', '),
  };
};

export const simplifyAddressCoords = (
  address?: GeocodeAddress | AddressRecord,
): Coord | null => {
  if ((address as GeocodeAddress)?.geometry) {
    const location = (address as GeocodeAddress)?.geometry?.location;

    return {
      lat: (typeof location.lat === 'number'
        ? location.lat
        : location.lat()) as number,
      lng: (typeof location.lng === 'number'
        ? location.lng
        : location.lng()) as number,
    };
  }

  if ((address as AddressRecord)?.location) {
    return {
      lat: (address as AddressRecord).location?.latitude as number,
      lng: (address as AddressRecord).location?.longitude as number,
    };
  }

  return null;
};

export const stringToTitleCase = (textString: string) =>
  textString.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
