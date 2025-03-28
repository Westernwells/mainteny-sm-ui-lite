import {Button} from 'components/Button';
import TableCell from 'components/Table/TableCell';
import TableRow from 'components/Table/TableRow';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import {Box, IconButton, Switch, Tooltip, Typography} from '@mui/material';
import {t} from 'i18next';
import {Control, Controller} from 'react-hook-form';
import {useTheme} from '@mui/material/styles';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import {QuotationFormData} from 'models/quotation';

type Props = {
  index: number;
  control: Control<QuotationFormData, any>;
  onAddSubPosition: () => void;
  isSubPositionVisible?: boolean;
  isPriceVisible?: boolean;
};

const SubPositionFooter = ({
  index,
  control,
  onAddSubPosition,
  isSubPositionVisible = true,
  isPriceVisible = true,
}: Props) => {
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
        <Button
          label="Add sub-position"
          buttonProps={{
            variant: 'text',
            size: 'small',
            onClick: onAddSubPosition,
            sx: {
              fontWeight: 600,
              p: 1,
              color: theme.palette.primary.light,
            },
            startIcon: <PlaylistAddOutlinedIcon />,
          }}
        />
      </TableCell>
      <TableCell sx={{border: 'none'}} colSpan={7} noPadding />

      <TableCell
        colSpan={3}
        noPadding
        sx={{
          border: 'none',
          '& > div': {justifyContent: 'flex-end'},
        }}
        isLast
        lastSticky>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box sx={{marginRight: '1.5em'}}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: '600',
                display: {
                  xs: 'none',
                  sm: 'none',
                  xl: 'inline',
                },
              }}>
              {t('Sub-positions')}
            </Typography>
            <Tooltip title={t('Sub-positions')} placement="top">
              <IconButton sx={{display: {xs: 'inline-flex', xl: 'none'}}}>
                <SubdirectoryArrowRightOutlinedIcon
                  sx={{
                    color: isSubPositionVisible ? '#000034' : 'inherit',
                  }}
                />
              </IconButton>
            </Tooltip>

            <Controller
              name={`items.${index}.subItemsConfig.subItemsVisible`}
              control={control}
              render={({field}) => (
                <Switch
                  {...field}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: '600',
                display: {
                  xs: 'none',
                  sm: 'none',
                  xl: 'inline',
                },
              }}>
              {t('Prices')}
            </Typography>
            <Tooltip title={t('Prices')} placement="top">
              <IconButton sx={{display: {xs: 'inline-flex', xl: 'none'}}}>
                <MonetizationOnOutlinedIcon
                  sx={{
                    color: isPriceVisible ? '#000034' : 'inherit',
                  }}
                />
              </IconButton>
            </Tooltip>

            <Controller
              name={`items.${index}.subItemsConfig.priceVisible`}
              control={control}
              render={({field}) => (
                <Switch
                  {...field}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
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
