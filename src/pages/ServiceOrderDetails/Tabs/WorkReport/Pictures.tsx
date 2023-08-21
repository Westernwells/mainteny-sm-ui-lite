import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {InfoCard} from 'components/InfoCard';
import MUIDialog from '@mui/material/Dialog';
import useTheme from '@mui/material/styles/useTheme';
import {Carousel} from 'components/Carousel';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {ElevatorView} from 'models/elevator';
import {useState} from 'react';
import {EmptySection} from 'components/EmptySection';
import {olStyles} from 'styles';
import {Grid} from '@mui/material';
import {format} from 'date-fns';

interface Props {
  elevator: ElevatorView;
}

export const Pictures = ({elevator}: Props) => {
  const {t} = useTranslation();
  const [openPreview, setOpenPreview] = useState(false);
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);

  const {data: downloadUrls = {}} = useDownloadUrl(
    elevator.additionalInfo.pictures
      ? elevator.additionalInfo?.pictures?.map((item) => item.uri)
      : [],
  );

  const isEmpty =
    !elevator.additionalInfo.pictures ||
    elevator.additionalInfo.pictures.length === 0;

  const renderEmptySection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        label="No picture has been added yet!"
        illustration="clipboard"
        size="tiny"
        containerStyle={{
          height: '100%',
        }}
      />
    </Box>
  );

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      bodyContainerStyle={{
        [theme.breakpoints.up('lg')]: {
          height: '100%',
          overflowY: 'hidden',

          '&:hover': {
            overflowY: 'auto',
            ...olStyles.verticlaScrollBar,
          },
        },
        [theme.breakpoints.down('md')]: {
          height: '100%',
          overflowY: 'auto',
        },
      }}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Pictures')}</Typography>}>
      {isEmpty ? (
        renderEmptySection()
      ) : elevator.additionalInfo.pictures.length ? (
        <Box display="flex" flexDirection="column">
          <Grid container spacing={3}>
            {elevator.additionalInfo?.pictures?.map((picture, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={4}
                key={picture.id}
                display="flex"
                flexDirection="column">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={`1px solid ${theme.palette.text.disabled}`}
                  borderRadius={1}
                  onClick={() => {
                    setOpenPreview(true);
                    setActiveStep(index);
                  }}
                  sx={{cursor: 'pointer'}}>
                  <img
                    alt=""
                    width="100%"
                    height="262px"
                    src={downloadUrls[picture.uri]}
                    style={{objectFit: 'cover'}}
                  />
                </Box>

                <Typography
                  variant="body1"
                  color={theme.palette.text.primary}
                  pl={0}
                  mt={2}
                  pr={1.75}
                  sx={{
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                  }}>
                  {picture.description}
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.palette.text.secondary}>
                  {format(new Date(picture.createdAt), 'dd.MM.yyyy, HH:mm')}h
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}

      <MUIDialog
        onClose={() => setOpenPreview(false)}
        open={openPreview}
        maxWidth="sm">
        <Carousel
          images={elevator?.additionalInfo?.pictures?.map((p) => ({
            label: p.description,
            imgPath: downloadUrls[p.uri],
          }))}
          onClose={() => setOpenPreview(false)}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      </MUIDialog>
    </InfoCard>
  );
};
