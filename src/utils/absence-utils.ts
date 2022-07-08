import {AbsenceForm} from 'pages/EmployeeDetails/Absence/model';
import {formatDate, getDifferenceInInterval} from './datetime';

export const getFullDate = (date: Date, typeDate: string) => {
  if (typeDate === 'start') {
    const formatedDate = `${formatDate(date, 'yyyy-MM-dd')}T00:00:00`;
    return formatedDate;
  }
  if (typeDate === 'end') {
    return `${formatDate(date, 'yyyy-MM-dd')}T23:59:59`;
  }
};

const getAbsenceType = (type: string) => {
  if (type === 'Sick') return 'SICK_LEAVE';
  return 'HOLIDAY';
};

export const convertAbsenceToNormal = (type: string) => {
  if (type === 'SICK_LEAVE') return 'Sick';
  return 'Holiday';
};

export const formatCreateAbsence = (data: AbsenceForm, employeeId: string) => ({
  employeeId,
  eventType: getAbsenceType(data.typeAbsence),
  notes: data.notes || '',
  startTime: getFullDate(
    data.duration[0] === 'Multiple days' ? data.dateStart! : data.date,
    'start',
  ),
  endTime: getFullDate(
    data.duration[0] === 'Multiple days' ? data.dateEnd! : data.date,
    'end',
  ),
});

export const formatUpdateAbsence = (data: AbsenceForm) => ({
  eventType: getAbsenceType(data.typeAbsence) || '',
  notes: data.notes || '',
  startTime:
    getFullDate(
      data.duration[0] === 'Multiple days' ? data.dateStart! : data.date,
      'start',
    ) || '',
  endTime:
    getFullDate(
      data.duration[0] === 'Multiple days' ? data.dateEnd! : data.date,
      'end',
    ) || '',
});

export const getAbsenceDate = (startDate: Date, endDate: Date) => {
  const numberOfDays = getDifferenceInInterval(startDate, endDate);

  if (numberOfDays?.days === 0) {
    return formatDate(startDate, 'dd.MM.yyyy');
  }

  return `${formatDate(startDate, 'dd.MM.yyyy')} - ${formatDate(endDate)}`;
};
