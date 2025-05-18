import React from 'react';
import {
  Control,
  FieldValues,
  UseFormSetValue,
  Controller,
  Path,
  PathValue,
} from 'react-hook-form';
import TableCell from 'components/Table/TableCell';
import TableRow from 'components/Table/TableRow';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import {Box, IconButton, Switch, Tooltip, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {t} from 'i18next';
import {Button} from 'components/Button';

export interface SubPositionFooterProps<TForm extends FieldValues> {
  index: number;
  control: Control<TForm, any>;
  setValue: UseFormSetValue<TForm>;
  onAddSubPosition: (parentIndex: number) => void;
  isSubPositionVisible?: boolean;
  isPriceVisible?: boolean;
  disableInlineEditing?: boolean;
}

const SubPositionFooter = <TForm extends FieldValues>({
  index,
  control,
  setValue,
  onAddSubPosition,
  isSubPositionVisible = true,
  isPriceVisible = true,
  disableInlineEditing = false,
}: SubPositionFooterProps<TForm>) => {
  const theme = useTheme();
  return (
    <TableRow
      testId="sub-position-footer"
      sx={{border: 'none', height: '3.5em'}}>
      <TableCell
        colSpan={3}
        noPadding
        isFirst
        firstSticky
        fullWidth
        noWidthLimit
        sx={{border: 'none', width: '328px'}}>
        {!disableInlineEditing && (
          <Button
            label="Add sub-position"
            buttonProps={{
              variant: 'text',
              size: 'small',
              onClick: () => onAddSubPosition(index),
              sx: {fontWeight: 600, p: 1, color: theme.palette.primary.light},
              startIcon: <PlaylistAddOutlinedIcon />,
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{border: 'none'}} colSpan={7} noPadding />
      <TableCell
        colSpan={3}
        noPadding
        sx={{border: 'none', '& > div': {justifyContent: 'flex-end'}}}
        isLast
        lastSticky>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box
            sx={{
              marginRight: '1.5em',
              display: 'flex',
              alignItems: 'center',
              cursor: disableInlineEditing ? 'not-allowed' : 'auto',
            }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                display: {xs: 'none', sm: 'none', xl: 'inline'},
              }}>
              {t('Sub-positions')}
            </Typography>
            <Tooltip title={t('Sub-positions')} placement="top">
              <IconButton sx={{display: {xs: 'inline-flex', xl: 'none'}}}>
                <SubdirectoryArrowRightOutlinedIcon
                  sx={{color: isSubPositionVisible ? '#000034' : 'inherit'}}
                />
              </IconButton>
            </Tooltip>
            <Controller
              name={
                `items.${index}.subItemsConfig.subItemsVisible` as Path<TForm>
              }
              control={control}
              render={({field}) => (
                <Switch
                  {...field}
                  checked={field.value || false}
                  onChange={
                    !disableInlineEditing
                      ? (e) => {
                          const newVal = e.target.checked;
                          field.onChange(newVal);
                          if (!newVal) {
                            setValue(
                              `items.${index}.subItemsConfig.priceVisible` as Path<TForm>,
                              false as PathValue<TForm, Path<TForm>>,
                            );
                          }
                        }
                      : undefined
                  }
                  sx={{
                    cursor: disableInlineEditing ? 'not-allowed' : undefined,
                    pointerEvents: disableInlineEditing ? 'none' : 'auto',
                    // and make sure the inner track & thumb also show the same
                    '& .MuiSwitch-switchBase, & .MuiSwitch-track, & .MuiSwitch-thumb':
                      {
                        cursor: disableInlineEditing
                          ? 'not-allowed'
                          : undefined,
                      },
                  }}
                />
              )}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: disableInlineEditing ? 'not-allowed' : 'auto',
            }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                display: {xs: 'none', sm: 'none', xl: 'inline'},
              }}>
              {t('Prices')}
            </Typography>
            <Tooltip title={t('Prices')} placement="top">
              <IconButton sx={{display: {xs: 'inline-flex', xl: 'none'}}}>
                <MonetizationOnOutlinedIcon
                  sx={{color: isPriceVisible ? '#000034' : 'inherit'}}
                />
              </IconButton>
            </Tooltip>
            <Controller
              name={`items.${index}.subItemsConfig.priceVisible` as Path<TForm>}
              control={control}
              render={({field}) => (
                <Switch
                  {...field}
                  disabled={!isSubPositionVisible}
                  checked={field.value || false}
                  onChange={
                    !disableInlineEditing
                      ? (e) => field.onChange(e.target.checked)
                      : undefined
                  }
                  sx={{
                    cursor: disableInlineEditing ? 'not-allowed' : undefined,
                    pointerEvents: disableInlineEditing ? 'none' : 'auto',
                    // and make sure the inner track & thumb also show the same
                    '& .MuiSwitch-switchBase, & .MuiSwitch-track, & .MuiSwitch-thumb':
                      {
                        cursor: disableInlineEditing
                          ? 'not-allowed'
                          : undefined,
                      },
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default SubPositionFooter;
