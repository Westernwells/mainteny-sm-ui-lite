import React, {ReactNode} from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';

interface Props {
  children: ReactNode;
  containerStyle?: {[key: string]: string | number};
  wrapperStyle?: {[key: string]: string | number};
  showFilter?: boolean;
  hideClear?: boolean;
  onClear?: () => void;
}

export const FilterFields = ({
  children,
  containerStyle,
  wrapperStyle,
  hideClear,
  showFilter = true,
  onClear,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  return showFilter ? (
    <Box display="flex" sx={{...containerStyle}}>
      <Box display="flex" sx={{...wrapperStyle}}>
        {children}
      </Box>
      {!hideClear ? (
        <Typography
          onClick={() => onClear && onClear()}
          mt="0.5em"
          sx={{cursor: 'pointer', color: theme.palette.info.main}}>
          {t('Clear all')}
        </Typography>
      ) : null}
    </Box>
  ) : null;
};
