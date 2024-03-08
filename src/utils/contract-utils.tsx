import {
  differenceInDays,
  endOfDay,
  isBefore,
  startOfDay,
  subMonths,
} from 'date-fns';
import {
  ContractComponentElevator,
  ContractComponentRecord,
  ContractComponentView,
  ContractElevatorView,
  ContractServiceFormElevator,
  ContractStatus,
  ContractTimeUnit,
  ContractTypes,
  ContractView,
  ExtendedContractComponentRecord,
  UpdateContractComponents,
} from 'models/contract';
import {toDate, toRestDate} from 'utils/datetime';
import {ElevatorView} from 'models/elevator';

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

export const getStartEndPrice = (price: number[][]) => {
  const numbers =
    price.length &&
    price?.reduce<number[]>((acc, item) => [...acc, ...item], []);

  const newPrice = numbers && numbers.length ? numbers : [-9999999, 9999999];

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

export const calculateContractInvoicePriceTotal = (
  array?: ContractComponentElevator[],
) => {
  let totalPrice: number = 0;

  array?.forEach((item: ContractComponentElevator) => {
    if (item?.invoiceJob?.timeNumbers) {
      const timeNumbersLength: number = item.invoiceJob.timeNumbers.length;
      const itemPrice: number = item.price;
      const itemTotalPrice: number = timeNumbersLength
        ? timeNumbersLength * itemPrice
        : itemPrice;

      totalPrice += itemTotalPrice;
    }
  });

  return totalPrice;
};

export const componentsToMutate = (
  components: ContractComponentView[],
): UpdateContractComponents[] =>
  components?.map((c) => ({
    firstInvoiceDate: c.additionalInfo?.firstInvoiceDate,
    firstOrderDate: c.additionalInfo?.firstOrderDate,
    group: c?.group,
    name: c.name,
    costPackage: c.additionalInfo?.costPackage,
    costType: c.additionalInfo?.costType,
    elevators: c.additionalInfo?.elevators,
  })) as UpdateContractComponents[];

export const calculateContractInvoiceRowPrice = (
  elevatorRow: ContractServiceFormElevator,
) => {
  if (elevatorRow?.invoiceJob?.timeNumbers?.length) {
    return elevatorRow.invoiceJob.timeNumbers.length * elevatorRow.price;
  }

  return elevatorRow.price;
};

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

export const getUniqueInvoiceJobTimeNumbers = (
  inputArray: ContractServiceFormElevator[] | ContractComponentElevator[],
) => {
  const uniqueTimeNumbers = new Set<number>();

  inputArray?.forEach((item) => {
    item.invoiceJob.timeNumbers?.forEach((number) => {
      uniqueTimeNumbers.add(number);
    });
  });

  return Array.from(uniqueTimeNumbers).sort((a, b) => a - b);
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
      group,
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

    const contractComponentRecord: ContractComponentRecord = {
      name,
      group: groupNumber !== null ? String(groupNumber) : group,
      elevators: convertedElevators,
      firstInvoiceDate: convertFirstInvoiceDateToDate
        ? toRestDate(convertFirstInvoiceDateToDate)
        : '',
      firstOrderDate: convertFirstOrderDateToDate
        ? toRestDate(convertFirstOrderDateToDate)
        : '',
      costType,
      costPackage,
    };

    return contractComponentRecord;
  });

export const parsElevatorRecourses = (
  elevatorResource: ContractElevatorView[] | ElevatorView[],
) =>
  elevatorResource?.map((elevator) => {
    const {contracts, id} = elevator;
    const foundElevator = contracts
      ?.flatMap(
        (contract) =>
          contract?.components?.flatMap(
            (component) => component?.additionalInfo?.elevators || [],
          ) ?? [],
      )
      .find((e) => id === e.elevatorId);
    return {
      elevatorId: elevator.id,
      invoiceJob: foundElevator?.invoiceJob || {
        timeUnit: ContractTimeUnit.MONTHLY,
        timeNumbers: [],
      },
      orderGenerationJob: foundElevator?.orderGenerationJob || {
        timeUnit: ContractTimeUnit.MONTHLY,
        timeNumbers: [],
      },
      price: foundElevator?.price || 0,
      externalId: elevator?.externalId || 'Unassigned',
      address: elevator.address.fullName || '-',
      buildingLocation: elevator.additionalInfo.buildingLocation || '-',
      isChecked: false,
    };
  });

export const mergeElevators = (
  elevatorResource: ContractElevatorView[] | ElevatorView[],
  elevatorsFromRow: ContractComponentView,
) => {
  const infoMap = (elevatorsFromRow.additionalInfo?.elevators || []).reduce(
    (map, elevator) => {
      map[elevator.elevatorId] = elevator;
      return map;
    },
    {} as Record<string, ContractServiceFormElevator>,
  );

  return parsElevatorRecourses(elevatorResource || []).map((elevator) => ({
    ...elevator,
    ...(infoMap[elevator.elevatorId] || {}),
    isChecked: Boolean(infoMap[elevator.elevatorId]),
  }));
};

export const getElevatorDataByElevator = (
  elevatorResource: ContractElevatorView[] | ElevatorView[],
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

export const calculateFormContractInvoicePriceTotal = (
  array?: ContractComponentElevator[],
) => {
  let totalPrice: number = 0;

  array?.forEach((item: ContractComponentElevator) => {
    if (item?.isChecked && item?.invoiceJob?.timeNumbers) {
      const timeNumbersLength: number = item.invoiceJob.timeNumbers.length;
      const itemPrice: number = item.price;
      const itemTotalPrice: number = timeNumbersLength
        ? timeNumbersLength * itemPrice
        : itemPrice;

      totalPrice += itemTotalPrice;
    }
  });

  return totalPrice;
};
