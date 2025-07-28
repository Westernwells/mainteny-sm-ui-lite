import {Box, Tooltip, Typography} from '@mui/material';
import {Button} from 'components/Button';
import {ReactComponent as StatsColoredIcon} from 'assets/icons/StatsColored.svg';
import {ReactComponent as StatsIcon} from 'assets/icons/Stats.svg';
import {useTranslation} from 'react-i18next';

type Props = {
  onClick?: () => void;
  show?: boolean;
};

const StatsToggle = ({onClick, show}: Props) => {
  const {t} = useTranslation();

  return (
    <Button buttonProps={{onClick}} style={{alignItems: 'center'}}>
      <Tooltip
        title={
          show
            ? t('Hide main key performance indicators')
            : t('Show main key performance indicators')
        }
        placement="top"
        arrow>
        <Box flexDirection="row" display="flex" alignItems="center">
          {show ? (
            <StatsColoredIcon
              style={{marginRight: '5px'}}
              width={20}
              height={20}
            />
          ) : (
            <StatsIcon style={{marginRight: '5px'}} width={20} height={20} />
          )}
          <Typography>{t('Stats')}</Typography>
        </Box>
      </Tooltip>
    </Button>
  );
};

export default StatsToggle;
