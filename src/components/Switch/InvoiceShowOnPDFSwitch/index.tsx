import {useMemo} from 'react';
import {Box, Tooltip} from '@mui/material';
import Switch from 'components/Switch/index';
import {useTranslation} from 'react-i18next';

type Props = {
  shouldShow: boolean;
  onToggle: (newState: boolean) => void;
  enableCollapse?: boolean;
};

const InvoiceShowOnPDFSwitch = ({
  shouldShow,
  enableCollapse,
  onToggle,
}: Props) => {
  const {t} = useTranslation();

  const handleToggle = () => {
    onToggle(!shouldShow);
  };

  const tooltipText = useMemo(
    () =>
      shouldShow
        ? `Click to hide this section from the invoice. Hidden sections won't appear in the final document or any exported versions`
        : 'Click to show this section on the invoice. Visible sections will appear in the final document and all exported versions.',
    [shouldShow],
  );

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}>
      {enableCollapse && (
        <Tooltip arrow placement="top" title={t(tooltipText)}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            {t('Show on PDF')}
            <Switch value={shouldShow} onChange={handleToggle} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default InvoiceShowOnPDFSwitch;
