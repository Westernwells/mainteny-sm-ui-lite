import {CustomizableColumn, CustomizableTable} from 'models/table';
import Typography from '@mui/material/Typography';
import useCustomizableColumns from 'hooks/useCustomizableColumns';
import Box from '@mui/system/Box';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Popover from '@mui/material/Popover';
import {Button} from 'components/Button';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import CustomizeTableOptions from 'components/Table/CustomizeTable/CustomizableColumnSwitch';

type Props = {
  allColumns: CustomizableColumn[];
  table: CustomizableTable;
};

const CustomizeTable = ({allColumns, table}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {
    selectedTableColumns,
    updateClientCustomizedTableData,
    onToggle,
    defaultColumns,
  } = useCustomizableColumns(table, allColumns);

  const getDefaultUnitColumns = useCallback(() => defaultColumns, [allColumns]);

  const handleOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (
    value: CustomizableColumn,
    action: 'add' | 'remove',
  ) => {
    onToggle(value, selectedTableColumns, action);
  };

  const handleReset = () => {
    updateClientCustomizedTableData(getDefaultUnitColumns());
  };

  return (
    <div data-testid="customize-table-columns-container">
      <Button
        buttonProps={{
          onClick: handleOpen,
          sx: {
            fontSize: '14px',
            height: '36px',
          },
          variant: 'text',
          color: 'primary',
          size: 'small',
          startIcon: <SettingsOutlinedIcon />,
        }}>
        <Typography variant="body1">{t('Edit Table')}</Typography>
      </Button>

      <Popover
        id="customize-table-columns-popover"
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
        data-testid="customize-table-columns-popover">
        <Box
          sx={{
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
          data-testid="customize-table-columns-popover-container">
          {/* Header actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            gap={2}>
            <Typography
              variant="subtitle2"
              sx={{color: theme.palette.action.active}}>
              {t('COLUMN NAME')}
            </Typography>

            <Button
              label="Reset"
              buttonProps={{
                onClick: handleReset,
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              flexDirection: 'column',
            }}>
            {allColumns.map((item) => {
              const isSelected = selectedTableColumns.includes(item.id);

              return (
                <Box
                  key={item.id}
                  sx={{
                    width: '100%',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  gap={2}>
                  <Typography variant="body1">{t(item.columnName)}</Typography>

                  {!item.fixed && (
                    <CustomizeTableOptions
                      value={isSelected}
                      onChange={() =>
                        handleToggle(item, isSelected ? 'remove' : 'add')
                      }
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Popover>
    </div>
  );
};

export default CustomizeTable;
