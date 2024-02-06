import {ChangeEvent} from 'react';
import {t} from 'i18next';
import {theme} from 'theme';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {T} from 'utils/i18n-utils';

interface Props {
  checkboxLabel: string;
  checked: boolean;
  handleChange: (val: ChangeEvent<HTMLInputElement>) => void;
  tooltipTitle: string;
  disabled: boolean;
  handleAction: () => void;
}

export const InvoiceCheckboxNEW = ({
  checkboxLabel,
  checked,
  handleChange,
  tooltipTitle,
  disabled,
  handleAction,
}: Props) => (
  <Tooltip
    disableHoverListener={!disabled}
    title={T(tooltipTitle) || ''}
    placement="bottom"
    arrow
    followCursor>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%">
      <FormCheckbox
        disabled={disabled}
        checked={checked}
        handleChange={handleChange}
        label={checkboxLabel}
        typographyProps={{variant: 'body2'}}
        checkboxProps={{sx: {py: 0}}}
      />
      <IconButton disabled={disabled} onClick={handleAction}>
        <OpenInNew
          fontSize="small"
          sx={{color: disabled ? 'inherit' : theme.palette.secondary.dark}}
        />
      </IconButton>
    </Box>
  </Tooltip>
);
