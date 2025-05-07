import React from 'react';
import {Box, Tooltip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import useTheme from '@mui/material/styles/useTheme';

type MetricProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tooltipText: string;
  paddingLeft?: string;
  changeValue?: number;
};

const Metric = ({
  title,
  value,
  icon,
  tooltipText,
  paddingLeft,
  changeValue,
}: MetricProps) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const isPositive = (changeValue ?? 0) >= 0;
  const changeSign = isPositive ? '+' : '';

  return (
    <Box
      display="flex"
      flexDirection="column"
      paddingLeft={paddingLeft || '1em'}
      height="66px">
      <Box sx={{display: 'flex', alignItems: 'center', height: '22px', pb: 2}}>
        <Typography variant="h6" color="#828DA3">
          {t(title)}
        </Typography>
        <Tooltip title={t(tooltipText)} placement="top" arrow>
          <Box sx={{ml: 0.5, mb: -0.7, cursor: 'pointer'}}>
            <AlertInfoIcon width="16px" height="16px" />
          </Box>
        </Tooltip>
      </Box>
      <Box display="flex" alignItems="center" gap={1} height="37px">
        {icon}
        <Typography variant="h4" sx={{pt: '0.2em'}}>
          {value}
        </Typography>
        {!!changeValue && (
          <Box
            borderRadius={10}
            py={0.5}
            px={1.5}
            sx={{backgroundColor: isPositive ? '#4CAF5026' : '#FF182F26'}}>
            <Typography
              fontWeight="bold"
              variant="body2"
              sx={{
                color: isPositive
                  ? theme.palette.success.darkSuccess
                  : theme.palette.error.main,
              }}>
              {changeSign}
              {changeValue}%
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Metric;
