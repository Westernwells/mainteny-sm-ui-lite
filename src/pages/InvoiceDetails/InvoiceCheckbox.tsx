import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {ChangeEvent, MouseEventHandler} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  showTooltip?: boolean;
  tooltipTitle?: string;
  disabled?: boolean;
  title?: string;
  checkboxLabel?: string;
  checked?: boolean;
  checkboxName: string;
  handleChange: (val: ChangeEvent<HTMLInputElement>) => void;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

export const InvoiceCheckbox = ({
  showTooltip,
  checked,
  handleChange,
  tooltipTitle = '',
  title,
  checkboxLabel = '',
  checkboxName,
  onMouseLeave,
  onMouseEnter,
  disabled,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  return (
    <Tooltip
      open={showTooltip}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={tooltipTitle}
      placement="right"
      sx={{
        '&:hover': {},
      }}
      arrow>
      <Box mt="2em" width="32ch">
        <Typography variant="body1" color={theme.palette.text.secondary}>
          {title ? t(title) : null}
        </Typography>
        <FormCheckbox
          disabled={disabled}
          checked={checked}
          name={checkboxName}
          handleChange={handleChange}
          label={t(checkboxLabel)}
        />
      </Box>
    </Tooltip>
  );
};
