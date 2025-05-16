import {formatISO} from 'date-fns';
import * as XLSX from 'xlsx';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {get} from 'lodash';
import {TFunction} from 'i18next';
import {
  FILE_DESCRIPTION_PREFIXES,
  InvoiceStatistics,
  InvoiceStatus,
  InvoiceView,
} from 'models/invoice';

import {ElevatorDataSchemaItem} from 'models/elevator';
import {
  Address,
  AddressRecord,
  Coord,
  Currency,
  GeocodeAddress,
} from '../models/misc';
import useHighlightText from '../hooks/useHighlightText';
import {getCountryCode} from './countries';
import {
  DEFAULT_ELEVATOR_TECHNICAL_FIELD_CATEGORIES,
  DEFAULT_ELEVATOR_TECHNICAL_FIELD_NAMES,
  ESCAPE_DOT_STRING,
} from './constants';

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
  const name2 = address?.component?.name2;
  const name3 = address?.component?.name3;
  const address1 = address?.component?.street ? address?.component?.street : '';
  const address2 = address?.component?.street2 || '';
  const zip = address?.component?.postalCode || '';
  const city = address?.component?.city
    ? translate
      ? translate(address?.component?.city)
      : address?.component?.city
    : '';
  const state = address?.component?.state
    ? translate
      ? translate(address?.component?.state)
      : address?.component?.state
    : '';
  const country = address?.component?.country
    ? translate
      ? translate(address?.component?.country)
      : address?.component?.country
    : '';
  const moreInfo = address?.component?.moreInfo
    ? address?.component?.moreInfo
    : '';

  const fullName = [
    name,
    name2,
    name3,
    address1,
    address2,
    zip,
    city,
    state,
    country,
    moreInfo,
  ]
    .filter((x) => !!x && x !== '')
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
      name2,
      name3,
      street: address1,
      street2: address2,
      postalCode: zip,
      city,
      state,
      country,
      moreInfo,
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
    .integerValue(BigNumber.ROUND_HALF_UP)
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

export const getUserFullName = (userAccount?: {
  firstName?: string;
  lastName?: string;
}) => {
  if (!userAccount) {
    return '';
  }
  const {firstName = '', lastName = ''} = userAccount;
  return `${firstName} ${lastName}`.trim();
};

export const addTimeToDate = (dateObject: string | Date, timeObject: Date) => {
  if (!timeObject) return '';
  const newTime = new Date(dateObject || timeObject);
  newTime.setHours(
    timeObject.getHours(),
    timeObject.getMinutes(),
    timeObject.getSeconds(),
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
          String(get(item, propName))
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
      (value: unknown): boolean =>
        typeof value === 'string' && !!value && !isEmptyHTML(value),
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

export const removePx = (size?: string) => {
  if (!size) return size;

  const parts = size.split('px');

  return Number(parts[0]);
};

export const handleHardReload = () => {
  // Append a cache-busting query parameter
  const url = new URL(window.location.href);
  url.searchParams.set('cachebuster', `${Date.now()}`);

  // Redirect to the new URL, forcing the browser to fetch fresh resources
  window.location.replace(url.toString());
};

export const decideAttachmentURIForInvoiceEmail = ({
  invoiceUploadPath,
  invoice,
  attachment,
  workReportUploadPath,
  checklistUploadPath,
}: {
  invoiceUploadPath: string;
  invoice: InvoiceView;
  attachment: FileWithPreview;
  workReportUploadPath: string;
  checklistUploadPath: string;
}) => {
  const isInvoiceFile = attachment.description?.includes(
    FILE_DESCRIPTION_PREFIXES.INVOICE,
  );
  const isDraftInvoice = invoice.status === InvoiceStatus.DRAFT;

  const isAttachedFile = attachment.path && !attachment.description;
  const isWorkReportFile = attachment.description?.includes(
    FILE_DESCRIPTION_PREFIXES.WORK_REPORT,
  );
  const isChecklistFile = attachment.description?.includes(
    FILE_DESCRIPTION_PREFIXES.CHECKLIST,
  );
  let uploadPath = '';

  if (isAttachedFile || isInvoiceFile) {
    uploadPath = invoiceUploadPath;
  } else if (isWorkReportFile) {
    uploadPath = workReportUploadPath;
  } else if (isChecklistFile) {
    uploadPath = checklistUploadPath;
  }

  if (isInvoiceFile) {
    const isPDF = attachment.description?.endsWith('pdf');

    if (isDraftInvoice) {
      return isPDF
        ? `${invoiceUploadPath}/${invoice?.id}.pdf`
        : `${invoiceUploadPath}/${invoice?.id}.xml`;
    }

    return isPDF
      ? invoice?.additionalInfo.pdfPath!
      : invoice?.additionalInfo.xmlPath;
  }

  return `${uploadPath}/${attachment.name}`;
};

export const decideAttachmentDescriptionForInvoiceEmail = (
  attachment: FileWithPreview,
) => {
  const noFileDescription = attachment.path && !attachment.description;
  const fileName = attachment.name;
  const fileExtension = fileName?.split('.')?.pop() || '';
  const fileNameWithoutExtension = fileName.substring(
    0,
    fileName.lastIndexOf('.'),
  );

  return noFileDescription
    ? `${fileNameWithoutExtension}.${fileExtension}`
    : attachment?.description;
};

export const applyCountryCode = (address?: AddressRecord | Address | null) =>
  address && {
    ...address,
    ...(address.component?.country && {
      countryCode: getCountryCode(address.component.country),
    }),
  };

export const getRandomIntInRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const removeControlCharsAndSpaces = (str: string) =>
  str.replace(/\p{C}/gu, '').replaceAll(' ', '').replaceAll('\n', '');

export const lowerCaseAndJoinByHyphen = (str: string) =>
  str.toLowerCase().split(' ').join('-');

export const createExcelContent = ({
  headers,
  rows,
  sheetName = 'Sheet 1',
}: {
  headers: string[];
  rows: string[][];
  sheetName?: string;
}) => {
  const worksheetData = [headers, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const workbookBinary = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  return workbookBinary;
};

export const isElevatorDataSchemaItemChanged = (
  originalItem: ElevatorDataSchemaItem,
  newItem: ElevatorDataSchemaItem,
) => {
  const isNameChanged = originalItem.name !== newItem.name;
  const isTypeChanged = originalItem.type !== newItem.type;
  const isUnitChanged = originalItem.unit !== newItem.unit;

  return isNameChanged || isTypeChanged || isUnitChanged;
};

export const getTechnicalFieldName = (
  type?: {name: string},
  t?: TFunction<'translation', undefined>,
) => {
  if (!type) {
    return '';
  }

  if (!t) {
    return type.name;
  }

  const {name} = type;

  if (DEFAULT_ELEVATOR_TECHNICAL_FIELD_NAMES.includes(name.toLowerCase())) {
    return t!(name);
  }

  return name;
};

export const getTechnicalFieldCategory = (
  type?: {name: string},
  t?: TFunction<'translation', undefined>,
) => {
  if (!type) {
    return '';
  }

  if (!t) {
    return type.name;
  }

  const {name} = type;
  if (
    DEFAULT_ELEVATOR_TECHNICAL_FIELD_CATEGORIES.includes(name.toLowerCase())
  ) {
    return t!(name);
  }

  return name;
};

export const escapeDotInString = (str: string): string =>
  str.replace(/\./g, ESCAPE_DOT_STRING); // Escape all dots

export const restoreDotInString = (str: string): string =>
  str.replace(new RegExp(ESCAPE_DOT_STRING, 'g'), '.'); // Restore dots

export const formatAutocompleteAddress = (
  currentValues: Address | null,
  componentAddress?: AddressRecord,
) => {
  if (!componentAddress) {
    const newValues = {
      ...(currentValues ?? {}),
      component: {
        ...(currentValues?.component ?? {}),
        street: '',
      },
      id: currentValues?.id!,
      fullName: '',
    };

    return newValues;
  }

  const newValues = {
    ...(componentAddress ?? {}),
    component: {
      ...(currentValues?.component ?? {}),
      ...(componentAddress?.component ?? {}),
    },
    id: currentValues?.id!,
    fullName: componentAddress?.fullName || '',
  };

  return newValues;
};

export const aggregateInvoiceStatistics = (
  currency: Currency,
  invoiceStatistics?: InvoiceStatistics,
) => {
  const CURRENCY = currency.code;
  const numOfInvoicesPerStatus =
    invoiceStatistics?.numOfInvoicesPerStatus ?? {};
  const noOfPaidStatus = numOfInvoicesPerStatus[InvoiceStatus.PAID] ?? 0;
  const noOfUnPaidStatus = numOfInvoicesPerStatus[InvoiceStatus.NOT_PAID] ?? 0;
  const noOfOverdueStatus = numOfInvoicesPerStatus[InvoiceStatus.EXPIRED] ?? 0;
  const noOfOverdueNotice1Status =
    numOfInvoicesPerStatus[InvoiceStatus.OVERDUE_NOTICE_1] ?? 0;
  const noOfOverdueNotice2Status =
    numOfInvoicesPerStatus[InvoiceStatus.OVERDUE_NOTICE_2] ?? 0;
  const noOfOverdueNotice3Status =
    numOfInvoicesPerStatus[InvoiceStatus.OVERDUE_NOTICE_3] ?? 0;
  const noOfPartiallyPaidStatus =
    numOfInvoicesPerStatus[InvoiceStatus.PARTIALLY_PAID] ?? 0;
  const amountsPerStatus = invoiceStatistics?.amountsPerStatus ?? {};

  const sentInvoiceAmount =
    amountsPerStatus[InvoiceStatus.NOT_PAID]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const paidInvoiceAmount =
    amountsPerStatus[InvoiceStatus.PAID]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const partiallyPaidInvoiceAmount =
    amountsPerStatus[InvoiceStatus.PARTIALLY_PAID]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const overdueInvoiceAmount =
    amountsPerStatus[InvoiceStatus.EXPIRED]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const overdue1InvoiceAmount =
    amountsPerStatus[InvoiceStatus.OVERDUE_NOTICE_1]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const overdue2InvoiceAmount =
    amountsPerStatus[InvoiceStatus.OVERDUE_NOTICE_2]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const overdue3InvoiceAmount =
    amountsPerStatus[InvoiceStatus.OVERDUE_NOTICE_3]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;

  const statusesCount = {
    total:
      noOfUnPaidStatus +
      noOfOverdueStatus +
      noOfOverdueNotice1Status +
      noOfOverdueNotice2Status +
      noOfOverdueNotice3Status +
      noOfPaidStatus +
      noOfPartiallyPaidStatus,
    overdue:
      noOfOverdueStatus +
      noOfOverdueNotice1Status +
      noOfOverdueNotice2Status +
      noOfOverdueNotice3Status,
  };
  const statusesAmount = {
    total:
      sentInvoiceAmount +
      paidInvoiceAmount +
      partiallyPaidInvoiceAmount +
      overdueInvoiceAmount +
      overdue1InvoiceAmount +
      overdue2InvoiceAmount +
      overdue3InvoiceAmount,
    paid: paidInvoiceAmount + partiallyPaidInvoiceAmount,
    pending:
      sentInvoiceAmount +
      overdueInvoiceAmount +
      overdue1InvoiceAmount +
      overdue2InvoiceAmount +
      overdue3InvoiceAmount,
  };

  return {statusesCount, statusesAmount};
};

export const calculatePercentChange = (
  oldValue?: number,
  newValue?: number,
) => {
  if (!oldValue || !newValue) return 0;
  const change = ((newValue - oldValue) / oldValue) * 100;
  return parseFloat(change.toFixed(2));
};
