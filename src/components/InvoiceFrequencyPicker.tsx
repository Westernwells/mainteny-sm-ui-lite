import React, {useEffect, useState} from 'react';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  Box,
  Switch,
  Typography,
  Divider,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import {ContractServiceForm, ContractTimeUnit} from 'models/contract';
import {theme} from 'theme';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {FormikProps} from 'formik';
import {useTranslation} from 'react-i18next';
import {getListViewFrequency} from 'utils/elevator-utils';
import {FormSelect} from './form/FormSelect';
import {Button} from './Button';

type MonthData = {
  month: string;
  isSelected: boolean;
  number: number;
};

type Props = {
  componentId: string;
  formik: FormikProps<ContractServiceForm>;
};

const monthsData: MonthData[] = [
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

const InvoiceFrequencyPicker: React.FC<Props> = ({componentId, formik}) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<MonthData[]>(monthsData);

  const [isAfterJobCompletion, setAfterJobCompletion] = useState(false);
  const [isYearlyFrequency, setYearlyFrequency] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');

  const handleFrequencyChange = (
    event: SelectChangeEvent<string | string[]>,
  ) => {
    const selectedValue = event.target.value as string;
    setSelectedFrequency(selectedValue);

    let timeUnit: ContractTimeUnit = ContractTimeUnit.MONTHLY;

    switch (selectedValue) {
      case 'everyYear':
        timeUnit = ContractTimeUnit.ANNUALLY;
        break;
      case 'every2Years':
        timeUnit = ContractTimeUnit.BIENNIALLY;
        break;
      case 'every3Years':
        timeUnit = ContractTimeUnit.TRIENNIALLY;
        break;
      case 'every4Years':
        timeUnit = ContractTimeUnit.QUADRENNIALLY;
        break;
      default:
        break;
    }
    formik.setFieldValue('invoiceJob.timeUnit', timeUnit);
    formik.setFieldValue('invoiceJob.timeNumbers', []);
  };

  const handleAfterJobCompletionToggle = () => {
    setAfterJobCompletion((prev) => !prev);
    setYearlyFrequency(false);
    setSelectedMonths(monthsData);
  };

  const handleYearlyFrequencyToggle = () => {
    setYearlyFrequency((prev) => !prev);
    setAfterJobCompletion(false);
    setSelectedMonths(monthsData);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);

    const elevator = formik.values.elevators.find(
      (elevatorItem) => elevatorItem.elevatorId === componentId,
    );

    let afterJobCompletion = false;
    let yearlyFrequency = false;
    let selectedCaseFrequency = '';

    if (elevator) {
      switch (elevator.invoiceJob.timeUnit) {
        case ContractTimeUnit.NONE:
          afterJobCompletion = true;
          yearlyFrequency = false;
          break;
        case ContractTimeUnit.ANNUALLY:
          yearlyFrequency = true;
          afterJobCompletion = false;
          selectedCaseFrequency = 'everyYear';
          break;
        case ContractTimeUnit.BIENNIALLY:
          yearlyFrequency = true;
          afterJobCompletion = false;
          selectedCaseFrequency = 'every2Years';
          break;
        case ContractTimeUnit.TRIENNIALLY:
          yearlyFrequency = true;
          afterJobCompletion = false;
          selectedCaseFrequency = 'every3Years';
          break;
        case ContractTimeUnit.QUADRENNIALLY:
          yearlyFrequency = true;
          afterJobCompletion = false;
          selectedCaseFrequency = 'every4Years';
          break;
        default:
          afterJobCompletion = false;
          yearlyFrequency = false;
      }
    }

    setAfterJobCompletion(afterJobCompletion);
    setYearlyFrequency(yearlyFrequency);
    setSelectedFrequency(selectedCaseFrequency);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAfterJobCompletion(false);
    setYearlyFrequency(false);
    setSelectedMonths(monthsData);
  };

  const handleSave = () => {
    const formattedNumbers = selectedMonths
      .filter((item) => item.isSelected)
      .map((item) => item.number);

    const timeUnit =
      isYearlyFrequency && selectedFrequency === 'everyYear'
        ? ContractTimeUnit.ANNUALLY
        : isYearlyFrequency && selectedFrequency === 'every2Years'
        ? ContractTimeUnit.BIENNIALLY
        : isYearlyFrequency && selectedFrequency === 'every3Years'
        ? ContractTimeUnit.TRIENNIALLY
        : isYearlyFrequency && selectedFrequency === 'every4Years'
        ? ContractTimeUnit.QUADRENNIALLY
        : isAfterJobCompletion
        ? ContractTimeUnit.NONE
        : ContractTimeUnit.MONTHLY;

    if (
      formik.values.elevators.findIndex(
        (elevator) => elevator.elevatorId === componentId,
      ) === 0
    ) {
      const updatedElevators = formik.values.elevators.map((elevator) => ({
        ...elevator,
        invoiceJob: {
          ...elevator.invoiceJob,
          timeNumbers: formattedNumbers,
          timeUnit,
        },
      }));

      updatedElevators.slice(1).forEach((_, index) => {
        updatedElevators[index + 1].invoiceJob.timeNumbers = formattedNumbers;
      });
      formik.setFieldValue('elevators', updatedElevators);
    } else {
      const updatedElevators = formik.values.elevators.map((elevator) => {
        if (componentId === elevator.elevatorId) {
          return {
            ...elevator,
            invoiceJob: {
              ...elevator.invoiceJob,
              timeNumbers: formattedNumbers,
              timeUnit,
            },
          };
        }
        return elevator;
      });
      formik.setFieldValue('elevators', updatedElevators);
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
  const id = open ? 'invoice-frequency-popover' : undefined;

  useEffect(() => {
    setSelectedMonths(
      monthsData.map((month) => ({
        ...month,
        isSelected: formik.values.elevators
          .filter((elevator) => componentId === elevator.elevatorId)
          .some((elevator) =>
            elevator.invoiceJob.timeNumbers?.includes(month.number),
          ),
      })),
    );
  }, [open]);

  return (
    <div>
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
          {getListViewFrequency(
            'invoiceJob',
            formik.values.elevators.filter(
              (elevator) => componentId === elevator.elevatorId,
            ),
          )}
        </Typography>
        <IconButton size="small" onClick={handleOpen}>
          <ArrowDropDownIcon />
        </IconButton>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          setAfterJobCompletion(false);
          setYearlyFrequency(false);
          setSelectedMonths(monthsData);
          handleClose();
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}>
        <Box sx={{pt: 2, pb: 0, px: 4}}>
          <Box display="flex" alignItems="center">
            <Switch
              checked={isAfterJobCompletion}
              onChange={handleAfterJobCompletionToggle}
            />
            <Typography
              variant="body1"
              sx={{color: 'text.primary', padding: '1em 0em'}}>
              {t('After job completion')}
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            maxWidth="300px"
            position="relative"
            textAlign="center"
            py={1.5}>
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
                        disabled={isYearlyFrequency || isAfterJobCompletion}
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
                        disabled={isYearlyFrequency || isAfterJobCompletion}
                        onChange={() => handleToggle(item.number - 1)}
                      />
                    }
                    label={t(item.month)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            maxWidth="300px"
            position="relative"
            textAlign="center"
            py={1.5}>
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
          <Box>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Switch
                checked={isYearlyFrequency}
                onChange={handleYearlyFrequencyToggle}
              />
              <Typography
                variant="body1"
                sx={{color: 'text.primary', padding: '1em 0em'}}>
                {t('Pick yearly frequency')}
              </Typography>
            </Box>

            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <FormSelect
                labelId="frequency-label"
                label=""
                options={[
                  {label: 'Every year', value: 'everyYear'},
                  {label: 'Every 2 years', value: 'every2Years'},
                  {label: 'Every 3 years', value: 'every3Years'},
                  {label: 'Every 4 years', value: 'every4Years'},
                ]}
                selectProps={{
                  id: 'frequency-label',
                  value: selectedFrequency,
                  onChange: handleFrequencyChange,
                  name: 'frequency',
                  disabled: !isYearlyFrequency,
                }}
                selectStyles={{
                  '& .MuiSelect-select': {
                    py: 0.5,
                    typography: 'body2',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

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
              onClick: () => handleClose(),
              size: 'large',
            }}
          />

          <Button
            label="Confirm"
            buttonProps={{
              onClick: () => handleSave(),
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

export default InvoiceFrequencyPicker;
