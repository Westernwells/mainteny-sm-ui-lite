import {
  differenceInDays,
  endOfDay,
  isBefore,
  startOfDay,
  subMonths,
} from 'date-fns';
import {
  calculateContractInvoicePriceTotal,
  CONTRACT_STATUS_FILTER,
  ContractComponentElevator,
  ContractComponentRecord,
  ContractComponentView,
  ContractElevatorView,
  ContractServiceFormElevator,
  ContractStatus,
  ContractTableRow,
  ContractTimeUnit,
  ContractTypes,
  ContractView,
  ExtendedContractComponentRecord,
  FILTER_OPTIONS_TO_STATUSES,
  STATUS_TO_FILTER_OPTION,
  UpdateContractComponents,
} from 'models/contract';
import {toDate, toRestDate} from 'utils/datetime';
import {ElevatorSimpleView, ElevatorView} from 'models/elevator';
import {OptionsObject, SnackbarKey, SnackbarMessage} from 'notistack';
import {formatCurrency} from 'utils/currency';
import {Currency} from 'models/misc';
import {Service} from 'pages/UnitDetails/Tabs/OverviewTab/ContractServices';

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

export const rangeConvertorInverse = (
  selectedItems: number[][],
  currencySymbol: string,
) => {
  const range: string[] = [];
  selectedItems.forEach((item) => {
    switch (true) {
      case item[0] === 0 && item[1] === 50000:
        range.push(`0 - ${currencySymbol}500`);
        break;

      case item[0] === 50000 && item[1] === 100000:
        range.push(`${currencySymbol}500 - ${currencySymbol}1,000`);
        break;

      case item[0] === 100000 && item[1] === 9999999:
        range.push(`> ${currencySymbol}1,000`);
        break;

      default:
        break;
    }
  });
  return range;
};

export const getStartEndPrice = (
  price: number[][],
  setDefaultToUndefined?: boolean,
) => {
  const numbers =
    price.length &&
    price?.reduce<number[]>((acc, item) => [...acc, ...item], []);

  const newPrice =
    numbers && numbers.length
      ? numbers
      : setDefaultToUndefined
      ? [undefined, undefined]
      : [-9999999, 9999999];

  return [
    Math.min(...(newPrice as number[])),
    Math.max(...(newPrice as number[])),
  ];
};

export const contractTypeMap = {
  [ContractTypes.SERVICE]: 'Maintenance',
  [ContractTypes.NON_SERVICE]: 'Non maintenance',
};

export const invoiceCycle: {[key: string]: string} = {
  '0': 'After each visit',
  '1': '1 month',
  '2': '2 months',
  '3': '3 months',
  '4': '4 months',
  '6': '6 months',
  '12': '12 months',
};

export const calculateRenewDays = (contractDetails: ContractView) => {
  const noticePeriodInMonths =
    contractDetails.additionalInfo.noticePeriodInMonth || 0;
  const contractEndTime = endOfDay(toDate(contractDetails?.end));
  const today = startOfDay(new Date());

  if (
    contractDetails.additionalInfo.autoRenewalCancelled ||
    !isBefore(today, contractEndTime)
  ) {
    return 0;
  }

  const contractEndTimeWithoutNotice = subMonths(
    contractEndTime,
    noticePeriodInMonths,
  );

  return differenceInDays(contractEndTimeWithoutNotice, today);
};

export const getContractStatusStyles = (
  status: string,
): {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
} => {
  switch (status) {
    case ContractStatus.VALID:
      return {label: 'Active', color: 'success'};
    case ContractStatus.EXPIRED:
    case ContractStatus.PENDING:
      return {label: 'Inactive', color: 'error'};
    case ContractStatus.EXPIRING:
      return {label: 'Expiring', color: 'warning'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const componentsToMutate = (
  components: ContractComponentView[],
): UpdateContractComponents[] =>
  components?.map((c) => ({
    componentId: c.id,
    firstInvoiceDate: c.additionalInfo?.firstInvoiceDate,
    firstOrderDate: c.additionalInfo?.firstOrderDate,
    group: c?.group,
    name: c.name,
    costPackage: c.additionalInfo?.costPackage,
    costType: c.additionalInfo?.costType,
    elevators: c.additionalInfo?.elevators,
    orderType: c.additionalInfo.orderType,
  })) as UpdateContractComponents[];

export const calculateContractInvoiceRowPrice = (
  elevatorRow: ContractServiceFormElevator,
) => elevatorRow.price;

export const calculateContractInvoicePriceGrandTotal = (
  parentArray: ContractComponentView[],
): number => {
  let grandTotal: number = 0;
  parentArray.forEach((parentObject) => {
    if (
      parentObject.additionalInfo.elevators &&
      Array.isArray(parentObject.additionalInfo.elevators)
    ) {
      const elevatorsTotal = calculateContractInvoicePriceTotal(
        parentObject.additionalInfo?.elevators,
      );
      grandTotal += elevatorsTotal;
    }
  });
  return grandTotal;
};

export const calculateContractInvoicePriceGrandTotalForm = (
  parentArray: ExtendedContractComponentRecord[],
): number => {
  let grandTotal: number = 0;

  parentArray.forEach((parentObject) => {
    if (parentObject.elevators && Array.isArray(parentObject.elevators)) {
      const elevatorsTotal = calculateContractInvoicePriceTotal(
        parentObject.elevators,
      );
      grandTotal += elevatorsTotal;
    }
  });

  return grandTotal;
};

export const convertExtendedRecordsToContractComponentRecords = (
  extendedContractRecords: ExtendedContractComponentRecord[],
): ContractComponentRecord[] =>
  extendedContractRecords.map((extendedContractRecord) => {
    const {
      name,
      elevators,
      firstInvoiceDate,
      firstOrderDate,
      costType,
      costPackage,
      groupNumber,
      orderType,
    } = extendedContractRecord;

    const convertedElevators: ContractComponentElevator[] = elevators.map(
      (elevator: ContractComponentElevator) => {
        const {elevatorId, invoiceJob, orderGenerationJob, price} = elevator;
        return {elevatorId, invoiceJob, orderGenerationJob, price};
      },
    );
    const convertFirstInvoiceDateToDate = firstInvoiceDate
      ? new Date(firstInvoiceDate)
      : '';
    const convertFirstOrderDateToDate = firstOrderDate
      ? new Date(firstOrderDate)
      : '';

    const group =
      groupNumber !== null
        ? String(groupNumber || '') || String(extendedContractRecord?.group)
        : '';
    const contractComponentRecord: ContractComponentRecord = {
      name,
      group,
      elevators: convertedElevators,
      firstInvoiceDate: convertFirstInvoiceDateToDate
        ? toRestDate(convertFirstInvoiceDateToDate)
        : '',
      firstOrderDate: convertFirstOrderDateToDate
        ? toRestDate(convertFirstOrderDateToDate)
        : '',
      costType,
      costPackage,
      componentId: extendedContractRecord.id,
      orderType,
    };

    return contractComponentRecord;
  });

export const parsElevatorRecourses = (
  elevatorResource:
    | ContractElevatorView[]
    | ElevatorView[]
    | ElevatorSimpleView[],
) =>
  elevatorResource?.map((elevator) => ({
    elevatorId: elevator.id,
    invoiceJob: {
      timeUnit: ContractTimeUnit.MONTHLY,
      timeNumbers: [],
    },
    orderGenerationJob: {
      timeUnit: ContractTimeUnit.MONTHLY,
      timeNumbers: [],
    },
    price: 0,
    externalId: elevator?.externalId || 'Unassigned',
    address: elevator.address.fullName || '-',
    buildingLocation: elevator.additionalInfo.buildingLocation || '-',
    isChecked: true,
  }));

export const mergeElevators = (
  elevatorResource:
    | ContractElevatorView[]
    | ElevatorView[]
    | ElevatorSimpleView[],
  elevatorsFromRow: Service,
) => {
  const existingElevators = elevatorsFromRow.additionalInfo?.elevators || [];

  const infoMap = existingElevators.reduce((map, elevator) => {
    map[elevator.elevatorId] = elevator;
    return map;
  }, {} as Record<string, ContractServiceFormElevator>);

  const hasExisting = existingElevators.length > 0;

  return parsElevatorRecourses(elevatorResource || []).map((elevator) => ({
    ...elevator,
    ...(infoMap[elevator.elevatorId] || {}),
    isChecked: hasExisting ? Boolean(infoMap[elevator.elevatorId]) : true,
  }));
};

export const mergeElevatorsByExisting = (
  elevatorResource:
    | ContractElevatorView[]
    | ElevatorView[]
    | ElevatorSimpleView[],
  elevatorsFromRow: Service,
) => {
  const existingElevators = elevatorsFromRow.additionalInfo?.elevators || [];

  const parsedElevators = parsElevatorRecourses(elevatorResource || []);

  const resourceMap = parsedElevators.reduce((map, elevator) => {
    map[elevator.elevatorId] = elevator;
    return map;
  }, {} as Record<string, (typeof parsedElevators)[0]>);

  return existingElevators.map((existingElevator) => {
    const merged = {
      ...resourceMap[existingElevator.elevatorId],
      ...existingElevator,
      isChecked: true,
    };
    return merged;
  });
};

export const getElevatorDataByElevator = (
  elevatorResource:
    | ContractElevatorView[]
    | ElevatorView[]
    | ElevatorSimpleView[],
  elevatorsFromRow: ContractComponentView,
) => {
  const infoMap = (elevatorsFromRow.additionalInfo?.elevators || []).reduce(
    (map, elevator) => {
      map[elevator.elevatorId] = elevator;
      return map;
    },
    {} as Record<string, ContractServiceFormElevator>,
  );

  return parsElevatorRecourses(elevatorResource || []).reduce(
    (acc, elevator) => {
      if (infoMap[elevator.elevatorId]) {
        acc.push({
          ...elevator,
          ...infoMap[elevator.elevatorId],
          isChecked: Boolean(infoMap[elevator.elevatorId]),
        });
      }
      return acc;
    },
    [] as ContractServiceFormElevator[],
  );
};

/**
 * Checks if services can be grouped for invoicing based on specific criteria.
 *
 * @param services An array of contract component records representing services to be checked.
 * @param enqueueSnackbar A function to display a snackbar message.
 * @returns A boolean indicating whether services can be grouped for invoicing.
 */
export const canGroupServices = (
  services: ContractComponentRecord[] | ExtendedContractComponentRecord[],
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined,
  ) => SnackbarKey,
): boolean => {
  // Check if there is a leading component
  const leadingService = services.find((service) =>
    service.elevators.some(
      (elevator) => elevator.invoiceJob?.timeUnit === ContractTimeUnit.NONE,
    ),
  );
  if (!leadingService) {
    return true;
  }

  // Check if there is only one leading service
  const numLeadingServices = services.filter((service) =>
    service.elevators.some(
      (elevator) => elevator.invoiceJob?.timeUnit === ContractTimeUnit.NONE,
    ),
  ).length;
  if (numLeadingServices > 1) {
    enqueueSnackbar(
      'You cannot create an invoice group for two or more services with the invoice cycle selected “After Job"',
      {variant: 'error'},
    );
    return false;
  }

  // Check if all elevators in the leading service have invoice cycle "After job"
  const leadingElevators = leadingService.elevators.filter(
    (elevator) => elevator.invoiceJob?.timeUnit === ContractTimeUnit.NONE,
  );
  if (leadingElevators.length !== leadingService.elevators.length) {
    enqueueSnackbar(
      'Services can not be grouped since we detected different invoice cycles within one service.',
      {variant: 'error'},
    );
    return false;
  }

  // Check if the invoice cycles of all services are subsets of the job cycles of the corresponding elevators in the leading service
  for (let i = 0; i < services.length; i += 1) {
    const service = services[i];
    if (service.id !== leadingService.id) {
      for (let j = 0; j < service.elevators.length; j += 1) {
        const elevator = service.elevators[j];
        const correspondingElevator = leadingService.elevators.find(
          (e) => e.elevatorId === elevator.elevatorId,
        );

        if (!correspondingElevator) {
          return true;
        }
        const subset = elevator.invoiceJob?.timeNumbers.every((time) =>
          correspondingElevator.orderGenerationJob?.timeNumbers.includes(time),
        );

        if (!subset) {
          enqueueSnackbar(
            'Services cannot be grouped since the invoice cycles of the selected services do not match.',
            {variant: 'error'},
          );
          return false;
        }
      }
    }
  }

  return true;
};

export const isUnitSelected = (unit: {
  isChecked?: boolean;
  isSelected?: boolean;
}) => unit.isChecked || unit.isSelected;

export const aggregateContractRow = (
  contracts: ContractView[],
  currentCurrency: Currency,
): ContractTableRow[] =>
  contracts.map((contract) => ({
    data: contract,
    id: contract.id,
    propertyOwner: contract.propertyOwner,
    number: contract.externalId,
    contractName: contract.name,
    numberOfUnits: contract.numberOfElevators,
    price: `${formatCurrency(
      contract.additionalInfo.totalYearlyPrice
        ? contract.additionalInfo.totalYearlyPrice /
            10 ** currentCurrency.fractionDigits!
        : 0,
      {
        currency: currentCurrency.code,
      },
    )}`,
    startDate: contract.start,
    endDate: contract.end,
    status: contract.status,
  }));

export const mapFilterOptionToStatus = (
  option: CONTRACT_STATUS_FILTER,
): ContractStatus[] => FILTER_OPTIONS_TO_STATUSES[option];

export const mapStatusToFilterOptions = (
  status: ContractStatus,
): CONTRACT_STATUS_FILTER => STATUS_TO_FILTER_OPTION[status];

export const transformContractViewComponentToContractRecord = (
  components: ContractComponentView[],
): ContractComponentRecord[] =>
  components.map((component) => ({
    componentId: component.id,
    name: component.name,
    group: component.group,
    elevators: component.additionalInfo.elevators.map((elevator) => ({
      elevatorId: elevator.elevatorId,
      invoiceJob: elevator.invoiceJob,
      orderGenerationJob: elevator.orderGenerationJob,
      price: elevator.price,
    })),
    firstInvoiceDate: component.additionalInfo.firstInvoiceDate
      ? component.additionalInfo.firstInvoiceDate
      : undefined,
    firstOrderDate: component.additionalInfo.firstOrderDate
      ? component.additionalInfo.firstOrderDate
      : undefined,
    costType: component.additionalInfo.costType,
    costPackage: component.additionalInfo.costPackage,
    orderType: component.additionalInfo.orderType ?? undefined,
  }));

export const getAutoJobStatus = (
  firstInvoiceDate: Date | null,
): {
  label: string;
  color: 'default' | 'darkSuccess';
} => {
  if (firstInvoiceDate) {
    return {label: 'Yes', color: 'darkSuccess'};
  }
  return {label: 'No', color: 'default'};
};
