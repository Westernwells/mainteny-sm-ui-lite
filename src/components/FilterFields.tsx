import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  children: ReactNode;
  containerStyle?: {[key: string]: string | number};
  wrapperStyle?: {[key: string]: string | number};
  showFilter?: boolean;
  hideClear?: boolean;
  clearText?: string;
  onClear?: () => void;
}

export const FilterFields = ({
  children,
  containerStyle,
  wrapperStyle,
  hideClear,
  showFilter = true,
  clearText,
  onClear,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return showFilter ? (
    <Box display="flex" sx={{...containerStyle}}>
      <Box display="flex" sx={{...wrapperStyle}}>
        {children}
      </Box>
      {!hideClear ? (
        <Typography
          component="div"
          onClick={() => onClear && onClear()}
          mt="0.5em"
          sx={{
            cursor: 'pointer',
            color: theme.palette.text.primary,
            fontWeight: '600',
          }}>
          {clearText ? t(clearText) : t('Clear filter')}
        </Typography>
      ) : null}
    </Box>
  ) : null;
};
