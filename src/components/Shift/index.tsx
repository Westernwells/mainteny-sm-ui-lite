import {Box, FormHelperText, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import Switch from 'components/Switch/index';
import {
  EmployeeAccountData,
  Shift as ShiftType,
  ShiftEntry,
  TimeWindowType,
} from 'models/employee';
import React, {useEffect, useMemo, useState} from 'react';
import ShiftPicker from 'components/Shift/ShiftPicker';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import useTheme from '@mui/material/styles/useTheme';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import IconButton from '@mui/material/IconButton';
import {FormikErrors} from 'formik';
import {convertToText} from 'utils/utils';

type Props = {
  type: TimeWindowType;
  values?: ShiftEntry;
  labelKey: string;
  testId?: string;
  errors: FormikErrors<EmployeeAccountData>;
  onChange: (value: Partial<ShiftEntry> | undefined) => void;
  onCopyDown: (value: ShiftEntry) => void;
  onRemove: () => void;
  onError: (errors: FormikErrors<EmployeeAccountData>) => void;
};

const DEFAULT_TIME_RANGE: ShiftType = {
  fromTime: '8:00',
  toTime: '16:00',
};

const Shift = ({
  type,
  values,
  labelKey,
  testId,
  errors,
  onChange,
  onCopyDown,
  onRemove,
  onError,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const shiftActive = useMemo(
    () => Boolean(values && !!values.firstShift),
    [values],
  );

  const [hasSecondShift, setHasSecondShift] = useState(!!values?.secondShift); // intermediate state for when we do not have yet filled second shift

  // Partial for the undefined state
  const firstShift = values?.firstShift;

  // Partial for the undefined state
  const secondShift = values?.secondShift;

  const isFirstShiftValid = !!firstShift?.fromTime && !!firstShift?.toTime;

  const isSecondShiftValid = !!secondShift?.fromTime && !!secondShift?.toTime;

  const isShiftValid = useMemo(
    () =>
      !shiftActive ||
      (isFirstShiftValid && (hasSecondShift ? isSecondShiftValid : true)),
    [secondShift, hasSecondShift, firstShift, shiftActive],
  );

  const removeSecondShift = () => {
    setHasSecondShift(false);
    onChange({...values, secondShift: undefined});
  };

  const handleToggle = () => {
    if (shiftActive) {
      onRemove();
      setHasSecondShift(false);
      onChange(undefined);
    } else {
      onChange({firstShift: DEFAULT_TIME_RANGE});
    }
  };

  const handleAddSecondShift = () => {
    setHasSecondShift(true);
  };

  const handleCopyDown = () => {
    if (isShiftValid) {
      const newData = {
        firstShift: firstShift as ShiftType,
        secondShift: secondShift ? (secondShift as ShiftType) : undefined,
      };

      onCopyDown(newData);
    }
  };

  const handleChange =
    (field: 'firstShift' | 'secondShift') =>
    (newShift: Partial<ShiftType> | undefined) => {
      onChange({...values, [field]: newShift});
    };

  useEffect(() => {
    if (!isShiftValid) {
      onError({
        ...errors,
        [`shifts.${type}`]: 'Please enter valid shift times.',
      });
    } else {
      const removedValidEntry = Object.fromEntries(
        Object.entries(errors).filter(([key]) => key !== `shifts.${type}`),
      );

      onError(removedValidEntry);
    }
  }, [isShiftValid, type, errors, onError]);

  return (
    <Box
      data-testid={testId || `shift-${type}-container`}
      sx={{
        display: 'flex',
        width: 'fill-available',
        minHeight: '38px',
        alignItems: 'flex-start',
      }}>
      {/* Top line */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: '8px',
          width: '30%',
        }}
        gap={1}>
        <Switch value={shiftActive} onChange={handleToggle} />
        <Typography>{t(convertToText(labelKey))}</Typography>
      </Box>
      {!shiftActive && (
        <Typography sx={{paddingTop: '8px'}}>
          {t('Not working this day')}
        </Typography>
      )}
      {shiftActive && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'start',
            flexDirection: 'column',
          }}
          gap={1.5}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            {/* First Shift */}
            <Box sx={{display: 'flex'}}>
              <ShiftPicker
                shift={firstShift}
                onChange={handleChange('firstShift')}
              />
              <IconButton
                disabled={hasSecondShift || !!values?.secondShift}
                onClick={handleAddSecondShift}>
                <AddIcon />
              </IconButton>

              <IconButton disabled={!isShiftValid} onClick={handleCopyDown}>
                <CopyAllIcon
                  style={{
                    display: 'flex',
                    color: theme.palette.text.secondary,
                    width: 20,
                    height: 20,
                  }}
                />
              </IconButton>
            </Box>
          </Box>
          {/* Second shift */}
          {(hasSecondShift || !!values?.secondShift) && (
            <Box sx={{display: 'flex'}}>
              <ShiftPicker
                shift={secondShift}
                minimumTime={firstShift?.toTime}
                onChange={handleChange('secondShift')}
              />
              <IconButton onClick={removeSecondShift}>
                <RemoveCircleOutlineIcon
                  sx={{color: theme.palette.error.light}}
                />
              </IconButton>
            </Box>
          )}

          {/* @ts-ignore */}
          {!!errors[`shifts.${type}`] && (
            <FormHelperText
              error
              id={`shift-error-message-${type}`}
              data-testid={`shift-error-message-${type}`}>
              {t('Please enter valid shift times.')}
            </FormHelperText>
          )}
        </Box>
      )}
    </Box>
  );
};
export default Shift;
