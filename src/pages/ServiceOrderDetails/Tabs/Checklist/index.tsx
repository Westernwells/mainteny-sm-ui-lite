import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Grid,
  LinearProgress,
  Typography,
  linearProgressClasses,
  Chip,
  FormControl,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Send from '@mui/icons-material/Send';
import {HandymanOutlined, InfoOutlined} from '@mui/icons-material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {PageCard} from 'components/PageCard';
import {Progress} from 'components/Progress';
import {Button} from 'components/Button';
import {usePublishChecklist} from 'hooks/reactQuery/useServiceOrder';
import {useQueryServiceOrderChecklists} from 'hooks/reactQuery/useChecklists';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {ChecklistStatus, ServiceOrderView} from 'models/service-order';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useFormatDate} from 'hooks/useFormatDate';
import {PdfGenerationStatus} from 'models/misc';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {CardProps} from 'components/CardProps';
import {CheckListComponentType} from 'models/checklist';
import {ChecklistComponent} from './ChecklistComponent';

const EmptyCheckList = () => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{width: '60%'}}
    label="No checklist yet."
  />
);

interface Props {
  serviceOrder: ServiceOrderView;
}

export const CheckList = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);

  const {mutateAsync: publishCheckList, isLoading: publishingCheckList} =
    usePublishChecklist();

  const {data: serviceOrderCheckLists, isLoading: isLoadingCheckList} =
    useQueryServiceOrderChecklists({serviceOrderId: serviceOrder.id});

  const isPdfGenerated = serviceOrder.checkLists?.every(
    (c) => c.pdfGenerationStatus === PdfGenerationStatus.DONE,
  );

  const {data: pdfDownloadUrl = {}} = useDownloadUrl(
    isPdfGenerated && serviceOrderCheckLists?.length
      ? serviceOrderCheckLists.map((c) => c.additionalInfo.pdfPath || '')
      : [],
  );

  const [pdfPathToDownload, setPdfPathToDownload] = useState('');
  const {downloadFile} = useDownloadFileWithCustomName(
    serviceOrder?.number,
    pdfDownloadUrl[pdfPathToDownload],
  );

  const {data: signatureDownloadUrls = {}} = useDownloadUrl(
    serviceOrderCheckLists?.length
      ? serviceOrderCheckLists.map(
          (c) => c.additionalInfo.technicianSignature || '',
        )
      : [],
  );

  const labels =
    serviceOrder.checkLists?.map((c) => {
      const schedule = serviceOrder.schedules.find(
        (s) => s.technician.id === c.technicianId,
      );
      const checklistNumber =
        serviceOrderCheckLists?.find(
          (serviceOrderCheckList) =>
            serviceOrderCheckList.checkListId === c.checkListId,
        )?.checkList.number || 'Unassigned';
      return {
        value: {
          checklistId: c.checkListId,
          technicianId: c.technicianId,
        },
        label: `${checklistNumber}-${schedule?.technician.userAccount.firstName} ${schedule?.technician.userAccount.lastName}`,
      };
    }) || [];

  const [selectedOption, setSelectedOption] = useState(labels[0]?.value || '');
  const selectedChecklist = serviceOrderCheckLists?.find(
    (c) =>
      c.checkListId === selectedOption.checklistId &&
      c.technicianId === selectedOption.technicianId,
  );

  const technicianUserAccount = serviceOrder.schedules.find(
    (s) => s.technician.id === selectedOption.technicianId,
  )?.technician.userAccount;
  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedOption(JSON.parse(event.target.value));
  };

  const signaturePath =
    signatureDownloadUrls[
      selectedChecklist?.additionalInfo.technicianSignature || ''
    ];

  const checklistSummary = useMemo(() => {
    const componentsWithoutHead =
      selectedChecklist?.checkList.components.filter(
        (c) => c.type !== CheckListComponentType.HEAD,
      ) ?? [];
    const doneList = componentsWithoutHead.filter((item) => {
      if (item.type === CheckListComponentType.TEXT) {
        return !!item.additionalInfo.note;
      }

      if (item.additionalInfo.moreInfoInNote && !!item.additionalInfo.note) {
        return true;
      }

      return (item.additionalInfo.answer?.length || 0) > 0;
    });

    return {all: componentsWithoutHead.length, done: doneList.length};
  }, [selectedChecklist]);

  useEffect(() => {
    setPdfPathToDownload(selectedChecklist?.additionalInfo.pdfPath || '');
  }, [selectedChecklist]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done / checklistSummary.all) * 100,
  );

  if (isLoadingCheckList) {
    return <Progress />;
  }

  if (
    !serviceOrder.checkLists?.length ||
    !serviceOrder.checkLists?.every(
      (c) => c.status === ChecklistStatus.COMPLETED,
    )
  ) {
    return (
      <InfoCard
        disabledHeader
        containerStyles={{
          mb: '1.2rem',
          padding: '11rem 0 11rem 0',
        }}
        bodyContainerStyle={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <EmptyCheckList />
      </InfoCard>
    );
  }

  return (
    <Grid container alignItems="center" justifyContent="center" rowGap="27px">
      <Grid item lg={8} flexBasis="100%">
        <Grid container spacing={2}>
          <Grid
            item
            md={8}
            sx={{
              py: '0em',
            }}>
            <PageCard
              headerLabel="General Information"
              headerIcon={
                <InfoOutlined sx={{color: theme.palette.text.disabled}} />
              }
              containerStyles={{
                borderRadius: '0.5rem',
              }}
              contentContainerStyles={{
                display: 'grid',
                gridAutoColumns: 'minmax(0, 1fr)',
                gridAutoFlow: 'column',
                padding: 1.25,
                '&:last-child': {
                  pb: 1.25,
                },
              }}>
              <CardProps
                label="Date"
                containerStyles={{alignItems: 'center'}}
                bodyTextVariant="subtitle1"
                bodyText={formatDate(serviceOrder.dueDate)}
                bodyStyle={{fontWeight: '600'}}
              />
              <CardProps
                label="Type"
                bodyTextVariant="subtitle1"
                containerStyles={{alignItems: 'center'}}
                bodyText={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ServiceOrderIcons
                      serviceOrderType={serviceOrder.type}
                      size="small"
                    />
                    <ServiceOrderTypeText
                      serviceOrderType={serviceOrder.type}
                      capitalizeText
                      variant="subtitle1"
                      style={{fontWeight: '600'}}
                    />
                  </Box>
                }
                bodyStyle={{fontWeight: '600'}}
              />
              <CardProps
                label="Job ID"
                bodyTextVariant="subtitle1"
                containerStyles={{alignItems: 'center'}}
                bodyText={serviceOrder.number}
                bodyStyle={{fontWeight: '600'}}
              />
              <CardProps
                label="Status"
                bodyTextVariant="subtitle1"
                containerStyles={{alignItems: 'center'}}
                bodyText={
                  <StatusChip
                    color={getServiceOrderStatusColor(serviceOrder.status)}
                    label={serviceOrderStatusToString(serviceOrder.status)}
                  />
                }
                bodyStyle={{fontWeight: '600'}}
              />
            </PageCard>
          </Grid>
          <Grid
            item
            md={4}
            sx={{
              py: '0em',
            }}>
            <PageCard
              customHeader={
                <Box display="flex" gap={1}>
                  <HandymanOutlined sx={{color: theme.palette.text.disabled}} />
                  <Typography sx={{fontWeight: '600'}}>
                    {t('Engineer(s)')}
                  </Typography>
                  <Chip
                    label={serviceOrder.checkLists?.length || 0}
                    size="small"
                    sx={{
                      color: theme.palette.primary.dark,
                      bgcolor: 'rgba(143, 155, 179, 0.25)',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      '& .MuiChip-label': {
                        overflow: 'visible',
                      },
                    }}
                  />
                </Box>
              }
              contentContainerStyles={{
                display: 'flex',
                flex: 'wrap',
                justifyContent: 'space-between',
                pb: '0.5em !important',
              }}>
              <Grid
                sx={{
                  minHeight: '60px',
                }}
                container>
                <Grid item sm={12} md={12}>
                  <FormControl fullWidth sx={{marginBlock: '0.5em'}}>
                    <Select
                      labelId="technicianSelect-label"
                      id="technicianSelect"
                      value={JSON.stringify(selectedOption)}
                      size="small"
                      onChange={handleChange}>
                      {labels.map((item) => (
                        <MenuItem
                          value={JSON.stringify(item.value)}
                          key={item.label}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </PageCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item lg={8} flexBasis="100%" pb="5rem">
        <Box
          bgcolor="white"
          border="2px solid #eee"
          borderRadius="10px"
          sx={{px: 1, py: 3}}>
          <Box p={2} pt={0}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1" color="text.secondary">
                {t('Checklist overview')}
              </Typography>
              <Box minWidth="250px">
                <Box display="flex" justifyContent="space-between" pb={0.5}>
                  <Typography variant="caption">
                    {checklistSummary.done}/{checklistSummary.all}{' '}
                    {t('options')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {percentComplete}% {t('complete')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentComplete}
                  sx={{
                    backgroundColor: `${theme.palette.text.secondary}66`,
                    [`& .${linearProgressClasses.bar}`]: {
                      backgroundColor: '#4CAF50',
                    },
                  }}
                />
              </Box>
            </Box>

            <Box
              bgcolor="grey.100"
              borderRadius="4px"
              mt={2}
              p={1}
              display="flex"
              flexDirection="column"
              gap="1rem">
              <Box
                bgcolor="white"
                p={4}
                display="flex"
                flexDirection="column"
                rowGap={2}>
                <Typography
                  variant="h5"
                  color={theme.palette.primary.dark}
                  fontSize="31px"
                  py={2}>
                  {selectedChecklist?.checkList.name ?? ''}
                </Typography>

                <Box display="flex" flexDirection="column" rowGap={3}>
                  {selectedChecklist?.checkList?.components.map((component) => (
                    <ChecklistComponent
                      key={component.id}
                      component={component}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box bgcolor="white" px="1rem" py={4}>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              {t('Signature')}
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              mt="0.5rem"
              mb="2.3rem"
              py="2.5rem"
              border="1px solid"
              borderColor="grey.300"
              borderRadius="0.5rem"
              position="relative"
              maxWidth="15rem"
              maxHeight="7rem">
              <Box>
                {signaturePath ? (
                  <img
                    alt=""
                    src={signaturePath}
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'top',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                ) : (
                  t('No Signature')
                )}
              </Box>
              {technicianName && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  top="6rem"
                  bgcolor="white"
                  px="0.625rem"
                  position="absolute"
                  maxWidth="17.5rem">
                  <Typography
                    variant="subtitle1"
                    color={theme.palette.text.primary}>
                    {technicianName}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.text.secondary}>
                    {t('Technician')}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: '1em'}}>
              <Button
                label="Download"
                buttonProps={{
                  variant: 'outlined',
                  size: 'medium',
                  disabled: !isPdfGenerated,
                  onClick: downloadFile,
                  sx: {
                    background: 'transparent',
                  },

                  startIcon: <FileDownloadIcon />,
                }}
              />

              <Button
                label={t('Send Checklist')}
                buttonProps={{
                  variant: 'contained',
                  size: 'medium',
                  onClick: () => setIsSendEmailDialogOpen(true),
                  sx: {
                    ml: '1em',
                  },

                  startIcon: <Send />,
                }}
              />
            </Box>

            <SendEmailDialog
              open={isSendEmailDialogOpen}
              onClose={() => setIsSendEmailDialogOpen(false)}
              confirmBtnDisabled={publishingCheckList}
              email={
                serviceOrder.elevator.propertyOwner?.additionalInfo
                  .billingEmail ||
                serviceOrder.elevator.propertyOwner?.contact.email
              }
              content={serviceOrder.description}
              callback={async (emailRecord) => {
                setIsSendEmailDialogOpen(false);
                await publishCheckList({
                  id: serviceOrder!.id,
                  params: {
                    checkListId: selectedChecklist?.checkListId || '',
                    technicianId: selectedChecklist?.technicianId || '',
                  },
                  body: {
                    email: emailRecord.email,
                    subject: emailRecord.subject,
                    content: emailRecord.content,
                  },
                });
              }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
