import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {SxProps} from '@mui/system';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import Link from '@mui/material/Link';
import {Link as RouterLink} from 'react-router-dom';
import {hasProtocol} from '../utils/utils';

interface Props {
  icon: JSX.Element;
  label: string;
  navigateTo?: string;
  bodyTextVariant?: any;
  titleTextVariant?: any;
  iconBackground?: string;
  bodyText?: string | JSX.Element | ReactNode;
  unitText?: string;
  iconMaxHeight?: string | number;
  containerStyles?: {[key: string]: any};
  bodyStyle?: {[key: string]: any};
  labelStyle?: {[key: string]: any};
  iconContainerStyles?: SxProps;
  enabled?: boolean;
  shouldTranslate?: boolean;
}

export const CardProps = ({
  label,
  navigateTo,
  bodyTextVariant,
  titleTextVariant,
  icon,
  iconBackground,
  bodyText,
  unitText,
  iconMaxHeight,
  containerStyles,
  bodyStyle,
  labelStyle,
  iconContainerStyles = {},
  enabled,
  shouldTranslate = true,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.getAttribute('to') !== '') {
      return;
    }
    event.preventDefault();
  };

  return (
    <Box
      display="flex"
      alignItems={bodyText ? 'flex-start' : 'center'}
      sx={{...containerStyles}}
      minHeight="60px">
      <Box
        sx={{
          backgroundColor: iconBackground,
          p: '0.7em',
          display: 'flex',
          justifyContent: 'center',
          mr: '0.8em',
          maxHeight: iconMaxHeight || 'default',
          ...iconContainerStyles,
        }}>
        {icon}
      </Box>
      <Box sx={{textWrap: 'nowrap'}}>
        <Typography
          component="div"
          variant={titleTextVariant || 'caption'}
          color={
            enabled ? theme.palette.text.primary : theme.palette.text.secondary
          }
          sx={{...labelStyle}}>
          {t(label)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'baseline',
            fontWeight: '600',
          }}>
          {navigateTo ? (
            <Link
              component={RouterLink}
              onClick={handleLinkClick}
              to={`${navigateTo}`}
              underline="hover"
              variant="body2"
              style={{paddingTop: '0.2em', display: 'flex', fontWeight: '600'}}
              color={theme.palette.info.main}>
              {typeof bodyText === 'string' ? (
                <Typography
                  component="div"
                  variant={bodyTextVariant || 'body2'}
                  sx={{
                    ...bodyStyle,
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'wrap',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    display: '-webkit-box',
                    wordBreak: 'break-all',
                  }}>
                  {hasProtocol(bodyText) ? bodyText : t(bodyText)}
                </Typography>
              ) : (
                bodyText
              )}
            </Link>
          ) : typeof bodyText === 'string' ? (
            <Typography
              component="div"
              variant={bodyTextVariant || 'body2'}
              sx={{
                fontSize: '0.9rem',
                fontWeight: '600',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                whiteSpace: 'wrap',
                display: '-webkit-box',
                wordBreak: 'break-all',
                ...bodyStyle,
              }}>
              {hasProtocol(bodyText) || !shouldTranslate
                ? bodyText
                : t(bodyText)}
            </Typography>
          ) : (
            bodyText
          )}
          {unitText && bodyText !== '-' && <span>{t(unitText)}</span>}
        </Box>
      </Box>
    </Box>
  );
};
