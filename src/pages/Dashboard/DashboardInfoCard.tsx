import React from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {InfoCard, Props as InfoCardProps} from 'components/InfoCard';
import {EmptySection} from 'components/EmptySection';
import {Chip, Typography} from '@mui/material';
import {SeeMore} from './SeeMore';

const InfoCardHeaderChip = ({label}: {label: string}) => {
  const theme = useTheme();
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        color: '#fff',
        bgcolor: theme.palette.primary.light,
        borderRadius: '0.25rem',
        ml: '0.5rem',
        px: '0.28rem',
      }}
    />
  );
};

export const DashboardInfoCard = ({
  title,
  chipLabel,
  seeMorePath,
  emptySection,
  children,
  ...props
}: InfoCardProps & {
  title: string;
  chipLabel: string;
  seeMorePath: string;
  emptySection: {show: boolean; label: string};
  children: React.ReactNode;
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <InfoCard
      containerStyles={{
        height: '100%',
        [theme.breakpoints.up('md')]: {
          minHeight: '19.125rem',
        },
      }}
      bodyContainerStyle={{
        paddingBottom: '0px !important',
        ...props.bodyContainerStyle,
      }}
      header={
        <Typography variant="subtitle1">
          {t(title)} <InfoCardHeaderChip label={chipLabel} />
        </Typography>
      }
      headerStyles={{
        py: '0.25rem',
        px: '0.5rem',
      }}
      showHeaderBackground
      {...props}>
      {children}
      {emptySection.show ? (
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{height: '75%'}}
          label={emptySection.label}
        />
      ) : (
        <SeeMore path={seeMorePath} />
      )}
    </InfoCard>
  );
};
