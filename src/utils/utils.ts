import {formatISO} from 'date-fns';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import lodash from 'lodash';
import {TFunction} from 'i18next';
import {AddressRecord, Coord, GeocodeAddress, Language} from '../models/misc';
import useHighlightText from '../hooks/useHighlightText';

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
  'ru-RU': 'ru-ru',
  'da-DK': 'da-dk',
  'ka-GE': 'ka-ge',
  'es-ES': 'es-es',
  'gr-GR': 'gr-gr',
  'tr-TR': 'tr-tr',
};

export const mapLanguageToLocale: {[key: string]: string} = {
  'en-us': 'enUS',
  'de-de': 'de',
  'sr-SP': 'sr',
  'it-it': 'it',
  'ru-ru': 'ru',
  'da-DK': 'da',
  'ka-GE': 'ka',
  'es-ES': 'es',
  'gr-GR': 'gr',
  'tr-TR': 'tr',
};

export const languagesToPars: {[key: string]: string} = {
  KA: 'GE',
};

export const getDataGridHeight = (
  currentTotal: number,
  maxItems: number,
  headerHeight?: number,
) => {
  const height = headerHeight || 70;
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
  RU: Language.RU_RU,
  IT: Language.IT_IT,
  DA: Language.DA_DK,
  KA: Language.KA_GE,
  ES: Language.ES_ES,
  GR: Language.GR_GR,
  TR: Language.TR_TR,
};

export const companyLanguageContextMap: {[key: string]: string} = {
  'de-de': 'de',
  'en-us': 'en',
  'sr-rs': 'sr',
  'it-it': 'it',
  'ru-ru': 'ru',
  'da-dk': 'da',
  'ka-ge': 'ka',
  'es-es': 'es',
  'gr-gr': 'gr',
  'tr-tr': 'tr',
};

export const companyLanguageToUppercaseMap: {[key: string]: string} = {
  'de-de': Language.DE_DE,
  'en-us': Language.EN_US,
  'sr-rs': Language.SR_RS,
  'it-it': Language.IT_IT,
  'ru-ru': Language.RU_RU,
  'ka-ge': Language.KA_GE,
  'es-es': Language.ES_ES,
  'gr-gr': Language.GR_GR,
  'tr-tr': Language.TR_TR,
};

export const titleCase = (str: string) =>
  `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

export const getUniqueId = () => Math.random().toString(36).substring(2, 9);

export const getPercentage = (num: number, total: number) =>
  Math.round((num / total) * 100);

export const getAmountFromPercentage = (percent: number, amount: number) =>
  (percent / 100) * amount;

export const formatAddressFullname = (
  address: AddressRecord | null | undefined,
  translate?: TFunction<'translation', 'translation'>,
) => {
  if (!address) return address;

  const name = address?.component?.name ? address?.component?.name : '';
  const address1 = address?.component?.street ? address?.component?.street : '';
  const address2 = address?.component?.street2 || '';
  const zip = address?.component?.postalCode || '';
  const city = address?.component?.city ? address?.component?.city : '';
  const state = address?.component?.state ? address?.component?.state : '';
  const country = address?.component?.country
    ? translate
      ? translate(address?.component?.country)
      : address?.component?.country
    : '';

  const fullName = [name, address1, address2, zip, city, state, country]
    .filter((x) => x !== '')
    .join(', ');

  const fullCityNameParts = [address1, address2];

  if (zip && city) {
    fullCityNameParts.push(`${zip} ${city}`);
  } else {
    fullCityNameParts.push(zip || city);
  }

  const fullCityName = fullCityNameParts.filter((x) => x !== '').join(', ');

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
    fullName,
    fullCityName,
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

// https://stackoverflow.com/a/10880710/9183715
export const fixRounding = (value: number, precision: number) => {
  const power = new BigNumber(10).pow(precision || 0);
  return new BigNumber(value)
    .times(power)
    .integerValue(BigNumber.ROUND_DOWN)
    .dividedBy(power)
    .decimalPlaces(2)
    .toNumber();
};

export const isJson = (item: string) => {
  let value;
  try {
    value = JSON.parse(item);
  } catch (e) {
    return false;
  }

  return typeof value === 'object' && value !== null;
};

export const objectKeyByValue = (obj: Record<string, any>, value: string) =>
  Object.keys(obj)[Object.values(obj).indexOf(value)];

export const dateToString = (date: Date) => formatISO(date).split('T')[0];

export const getUserFullName = ({
  firstName = '',
  lastName = '',
}: {
  firstName?: string;
  lastName?: string;
}) => `${firstName} ${lastName}`.trim();

export const addTimeToDate = (dateObject: string | Date, timeObject: Date) => {
  if (!timeObject) return '';
  const newTime = new Date(dateObject || timeObject);

  newTime.setUTCHours(
    timeObject.getUTCHours(),
    timeObject.getUTCMinutes(),
    timeObject.getUTCSeconds(),
  );

  return newTime.toISOString() ?? '';
};

export const addDateToTime = (timeObject: Date | string, dateObject: Date) => {
  if (!dateObject) return '';

  const newDate = new Date(timeObject || dateObject);

  newDate.setUTCFullYear(
    dateObject.getUTCFullYear(),
    dateObject.getUTCMonth(),
    dateObject.getUTCDate(),
  );

  return newDate?.toISOString() ?? '';
};

export const hasProtocol = (url: string) => {
  const pattern = /^(http:\/\/|https:\/\/)/;
  return pattern.test(url);
};

export const isNumber = (value: string | number) =>
  !Number.isNaN(Number(value));

export const convertToHourAndMinutes = (timeInMinutes?: number) => {
  if (timeInMinutes === undefined || Number.isNaN(timeInMinutes)) {
    return '-';
  }

  const roundedTimeInMinutes = Math.round(timeInMinutes * 100) / 100;

  const hours = Math.floor(roundedTimeInMinutes / 60);
  const remainingMinutes = Math.round(roundedTimeInMinutes % 60);

  const formattedHours = (hours < 10 ? '0' : '') + hours;
  const formattedMinutes =
    (remainingMinutes < 10 ? '0' : '') + remainingMinutes;

  return `${formattedHours}:${formattedMinutes}h`;
};

export const convertLanguageIfNeeded = (key: string) =>
  languagesToPars[key] || key;

export const getBase64FromUrl = async (url: string) => {
  const data = await fetch(url, {
    cache: 'no-store',
  });

  const contentType = data.headers.get('content-type');

  if (contentType && contentType.startsWith('image')) {
    const blob = await data.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
    });
  }
  return null;
};

export const convertBase64ToPNG = (base64Data: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Data;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context.'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image to blob.'));
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result.toString());
          } else {
            reject(new Error('Failed to read converted blob.'));
          }
        };
      }, 'image/png');
    };
    img.onerror = () => {
      reject(new Error('Failed to load the image.'));
    };
  });

export const scrollTableToBottom = () => {
  const tableElement = document.querySelector('.MuiDataGrid-virtualScroller');

  if (tableElement) {
    tableElement.scrollTop = tableElement.scrollHeight;
  }
};

export const createFilesFromBlobArray = async (
  blobs: Blob[],
  fileNames: string[],
  fileDescriptions?: string[],
): Promise<FileWithPreview[]> => {
  const files: FileWithPreview[] = [];
  blobs.forEach((blob, index) => {
    const file = new File([blob], fileNames[index], {
      type: blob.type,
    }) as FileWithPreview;
    file.preview = URL.createObjectURL(blob);
    file.description = fileDescriptions?.[index];
    files.push(file);
  });
  return files;
};

/**
 * Filters an array of objects based on a search text within specified property names.
 *
 * @param {T[] | undefined} items - The array of objects to filter.
 * @param {string} searchText - The text to search within the specified property names.
 * @param {string[]} propNames - The names of the properties to search within.
 * @return {T[]} The filtered array of objects.
 */
export const filterArrayBySearchText = <T>(
  items: T[] | undefined,
  searchText: string,
  propNames: string[],
): T[] =>
  items?.length
    ? items.filter((item) => {
        const lowerCaseSearchText = searchText.toLowerCase();
        return propNames.some((propName) =>
          String(lodash.get(item, propName))
            .toLowerCase()
            .includes(lowerCaseSearchText),
        );
      })
    : [];

export const createHighlightedText = (text: string, searchText: string) =>
  useHighlightText({
    text: text !== '' ? text : '-',
    highlight: searchText,
  });

export const formatCostText = (
  inputString: string,
  laborCost: string,
  materialCost: string,
): string => {
  if (
    inputString.includes('{LABOR_COST}') ||
    inputString.includes('{MATERIAL_COST}')
  ) {
    let modifiedString = inputString.replace('{LABOR_COST}', laborCost);
    modifiedString = modifiedString.replace('{MATERIAL_COST}', materialCost);
    return modifiedString;
  }
  return inputString;
};

export async function fetchFile(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download file');
  }
  return response.blob();
}

export const removeUndefinedAndEmptyValues = (
  obj: Record<string, any>,
): Record<string, any> =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

const isEmptyHTML = (htmlString: string) => {
  // Create a temporary div element
  const tempDiv = document.createElement('div');

  // Set its innerHTML to the provided HTML string
  tempDiv.innerHTML = htmlString.trim();

  // Check if the div contains any child nodes with actual content
  return (
    tempDiv.innerHTML === '' ||
    (tempDiv.textContent !== null && tempDiv.textContent.trim() === '')
  );
};

export const yupValidations = {
  richTextField: (message: string) =>
    Yup.mixed().test(
      'checkRichTextField',
      message,
      (value: string) => !!value && !isEmptyHTML(value),
    ),
};

export const fileListToFiles = (fileList: FileList | null) => {
  const files: File[] = [];

  if (!fileList) {
    return files;
  }

  for (let i = 0; i < fileList.length; i += 1) {
    const file = fileList.item(i);

    files.push(file!);
  }

  return files;
};

export function removeHtmlTags(str: string) {
  return str.replace(/<\/?[^>]+(>|$)/g, '');
}
