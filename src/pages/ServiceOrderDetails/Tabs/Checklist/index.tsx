import {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Grid,
  LinearProgress,
  Typography,
  linearProgressClasses,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Send from '@mui/icons-material/Send';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {FormikProps, useFormik} from 'formik';
import {EmptySection} from 'components/EmptySection';
import {FormLabel} from 'components/form/FormLabel';
import {InfoCard} from 'components/InfoCard';
import {PageCard} from 'components/PageCard';
import {Progress} from 'components/Progress';
import {Button} from 'components/Button';
import {
  usePublishChecklist,
  useServiceOrderCheckList,
  useUpdateServiceOrderCheckListAnswers,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {ChecklistStatus, ServiceOrderView} from 'models/service-order';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {PdfGenerationStatus} from 'models/misc';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {CheckListQuestion, CheckListComponentType} from 'models/checklist';
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

interface FormikValues {
  checkListAnswers: CheckListQuestion[];
}

export const CheckList = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const {mutate: updateServiceOrderCheckListAnswers} =
    useUpdateServiceOrderCheckListAnswers();

  const {mutateAsync: publishCheckList, isLoading: publishingCheckList} =
    usePublishChecklist();

  const {data: serviceOrderCheckList, isLoading: isLoadingCheckList} =
    useServiceOrderCheckList(
      serviceOrder?.additionalInfo.checkListInfo?.checkListId &&
        serviceOrder.id,
    );
  const isPdfGenerated = useRef(
    serviceOrder?.additionalInfo.checkListInfo?.pdfGenerationStatus ===
      PdfGenerationStatus.DONE,
  ).current;

  const {data: pdfDownloadUrl = {}} = useDownloadUrl(
    isPdfGenerated && serviceOrder!.additionalInfo.checkListInfo
      ? [serviceOrder!.additionalInfo.checkListInfo?.pdfPath]
      : [],
  );

  const {data: signatureDownloadUrls = {}} = useDownloadUrl(
    serviceOrder?.additionalInfo.checkListInfo?.checkListId
      ? [serviceOrder.additionalInfo.checkListInfo.technicianSignature]
      : [],
  );

  const formik: FormikProps<FormikValues> = useFormik<FormikValues>({
    initialValues: {
      checkListAnswers: [],
    },
    onSubmit: async (values: FormikValues) => {
      await updateServiceOrderCheckListAnswers({
        serviceOrderId: serviceOrder.id || '',
        body: values.checkListAnswers.map((q) => ({
          questionId: q.id,
          answer: q.question,
        })),
      });
      formik.resetForm({
        values: {
          ...formik.values,
          checkListAnswers: [...values.checkListAnswers],
        },
      });
    },
  });

  const technicianUserAccount =
    serviceOrder?.schedules?.[0]?.technician?.userAccount;
  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

  const signaturePath = useMemo(
    () =>
      serviceOrder &&
      serviceOrder.additionalInfo.checkListInfo &&
      signatureDownloadUrls[
        serviceOrder.additionalInfo.checkListInfo.technicianSignature
      ],
    [serviceOrder, signatureDownloadUrls],
  );

  const checklistSummary = useMemo(() => {
    const componentsWithoutHead =
      serviceOrderCheckList?.components.filter(
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
  }, [serviceOrderCheckList?.components]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done / checklistSummary.all) * 100,
  );

  if (isLoadingCheckList) {
    return <Progress />;
  }

  if (
    !serviceOrder?.additionalInfo.checkListInfo?.checkListId ||
    serviceOrder?.additionalInfo.checkListInfo?.status !==
      ChecklistStatus.COMPLETED
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
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      pt="1.5rem"
      rowGap="27px">
      <Grid item xs={12} lg={7} flexBasis="100%">
        <PageCard
          containerStyles={{
            borderRadius: '0.5rem',
          }}
          contentContainerStyles={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: {xs: 10, lg: 15},
            padding: 1.25,
            '&:last-child': {
              pb: 1.25,
            },
          }}>
          <Box flex={1}>
            <FormLabel text="Date" sx={{color: theme.palette.text.primary}} />
            <Typography variant="subtitle1">{serviceOrder.dueDate}</Typography>
          </Box>

          <Box flex={1}>
            <FormLabel
              text="Type"
              sx={{color: theme.palette.text.primary, display: 'block'}}
            />
            <Box display="flex" alignItems="flex-end" gap="0.5rem">
              <ServiceOrderIcons
                serviceOrderType={serviceOrder.type}
                size="medium"
              />
              <ServiceOrderTypeText
                serviceOrderType={serviceOrder.type}
                capitalizeText
                variant="subtitle1"
              />
            </Box>
          </Box>

          <Box flex={1}>
            <FormLabel text="Job ID" sx={{color: theme.palette.text.primary}} />
            <Typography variant="subtitle1">{serviceOrder.number}</Typography>
          </Box>

          <Box flex={1}>
            <FormLabel text="Status" sx={{color: theme.palette.text.primary}} />
            <Typography variant="subtitle1">
              <StatusChip
                color={getServiceOrderStatusColor(serviceOrder.status)}
                label={serviceOrderStatusToString(serviceOrder.status)}
              />
            </Typography>
          </Box>
        </PageCard>
      </Grid>
      <Grid item xs={12} lg={7} pb="5rem">
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
                    {percentComplete}% complete
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
                  {serviceOrderCheckList?.name ?? ''}
                </Typography>

                <Box display="flex" flexDirection="column" rowGap={3}>
                  {serviceOrderCheckList?.components.map((component) => (
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
                  onClick: () => {
                    const url = isPdfGenerated
                      ? serviceOrder!.additionalInfo.checkListInfo!.pdfPath
                      : '';
                    window.open(pdfDownloadUrl[url], '_blank');
                  },
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
