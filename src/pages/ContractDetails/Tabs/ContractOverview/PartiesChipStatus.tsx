import React, {FC} from 'react';
import {Chip} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface Props {
  partyType: string;
  color: string;
  maxChars?: number;
  length?: 'short' | 'medium' | 'long' | 'auto';
}

const statusWidth = {
  auto: 'auto',
  short: '6rem',
  medium: '8rem',
  long: '10rem',
};

const statusColor: Record<string, {[key: string]: string}> = {
  primary: {
    color: '#0B79D0',
    bg: 'rgba(33, 150, 243, 0.08)',
  },
  warning: {
    color: '#ED6C02',
    bg: 'rgba(237, 108, 2, 0.08)',
  },
};

const PartiesChipStatus: FC<Props> = ({
  color,
  partyType,
  maxChars,
  length = 'auto',
}) => {
  const {t} = useTranslation();
  return (
    <Chip
      label={t(partyType)}
      sx={{
        border: `1px solid ${statusColor[color].color}`,
        textTransform: 'lowercase',
        '& :first-letter': {
          textTransform: 'uppercase',
        },
        backgroundColor: 'primary.contrastText',
        color: statusColor[color].color,
        maxWidth: maxChars ? `calc(${maxChars}ch + .5em)` : statusWidth[length],
        width: maxChars ? '100%' : 'auto',
      }}
      variant="filled"
      size="medium"
    />
  );
};

export default PartiesChipStatus;
