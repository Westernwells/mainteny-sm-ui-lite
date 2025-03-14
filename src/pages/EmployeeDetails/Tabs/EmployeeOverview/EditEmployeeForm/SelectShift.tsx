import {
  WEEK_DAYS_ARRAY,
  WEEK_DAYS_WITHOUT_WEEKENDS,
  WEEKEND_DAYS,
} from 'utils/datetime';
import Shift from 'components/Shift';
import {
  EmployeeAccountData,
  ShiftEntry,
  ShiftForm,
  TimeWindowType,
} from 'models/employee';
import Box from '@mui/material/Box';
import {Divider} from '@mui/material';
import React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {FormikErrors} from 'formik';

type Props = {
  values: ShiftForm;
  errors: FormikErrors<EmployeeAccountData>;
  setFieldValue: any;
  setErrors: (errors: FormikErrors<EmployeeAccountData>) => void;
};

export const SelectShift = ({
  values,
  errors,
  setFieldValue,
  setErrors,
}: Props) => {
  const theme = useTheme();

  const handleRemoveShift = (type: TimeWindowType) => () => {
    setFieldValue(`shifts.${type}`, undefined);
  };

  const handleChangeShift =
    (type: TimeWindowType) => (value: Partial<ShiftEntry> | undefined) => {
      if (!value) {
        const removedEmptyEntry = Object.fromEntries(
          Object.entries(values).filter(([key]) => key !== type),
        );
        setFieldValue(`shifts`, removedEmptyEntry);
      }
      setFieldValue(`shifts.${type}`, value);
    };

  const handleShiftCopyDown = (type: TimeWindowType) => (value: ShiftEntry) => {
    if (WEEKEND_DAYS.includes(type)) {
      const dayToChange = WEEKEND_DAYS.filter((entry) => entry !== type)[0];

      setFieldValue(`shifts.${dayToChange}`, value);
    } else {
      const index = WEEK_DAYS_WITHOUT_WEEKENDS.indexOf(type);
      const daysToChange = WEEK_DAYS_WITHOUT_WEEKENDS.slice(index);

      const newValues = daysToChange.reduce(
        (acc, entry) => ({
          ...acc,
          [entry]: value,
        }),
        values,
      );

      setFieldValue(`shifts`, newValues);
    }
  };

  return (
    <>
      {WEEK_DAYS_ARRAY.map((day) => (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <Shift
            testId={`shift-for-${day}`}
            values={values[day]}
            type={day}
            labelKey={day}
            errors={errors}
            onChange={handleChangeShift(day)}
            onCopyDown={handleShiftCopyDown(day)}
            onRemove={handleRemoveShift(day)}
            onError={setErrors}
          />

          <Divider sx={{display: 'flex', margin: `${theme.spacing(1.5)} 0`}} />
        </Box>
      ))}
    </>
  );
};
