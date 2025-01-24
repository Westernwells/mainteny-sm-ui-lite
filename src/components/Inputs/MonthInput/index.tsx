import Box from '@mui/system/Box';
import {IconButton, Typography} from '@mui/material';
import {displayMonths} from 'utils/jobFrequency';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Popover from '@mui/material/Popover';
import {
  DEFAULT_MONTH_FREQUENCY_DATA,
  MonthFrequency,
} from 'models/jobFrequency';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {Button} from 'components/Button';
import {theme} from 'theme';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

type Props = {
  selectedValue: number[];
  onChange: (selectedValue: number[]) => void;
};

const MonthInput = ({selectedValue, onChange}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState<MonthFrequency[]>(
    DEFAULT_MONTH_FREQUENCY_DATA.map(
      (month): MonthFrequency => ({
        ...month,
        isSelected: selectedValue.includes(month.number),
      }),
    ),
  );
  const open = Boolean(anchorEl);

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

  const handleOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedMonths(DEFAULT_MONTH_FREQUENCY_DATA);
  };

  const handleSave = () => {
    const formattedNumbers = selectedMonths
      .filter((item) => item.isSelected)
      .map((item) => item.number);

    onChange(formattedNumbers);
    handleClose();
  };

  // on outside change of selected value
  useEffect(() => {
    setSelectedMonths(
      DEFAULT_MONTH_FREQUENCY_DATA.map(
        (month): MonthFrequency => ({
          ...month,
          isSelected: selectedValue.includes(month.number),
        }),
      ),
    );
  }, [selectedValue]);

  return (
    <div data-testid="job-frequency-root">
      <Typography variant="subtitle2">{t('Job trigger month')}</Typography>
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
          {displayMonths(selectedValue)}
        </Typography>
        <IconButton size="small" onClick={handleOpen}>
          <ArrowDropDownIcon />
        </IconButton>
      </Box>

      <Popover
        id="month-picker-popover"
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

export default MonthInput;
