import React, {useEffect, useMemo, useState} from 'react';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  Box,
  Divider,
  IconButton,
  Radio,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import {theme} from 'theme';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  ContractComponentElevator,
  ContractServiceFormElevator,
  ContractTimeUnit,
} from 'models/contract';
import {useTranslation} from 'react-i18next';
import {Button} from '../Button';
import {FormSelect} from '../form/FormSelect';
import {
  CYCLE_OPTION_TO_UNIT_TIME_MAP,
  CYCLE_OPTIONS,
  FIXED_CYCLE_TYPE,
  JOB_CYCLE_TYPE,
  UNIT_TYPE_TO_CYCLE_MAP,
} from '../../models/jobFrequency';
import {getFrequencyDisplay} from '../../utils/jobFrequency';

const monthsData = [
  {month: 'January', isSelected: false, number: 1},
  {month: 'February', isSelected: false, number: 2},
  {month: 'March', isSelected: false, number: 3},
  {month: 'April', isSelected: false, number: 4},
  {month: 'May', isSelected: false, number: 5},
  {month: 'June', isSelected: false, number: 6},
  {month: 'July', isSelected: false, number: 7},
  {month: 'August', isSelected: false, number: 8},
  {month: 'September', isSelected: false, number: 9},
  {month: 'October', isSelected: false, number: 10},
  {month: 'November', isSelected: false, number: 11},
  {month: 'December', isSelected: false, number: 12},
];

type Props = {
  componentId: string;
  units: ContractServiceFormElevator[];
  onChange: (value: ContractComponentElevator[]) => void;
  mode?: 'edit' | 'new';
};

const JobFrequencyPicker = ({
  componentId,
  units,
  onChange,
  mode = 'new',
}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(monthsData);
  const [cycleType, setCycleType] = useState<JOB_CYCLE_TYPE>(
    JOB_CYCLE_TYPE.FIXED,
  );
  const [selectedFixedCycle, setSelectedFixedCycle] =
    useState<FIXED_CYCLE_TYPE>();

  const handleFrequencyChange = (
    event: SelectChangeEvent<string | string[]>,
  ) => {
    const selectedValue = event.target.value as FIXED_CYCLE_TYPE;
    setSelectedFixedCycle(selectedValue);
  };

  // on entry
  const handleOpen = (event: any) => {
    setAnchorEl(event.currentTarget);

    // find selected unit
    const elevator = units.find(
      (elevatorItem) => elevatorItem.elevatorId === componentId,
    );

    // prepopulate fields if unit is found
    if (elevator) {
      const type =
        elevator.orderGenerationJob?.timeUnit &&
        UNIT_TYPE_TO_CYCLE_MAP.get(elevator.orderGenerationJob?.timeUnit);

      if (type) setSelectedFixedCycle(type);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedMonths(monthsData);
  };

  const foundUnit = useMemo(
    () => units.find((elevator) => componentId === elevator.elevatorId),
    [units],
  );

  const handleSave = () => {
    const formattedNumbers = selectedMonths
      .filter((item) => item.isSelected)
      .map((item) => item.number);

    const foundTimeType = selectedFixedCycle
      ? CYCLE_OPTION_TO_UNIT_TIME_MAP.get(selectedFixedCycle)
      : undefined;

    const {monthsInNumbers, timeUnit} = {
      monthsInNumbers:
        cycleType === JOB_CYCLE_TYPE.BY_MONTHS ? formattedNumbers : [],
      timeUnit:
        cycleType === JOB_CYCLE_TYPE.FIXED && foundTimeType
          ? foundTimeType
          : ContractTimeUnit.MONTHLY,
    };

    // Business logic: if changing first entry save to all other entries as well
    if (
      units.findIndex((elevator) => elevator.elevatorId === componentId) ===
        0 &&
      mode === 'new'
    ) {
      const updatedElevators = units.map((elevator) => ({
        ...elevator,
        orderGenerationJob: {
          ...elevator.orderGenerationJob,
          timeNumbers: monthsInNumbers,
          timeUnit,
        },
      }));

      updatedElevators.slice(1).forEach((_, index) => {
        updatedElevators[index + 1].orderGenerationJob.timeNumbers =
          monthsInNumbers;
      });
      onChange(updatedElevators);
    } else {
      const updatedElevators = units.map((elevator) => {
        if (componentId === elevator.elevatorId) {
          return {
            ...elevator,
            orderGenerationJob: {
              ...elevator.orderGenerationJob,
              timeNumbers: monthsInNumbers,
              timeUnit,
            },
          };
        }
        return elevator;
      });
      onChange(updatedElevators);
    }

    handleClose();
  };

  const handleToggle = (index: number) => {
    setSelectedMonths((prevSelectedMonths) => {
      const newSelectedMonths = [...prevSelectedMonths];
      newSelectedMonths[index] = {
        ...newSelectedMonths[index],
        isSelected: !newSelectedMonths[index].isSelected,
      };
      return newSelectedMonths;
    });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'job-frequency-popover' : undefined;

  const handleCycleTypeChange = (value: JOB_CYCLE_TYPE) => () => {
    setCycleType(value);
  };

  useEffect(() => {
    if (!foundUnit) return;

    if (foundUnit.orderGenerationJob?.timeUnit === ContractTimeUnit.MONTHLY) {
      setCycleType(JOB_CYCLE_TYPE.BY_MONTHS);
      setSelectedMonths(
        monthsData.map((month) => ({
          ...month,
          isSelected:
            foundUnit.orderGenerationJob?.timeNumbers?.includes(month.number) ||
            false,
        })),
      );
      return;
    }

    const initOption =
      foundUnit.orderGenerationJob?.timeUnit &&
      UNIT_TYPE_TO_CYCLE_MAP.get(foundUnit.orderGenerationJob?.timeUnit);
    if (initOption) setSelectedFixedCycle(initOption);
  }, [open, foundUnit]);

  return (
    <div data-testid="job-frequency-root">
      <Box
        onClick={handleOpen}
        style={{
          width: '100%',
          textAlign: 'left',
          justifyContent: 'space-between',
          paddingLeft: '0.5em',
          border: '1px solid #c4c4c4',
          cursor: 'pointer',
          display: 'flex',
          borderRadius: '4px',
          paddingTop: '0.1em',
          paddingBottom: '0.1em',
        }}>
        <Typography
          noWrap
          style={{
            maxWidth: '250px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left',
            paddingTop: '0.2em',
          }}>
          {getFrequencyDisplay(foundUnit)}
        </Typography>
        <IconButton size="small" onClick={handleOpen}>
          <ArrowDropDownIcon />
        </IconButton>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        data-testid="requency-popover">
        <Box sx={{pt: 2, pb: 0, px: 4}} data-testid="requency-root-container">
          {/* Recurrent Menu  */}
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '-0.75em',
              }}>
              <Radio
                checked={cycleType === JOB_CYCLE_TYPE.FIXED}
                onClick={handleCycleTypeChange(JOB_CYCLE_TYPE.FIXED)}
                data-testid="radio-button-for-fixed"
              />
              <Typography
                variant="body1"
                sx={{color: 'text.primary', padding: '1em 0em'}}>
                {t('Fixed cycle')}
              </Typography>
            </Box>
            <FormSelect
              labelId="frequency-label"
              label=""
              options={CYCLE_OPTIONS}
              selectProps={{
                id: 'frequency-label',
                value: selectedFixedCycle,
                onChange: handleFrequencyChange,
                name: 'frequency',
                disabled: cycleType !== JOB_CYCLE_TYPE.FIXED,
              }}
              selectStyles={{
                '& .MuiSelect-select': {
                  py: 0.5,
                  typography: 'body2',
                },
              }}
            />
          </Box>

          {/* Divider */}
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            maxWidth="300px"
            position="relative"
            textAlign="center"
            sx={{marginTop: '1em'}}
            py={1}>
            <Divider sx={{width: '50%', borderColor: '#8F9BB380'}} />
            <Typography
              variant="body1"
              component="div"
              sx={{
                backgroundColor: '#fff',
                px: 1,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#8F9BB3',
              }}>
              {t('OR')}
            </Typography>
            <Divider sx={{width: '50%', borderColor: '#8F9BB380'}} />
          </Box>

          {/* Month Selection */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '-0.75em',
              }}>
              <Radio
                checked={cycleType === JOB_CYCLE_TYPE.BY_MONTHS}
                onClick={handleCycleTypeChange(JOB_CYCLE_TYPE.BY_MONTHS)}
                data-testid="radio-button-for-by_months"
              />
              <Typography
                variant="body1"
                sx={{color: 'text.primary', padding: '1em 0em'}}>
                {t('Pick your month(s)')}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <List sx={{flex: 1}}>
                {selectedMonths.slice(0, 6).map((item) => (
                  <ListItem
                    key={item.month}
                    sx={{padding: '0em', height: '28px'}}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isSelected}
                          disabled={cycleType !== JOB_CYCLE_TYPE.BY_MONTHS}
                          onChange={() => handleToggle(item.number - 1)}
                        />
                      }
                      label={t(item.month)}
                    />
                  </ListItem>
                ))}
              </List>
              <List sx={{flex: 1}}>
                {selectedMonths.slice(6).map((item) => (
                  <ListItem
                    key={item.month}
                    sx={{padding: '0em', height: '28px'}}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isSelected}
                          disabled={cycleType !== JOB_CYCLE_TYPE.BY_MONTHS}
                          onChange={() => handleToggle(item.number - 1)}
                        />
                      }
                      label={t(item.month)}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            pt: 1,
            px: 4,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <Button
            label="Cancel"
            buttonProps={{
              onClick: handleClose,
              size: 'large',
            }}
          />

          <Button
            label="Confirm"
            buttonProps={{
              onClick: handleSave,
              variant: 'contained',
              size: 'large',
              style: {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          />
        </Box>
      </Popover>
    </div>
  );
};

export default JobFrequencyPicker;
