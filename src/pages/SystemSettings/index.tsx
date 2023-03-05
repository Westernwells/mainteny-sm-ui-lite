import {useLayoutEffect} from 'react';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {Divider, Typography} from '@mui/material';

import {InfoCard} from 'components/InfoCard';
import {RebuildForm} from './RebuildForm';
import {CreationForm} from './CreationForm';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const SystemSettings = ({getCurrentPageTitle}: Props) => {
  const theme = useTheme();

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('System Settings');
    }
  }, []);

  return (
    <InfoCard
      containerStyles={{minHeight: '31em'}}
      showHeaderBackground
      header={<Typography variant="subtitle1">Search Index</Typography>}>
      <Box>
        <RebuildForm />
        <Divider
          sx={{background: theme.palette.divider, mt: '1.5em'}}
          flexItem
        />
        <CreationForm />
      </Box>
    </InfoCard>
  );
};

export default SystemSettings;
