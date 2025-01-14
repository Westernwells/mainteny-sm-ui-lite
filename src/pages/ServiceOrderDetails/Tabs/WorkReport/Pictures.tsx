import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {InfoCard} from 'components/InfoCard';
import MUIDialog from '@mui/material/Dialog';
import useTheme from '@mui/material/styles/useTheme';
import {Carousel} from 'components/Carousel';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useState} from 'react';
import {EmptySection} from 'components/EmptySection';
import {olStyles} from 'styles';
import {Grid, IconButton} from '@mui/material';
import {format} from 'date-fns';
import {ServiceOrderReportAttachmentView} from 'models/service-order';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

interface Props {
  attachments: ServiceOrderReportAttachmentView[];
  onDeleteImage: (picture: ServiceOrderReportAttachmentView) => void;
  isEditMode: boolean;
}

export const Pictures = ({attachments, onDeleteImage, isEditMode}: Props) => {
  const {t} = useTranslation();
  const [openPreview, setOpenPreview] = useState(false);
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);

  const {data: downloadUrls = {}} = useDownloadUrl(
    attachments ? attachments?.map((item) => item.fileResource.uri) : [],
  );

  const isEmpty = !attachments || attachments.length === 0;

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
      ) : attachments.length ? (
        <Box display="flex" flexDirection="column">
          <Grid container spacing={3}>
            {attachments?.map((picture, index) => (
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
                  sx={{cursor: 'pointer', position: 'relative'}}>
                  <img
                    alt=""
                    width="100%"
                    height="262px"
                    src={downloadUrls[picture.fileResource.uri]}
                    style={{objectFit: 'cover'}}
                  />
                  {isEditMode && (
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteImage(picture);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#8F9BB380',
                        zIndex: 2,
                        borderRadius: '50%',
                        '&:hover': {background: '#828DA3'},
                      }}>
                      <DeleteOutlineOutlinedIcon sx={{color: 'white'}} />
                    </IconButton>
                  )}
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
                  {picture.fileResource.description}
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.palette.text.secondary}>
                  {format(
                    new Date(picture.fileResource.createdAt),
                    'dd.MM.yyyy, HH:mm',
                  )}
                  h
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}

      <MUIDialog
        onClose={() => setOpenPreview(false)}
        open={openPreview}
        maxWidth="sm"
        sx={{
          '& .MuiDialog-container > .MuiPaper-root': {
            minHeight: '50%',
            minWidth: '50%',
          },
        }}>
        <Carousel
          images={attachments?.map((p) => ({
            label: p.fileResource.description,
            imgPath: downloadUrls[p.fileResource.uri],
          }))}
          onClose={() => setOpenPreview(false)}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      </MUIDialog>
    </InfoCard>
  );
};
