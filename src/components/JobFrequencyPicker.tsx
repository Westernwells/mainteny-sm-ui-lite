import {useEffect, useState} from 'react';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {Box, Switch, Typography, Divider, IconButton} from '@mui/material';
import {theme} from 'theme';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {FormikProps} from 'formik';
import {ContractServiceForm, ContractTimeUnit} from 'models/contract';
import {useTranslation} from 'react-i18next';
import {getListViewFrequency} from 'utils/elevator-utils';
import {Button} from './Button';

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
  formik: FormikProps<ContractServiceForm>;
};

const JobFrequencyPicker = ({componentId, formik}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(monthsData);

  const [isWeeklyFrequency, setIsWeeklyFrequency] = useState(false);
  const [isBiweeklyFrequency, setIsBiweeklyFrequency] = useState(false);

  const handleWeeklyToggle = () => {
    setIsWeeklyFrequency((prev) => !prev);
    setIsBiweeklyFrequency(false);
  };

  const handleBiWeeklyToggle = () => {
    setIsBiweeklyFrequency((prev) => !prev);
    setIsWeeklyFrequency(false);
  };

  const handleOpen = (event: any) => {
    setAnchorEl(event.currentTarget);

    const elevator = formik.values.elevators.find(
      (elevatorItem) => elevatorItem.elevatorId === componentId,
    );

    let weeklyFrequency: boolean = false;
    let biWeeklyFrequency: boolean = false;

    if (elevator) {
      switch (elevator.orderGenerationJob.timeUnit) {
        case ContractTimeUnit.WEEKLY:
          weeklyFrequency = true;
          biWeeklyFrequency = false;
          break;
        case ContractTimeUnit.BIWEEKLY:
          weeklyFrequency = false;
          biWeeklyFrequency = true;
          break;
        default:
          weeklyFrequency = false;
          biWeeklyFrequency = false;
      }
    }

    setIsWeeklyFrequency(weeklyFrequency);
    setIsBiweeklyFrequency(biWeeklyFrequency);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsWeeklyFrequency(false);
    setIsBiweeklyFrequency(false);
    setSelectedMonths(monthsData);
  };

  const handleSave = () => {
    const formattedNumbers = selectedMonths
      .filter((item) => item.isSelected)
      .map((item) => item.number);

    const timeUnit = isWeeklyFrequency
      ? ContractTimeUnit.WEEKLY
      : isBiweeklyFrequency
      ? ContractTimeUnit.BIWEEKLY
      : ContractTimeUnit.MONTHLY;

    if (
      formik.values.elevators.findIndex(
        (elevator) => elevator.elevatorId === componentId,
      ) === 0
    ) {
      const updatedElevators = formik.values.elevators.map((elevator) => ({
        ...elevator,
        orderGenerationJob: {
          ...elevator.orderGenerationJob,
          timeNumbers:
            isWeeklyFrequency || isBiweeklyFrequency ? [] : formattedNumbers,
          timeUnit,
        },
      }));

      updatedElevators.slice(1).forEach((_, index) => {
        updatedElevators[index + 1].orderGenerationJob.timeNumbers =
          formattedNumbers;
      });

      formik.setFieldValue('elevators', updatedElevators);
    } else {
      const updatedElevators = formik.values.elevators.map((elevator) => {
        if (componentId === elevator.elevatorId) {
          return {
            ...elevator,
            orderGenerationJob: {
              ...elevator.orderGenerationJob,
              timeNumbers:
                isWeeklyFrequency || isBiweeklyFrequency
                  ? []
                  : formattedNumbers,
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
  const id = open ? 'job-frequency-popover' : undefined;

  useEffect(() => {
    setSelectedMonths(
      monthsData.map((month) => ({
        ...month,
        isSelected: formik.values.elevators
          .filter((elevator) => componentId === elevator.elevatorId)
          .some((elevator) =>
            elevator.orderGenerationJob.timeNumbers?.includes(month.number),
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
            'orderGenerationJob',
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
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}>
        <Box sx={{pt: 2, pb: 0, px: 4}}>
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
                        disabled={isWeeklyFrequency || isBiweeklyFrequency}
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
                        disabled={isWeeklyFrequency || isBiweeklyFrequency}
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
          <Box
            sx={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Switch
                checked={isWeeklyFrequency}
                onChange={handleWeeklyToggle}
              />
              <Typography
                variant="body1"
                sx={{color: 'text.primary', padding: '1em 0em'}}>
                {t('Weekly')}
              </Typography>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Switch
                checked={isBiweeklyFrequency}
                onChange={handleBiWeeklyToggle}
              />
              <Typography
                variant="body1"
                sx={{color: 'text.primary', padding: '1em 0em'}}>
                {t('Bi-weekly')}
              </Typography>
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

export default JobFrequencyPicker;
