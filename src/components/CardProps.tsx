import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {SxProps} from '@mui/system';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import Link from '@mui/material/Link';
import {Link as RouterLink} from 'react-router-dom';
import {Tooltip} from '@mui/material';
import {hasProtocol} from '../utils/utils';

interface Props {
  icon?: JSX.Element;
  label: string;
  navigateTo?: string;
  bodyTextVariant?: any;
  titleTextVariant?: any;
  iconBackground?: string;
  bodyText?: string | JSX.Element | ReactNode;
  unitText?: string;
  iconMaxHeight?: string | number;
  containerStyles?: SxProps;
  bodyStyle?: SxProps;
  labelStyle?: SxProps;
  iconContainerStyles?: SxProps;
  enabled?: boolean;
  shouldTranslate?: boolean;
  iconTooltip?: string;
  hasMaxWidth?: boolean;
  testId?: string;
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
  iconTooltip,
  shouldTranslate = true,
  hasMaxWidth = true,
  testId,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  // Helper function to check if the bodyText is an email
  const isEmail = (text: string) => text.includes('@');

  const getCommonLinkStyles = () => ({
    paddingTop: '0.2em',
    display: 'block',
    fontWeight: '600',
    maxWidth: '300px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'wrap',
  });

  const renderIcon = () => {
    if (iconTooltip?.trim().length) {
      return (
        <Tooltip title={t(iconTooltip!)} placement="top" arrow>
          <Box
            sx={{
              backgroundColor: iconBackground,
              py: '0.7em',
              pr: '0.2em',
              display: 'flex',
              justifyContent: 'center',
              mr: '0.5em',
              maxHeight: iconMaxHeight || 'default',
              cursor: 'pointer',
              ...iconContainerStyles,
            }}>
            {icon}
          </Box>
        </Tooltip>
      );
    }

    return (
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
    );
  };

  return (
    <Box
      data-testid={`${testId}_container`}
      display="flex"
      alignItems={bodyText ? 'flex-start' : 'center'}
      sx={{...containerStyles}}
      minHeight="60px">
      {icon && renderIcon()}
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
          data-testid={testId}
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'baseline',
            fontWeight: '600',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
          {typeof bodyText === 'string' ? (
            isEmail(bodyText) ? (
              <Link
                href={`mailto:${bodyText}`}
                underline="hover"
                variant="body2"
                sx={getCommonLinkStyles()}
                color={theme.palette.info.main}>
                {bodyText}
              </Link>
            ) : navigateTo ? (
              <Link
                component={RouterLink}
                to={navigateTo}
                underline="hover"
                variant="body2"
                sx={getCommonLinkStyles()}
                color={theme.palette.info.main}>
                {bodyText}
              </Link>
            ) : (
              <Typography
                component="div"
                variant={bodyTextVariant || 'body2'}
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: '300',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  display: '-webkit-box',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  ...(hasMaxWidth && {maxWidth: '300px'}),
                  textWrap: 'wrap',
                  flex: 1,
                  ...bodyStyle,
                }}>
                {hasProtocol(bodyText) || !shouldTranslate
                  ? bodyText
                  : t(bodyText)}
              </Typography>
            )
          ) : (
            bodyText
          )}

          {unitText && bodyText !== '-' && <span>{t(unitText)}</span>}
        </Box>
      </Box>
    </Box>
  );
};
