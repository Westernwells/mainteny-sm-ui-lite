import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import {A4Layout} from 'components/A4Layout';
import {SelectCombined} from 'components/SelectCombined';
import {EmptySection} from 'components/EmptySection';
import {FormLabel} from 'components/form/FormLabel';
import {
  useCompleteServiceOrder,
  usePublishWorkReport,
} from 'hooks/reactQuery/useServiceOrder';
import {
  CompleteServiceOrder,
  ServiceOrderArticleView,
  ServiceOrderView,
} from 'models/service-order';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {FormInput} from 'components/form/FormInput';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  articleViewToArticleRecord,
  calculateTotalBillableHours,
  convertTimeSlotDatesToRestDateTime,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {convertDigitalMinsToHM} from 'utils/datetime';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Maintenance} from './Maintenance';
import {Signature} from './Signature';
import {ReportCard} from './ReportCard';
import {ArticleItemsTable} from './ArticleItemsTable';
import {Pictures} from './Pictures';

interface Props {
  serviceOrder: ServiceOrderView;
  downloadWorkReport: (() => void) | null;
}

const validationSchema = Yup.object().shape({
  serviceTimeHM: Yup.string()
    .required()
    .matches(/^[0-9]{2}:[0-9]{2}$/, {
      message: 'Total time must be in 00:00 format',
    }),
});

export const WorkReport = ({serviceOrder, downloadWorkReport}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();

  const [articles, setArticles] = useState<ServiceOrderArticleView[]>([]);
  const report = serviceOrder?.report;
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const {mutate: publishWorkReport, isLoading: publishingWorkReport} =
    usePublishWorkReport();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const signatureKeys = {
    CUSTOMER: `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/CUSTOMER.png`,
    TECHNICIAN: `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/TECHNICIAN.png`,
  };

  const {data: downloadUrls = {}} = useDownloadUrl(
    report?.signatures?.map((item) => item.fileResource.uri) ?? [],
    {enabled: !!report?.signatures?.length},
  );

  const {mutate: completeServiceOrder, isLoading: updatingServiceOrder} =
    useCompleteServiceOrder('Work report updated successfully!');
  const formik = useFormik<CompleteServiceOrder & {serviceTimeHM: string}>({
    initialValues: {
      articles: articleViewToArticleRecord(articles),
      description: '',
      startTime: serviceOrder?.actualStartTime,
      endTime: serviceOrder?.actualEndTime,
      travelStartTime: serviceOrder?.travelStartTime,
      travelEndTime: serviceOrder?.travelEndTime,
      serviceTimeHM: convertDigitalMinsToHM(report?.actualServiceTime ?? 0),
      onlyShowTotalTime: report?.additionalInfo?.onlyShowTotalTime ?? false,
      workTimeRecord: {
        percentageSurcharge: 0,
        timeSlots: [],
      },
      travelTimeRecord: {
        percentageSurcharge: 0,
        timeSlots: [],
      },
    },
    onSubmit: (values) => {
      completeServiceOrder({
        serviceOrderId: serviceOrder.id ?? '',
        body: {
          description: values.description,
          articles: articleViewToArticleRecord(articles),

          serviceTime: calculateTotalBillableHours([values.workTimeRecord!]),
          travelTime: calculateTotalBillableHours([values.travelTimeRecord!]),
          onlyShowTotalTime: values.onlyShowTotalTime,
          workTimeRecord: convertTimeSlotDatesToRestDateTime(
            values.workTimeRecord,
          ),
          travelTimeRecord: convertTimeSlotDatesToRestDateTime(
            values.travelTimeRecord,
          ),
        },
      });
    },
    validationSchema,
  });

  useEffect(() => {
    if (report) {
      let temp: ServiceOrderArticleView[] = [];
      if ('articles' in serviceOrder) {
        temp = serviceOrder.articles;
      }
      setArticles(temp);
      formik.resetForm({
        values: {
          articles: articleViewToArticleRecord(temp),
          description: report?.description ?? '',
          startTime: serviceOrder?.actualStartTime,
          endTime: serviceOrder?.actualEndTime,
          travelStartTime: serviceOrder?.travelStartTime,
          travelEndTime: serviceOrder?.travelEndTime,
          serviceTimeHM: convertDigitalMinsToHM(report?.actualServiceTime ?? 0),
          onlyShowTotalTime: report?.additionalInfo?.onlyShowTotalTime ?? false,
          workTimeRecord: {
            percentageSurcharge:
              serviceOrder.additionalInfo.workTimeInfo?.percentageSurcharge ??
              0,
            timeSlots:
              serviceOrder.additionalInfo.workTimeInfo?.timeSlots ?? [],
          },
          travelTimeRecord: {
            percentageSurcharge:
              serviceOrder.additionalInfo.travelTimeInfo?.percentageSurcharge ??
              0,
            timeSlots:
              serviceOrder.additionalInfo.travelTimeInfo?.timeSlots ?? [],
          },
        },
      });
    }
  }, [report]);

  useEffect(() => {
    formik.setFieldValue('workTimeRecord', {
      percentageSurcharge:
        serviceOrder.additionalInfo.workTimeInfo?.percentageSurcharge ?? 0,
      timeSlots: serviceOrder.additionalInfo.workTimeInfo?.timeSlots ?? [],
    });
    formik.setFieldValue('travelTimeRecord', {
      percentageSurcharge:
        serviceOrder.additionalInfo.travelTimeInfo?.percentageSurcharge ?? 0,
      timeSlots: serviceOrder.additionalInfo.travelTimeInfo?.timeSlots ?? [],
    });
  }, [
    serviceOrder.additionalInfo.workTimeInfo,
    serviceOrder.additionalInfo.travelTimeInfo,
  ]);

  useEffect(() => {
    if (articles.length) {
      formik.setFieldValue('articles', articleViewToArticleRecord(articles));
    }
  }, [articles]);

  if (!report) {
    return (
      <PageCard containerStyles={{py: '3em'}}>
        <EmptySection label="No work report yet. It will appear here once the order is completed." />
      </PageCard>
    );
  }

  return (
    <Box width="min(calc(1240px + 1.25em), 100%)" mx="auto">
      <ReportCard
        date={report.meta.createdAt}
        type={serviceOrder.type}
        number={serviceOrder.number}
        status={serviceOrder.status}
      />
      <A4Layout>
        <Box display="flex" mt="1em" gap="2em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <SelectCombined
              selected
              label="Customer Details"
              buttonText=""
              cardHeader={
                <Typography variant="body2">
                  {serviceOrder.elevator.propertyOwner.name}
                </Typography>
              }
              cardBody={
                <>
                  <Typography variant="caption">
                    {serviceOrder.elevator.propertyOwner.billingAddress
                      ?.fullName ?? '-'}
                  </Typography>
                  <Typography variant="caption" component="p">
                    {serviceOrder.elevator.propertyOwner.contact.phone}
                  </Typography>
                  <Typography variant="subtitle2" component="p">
                    {t('Customer Number')}
                  </Typography>
                  <Typography variant="caption" component="p">
                    {serviceOrder.elevator.propertyOwner.externalId || '-'}
                  </Typography>
                </>
              }
              modalHeader=""
              modalBody={null}
            />
            <SelectCombined
              selected
              label="Unit Details"
              buttonText=""
              cardHeader={
                <Typography variant="body2">
                  {serviceOrder.elevator.model}
                </Typography>
              }
              cardBody={
                <>
                  <Typography variant="caption">
                    {serviceOrder.elevator.address.fullName}
                  </Typography>
                  <Typography variant="subtitle2" component="p">
                    {t('Unit Number')}
                  </Typography>
                  <Typography variant="caption" component="p">
                    {serviceOrder.elevator.externalId || '-'}
                  </Typography>
                </>
              }
              modalHeader=""
              modalBody={null}
            />
          </Box>
          <Box
            width="40%"
            display="flex"
            flexDirection="column"
            gap="2em"
            mt="1.5em">
            {report &&
              [
                {
                  label: 'Report ID',
                  value: report.number,
                },
                {
                  label: 'Job ID',
                  value: serviceOrder.number,
                },
                {
                  label: 'Technician',
                  value:
                    serviceOrder.schedules.length &&
                    `${serviceOrder.schedules[0].technician.userAccount.firstName} ${serviceOrder.schedules[0].technician.userAccount.lastName}`,
                },
                {
                  label: 'Status',
                  value: `${t(
                    serviceOrderStatusToString(serviceOrder.status),
                  )}`,
                },
              ].map((i) => (
                <Box key={i.label}>
                  <FormLabel text={i.label} />
                  <Typography>{i.value || '-'}</Typography>
                </Box>
              ))}
          </Box>
        </Box>
        <Maintenance serviceOrder={serviceOrder} formik={formik} />

        <ArticleItemsTable items={articles} setItems={setArticles} />

        <Box mt="1em">
          <Pictures attachments={report.attachments} />
        </Box>
        <Box mt="1em">
          <FormInput
            containerStyles={{width: '100%', py: '1rem'}}
            props={{
              name: 'description',
              label: t('Description of Service'),
              multiline: true,
              minRows: 4,
              type: 'text',
              value: formik.values.description,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
          />
        </Box>

        <Box mt="1em" mb="1.5em">
          <FormLabel text="Signature" />
          <Box display="flex" justifyContent="space-between">
            <Signature
              name={serviceOrder.elevator.propertyOwner.name}
              designation="Customer"
              url={downloadUrls[signatureKeys.CUSTOMER]}
            />
            <Signature
              name={
                serviceOrder.schedules.length
                  ? `${serviceOrder.schedules[0].technician.userAccount.firstName} ${serviceOrder.schedules[0].technician.userAccount.lastName}`
                  : '-'
              }
              designation="Technician"
              url={downloadUrls[signatureKeys.TECHNICIAN]}
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} pt="3rem">
          <Button
            buttonProps={{
              size: 'large',
              variant: 'outlined',
              disabled: !downloadWorkReport,
              sx: {
                background: 'transparent',
              },
              startIcon: <FileDownloadIcon />,
              onClick: () => downloadWorkReport?.(),
            }}>
            <Typography variant="subtitle2">{t('Download')}</Typography>
          </Button>
          <Button
            buttonProps={{
              size: 'large',
              variant: 'contained',
              startIcon: <SendIcon />,
              onClick: () => setIsSendEmailDialogOpen(true),
            }}>
            <Typography variant="subtitle2">{t('Send Work Report')}</Typography>
          </Button>
        </Box>
      </A4Layout>
      <BottomDrawer
        isOpen
        primaryButtonLabel="Save"
        primaryButtonAction={formik.handleSubmit}
        listItems={[]}
        isSaving={updatingServiceOrder}
        isValid={formik.dirty && formik.isValid && !formik.isSubmitting}
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onClose={() => setIsSendEmailDialogOpen(false)}
        confirmBtnDisabled={publishingWorkReport}
        title="Send work report"
        confirmBtnLabel="Send Work Report"
        email={
          serviceOrder.elevator.propertyOwner?.additionalInfo.billingEmail ||
          serviceOrder.elevator.propertyOwner?.contact.email
        }
        subject=""
        content={formik.values.description}
        callback={(emailRecord) => {
          publishWorkReport(
            {
              id: serviceOrder.id,
              body: {
                email: emailRecord.email,
                subject: emailRecord.subject,
                content: emailRecord.content,
              },
            },
            {onSuccess: () => setIsSendEmailDialogOpen(false)},
          );
        }}
      />
    </Box>
  );
};
