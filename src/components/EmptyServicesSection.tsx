import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box, {BoxProps} from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import {ReactComponent as BikeRepairIcon} from 'assets/illustrations/BikeRepair.svg';
import {Button} from './Button';

interface Props extends BoxProps {
  size?: 'tiny' | 'small' | 'medium' | 'large';
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: any;
  showActionBtn?: boolean;
  btnLabel?: string;
  btnAction?: () => void;
  actionButtonIcon?: JSX.Element;
  actionButtonEndIcon?: JSX.Element;
}

export const EmptyServicesSection = ({
  size = 'medium',
  containerStyle,
  labelStyle,
  labelVariant,
  btnLabel = '',
  showActionBtn = false,
  btnAction,
  actionButtonIcon,
  actionButtonEndIcon,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const Width = {
    tiny: '56px',
    small: '128px',
    medium: '192px',
    large: '256px',
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="1em"
      mt={4}
      sx={{...containerStyle}}>
      <Box width={Width[size]}>
        <BikeRepairIcon style={{width: '80%', height: '100%'}} />
      </Box>
      <Typography
        variant={labelVariant || 'h5'}
        textAlign="left"
        sx={{...labelStyle}}>
        {t('No contract services added')}
      </Typography>
      <Box sx={{textAlign: 'left'}}>
        <Box sx={{textAlign: 'left', display: 'flex', py: 1}}>
          <Typography
            variant="body2"
            textAlign="left"
            sx={{fontWeight: 'bold', pr: 0.5}}>
            {t('1. Add Contract Services:')}
          </Typography>
          <Typography variant="body2" textAlign="left">
            {t(
              'Easily add services that will automatically be included in your invoices.',
            )}
          </Typography>
        </Box>
        <Box sx={{textAlign: 'left', display: 'flex'}}>
          <Typography
            variant="body2"
            textAlign="left"
            sx={{fontWeight: 'bold', pr: 0.5}}>
            {t('2. Customize Job Creation:')}
          </Typography>
          <Typography variant="body2" textAlign="left">
            {t(
              'Tailor each service according to the specific services included in your contract',
            )}
          </Typography>
        </Box>
      </Box>

      {showActionBtn ? (
        <Button
          buttonProps={{
            onClick: btnAction,
            variant: 'contained',
            size: 'large',
            startIcon: actionButtonIcon || <AddIcon />,
            endIcon: actionButtonEndIcon || null,
            style: {
              backgroundColor: theme.palette.primary.main,
            },
          }}>
          {t(btnLabel)}
        </Button>
      ) : null}
    </Box>
  );
};
