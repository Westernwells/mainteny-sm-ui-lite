import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import {A4Layout} from 'components/A4Layout';
import {SelectCombined} from 'components/SelectCombined';
import {EmptySection} from 'components/EmptySection';
import {FormLabel} from 'components/form/FormLabel';
import {
  usePublishWorkReport,
  useServiceOrderReport,
  useUpdateServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {
  ServiceOrderArticleView,
  ServiceOrderItemRecord,
  ServiceOrderReportView,
} from 'models/service-order';
import {Progress} from 'components/Progress';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {serviceOrderStatusToString} from 'utils/service-order-utils';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Maintenance} from './Maintenance';
import {Signature} from './Signature';
import {ReportCard} from './ReportCard';
import {ArticleItemsTable} from './ArticleItemsTable';
import {Pictures} from './Pictures';

interface Props {
  orderId?: string;
  downloadWorkReport: (() => void) | null;
}

export const WorkReport = ({orderId, downloadWorkReport}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {
    data: serviceOrderReportSource,
    isFetched,
    isIdle,
    isLoading,
  } = useServiceOrderReport({
    serviceOrderId: typeof orderId === 'string' ? orderId : [],
  });

  const [items, setItems] = useState<ServiceOrderArticleView[]>([]);
  const [report, setReport] = useState<ServiceOrderReportView>();
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const {mutate: publishWorkReport, isLoading: publishingWorkReport} =
    usePublishWorkReport();
  const {mutate: updateArticles} = useUpdateServiceOrderArticles();
  const [signatureKeys, setSignatureKeys] = useState<{[key: string]: string}>(
    {},
  );

  const {data: downloadUrls = {}} = useDownloadUrl(
    serviceOrderReportSource && serviceOrderReportSource.length
      ? serviceOrderReportSource[0].signatures.map(
          (item) => item.fileResource.uri,
        )
      : [],
    {enabled: !!(serviceOrderReportSource && serviceOrderReportSource.length)},
  );

  useEffect(() => {
    if (serviceOrderReportSource && serviceOrderReportSource.length) {
      const serviceCompanyId = user?.userAccount.serviceCompany.id;
      const serviceOrderId = serviceOrderReportSource[0].serviceOrder.id;
      const keys = {
        CUSTOMER: `${serviceCompanyId}/serviceOrders/${serviceOrderId}/report/CUSTOMER.png`,
        TECHNICIAN: `${serviceCompanyId}/serviceOrders/${serviceOrderId}/report/TECHNICIAN.png`,
      };
      setSignatureKeys(keys);
    }
  }, [isFetched]);

  useEffect(() => {
    if (isFetched && serviceOrderReportSource?.length)
      setReport(serviceOrderReportSource[0]);
  }, [isFetched]);

  useEffect(() => {
    if (report && report.serviceOrder && 'articles' in report.serviceOrder) {
      const temp = report ? report.serviceOrder.articles : [];
      setItems(temp);
    }
  }, [report]);

  if (isIdle || isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress height="100%" />
      </Box>
    );
  }

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
        type={report.serviceOrder.type}
        number={report.serviceOrder.number}
        status={report.serviceOrder.status}
      />
      <A4Layout>
        <Box display="flex" mt="1em" gap="2em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <SelectCombined
              selected
              label="Customer Details"
              buttonText=""
              cardHeader={
                report && (
                  <Typography variant="body2">
                    {report.elevator.propertyOwner.name}
                  </Typography>
                )
              }
              cardBody={
                report && (
                  <>
                    <Typography variant="caption">
                      {report.elevator.propertyOwner.billingAddress?.fullName ??
                        '-'}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {report.elevator.propertyOwner.contact.phone}
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      {t('Customer Number')}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {report.elevator.propertyOwner.externalId || '-'}
                    </Typography>
                  </>
                )
              }
              modalHeader=""
              modalBody={null}
            />
            <SelectCombined
              selected
              label="Unit Details"
              buttonText=""
              cardHeader={
                report && (
                  <Typography variant="body2">
                    {report.elevator.model}
                  </Typography>
                )
              }
              cardBody={
                report && (
                  <>
                    <Typography variant="caption">
                      {report.elevator.address.fullName}
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      {t('Unit Number')}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {report.elevator.externalId || '-'}
                    </Typography>
                  </>
                )
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
                  label: 'Order ID',
                  value: report.serviceOrder.number,
                },
                {
                  label: 'Technician',
                  value:
                    report.serviceOrder.schedules.length &&
                    `${report.serviceOrder.schedules[0].technician.userAccount.firstName} ${report.serviceOrder.schedules[0].technician.userAccount.lastName}`,
                },
                {
                  label: 'Status',
                  value: `${t(
                    serviceOrderStatusToString(report.serviceOrder.status),
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
        <Maintenance serviceReport={report} />

        <ArticleItemsTable items={items} setItems={setItems} />

        <Box mt="1em">
          <Pictures
            elevator={report.elevator}
            propertyOwnerId={report.elevator.propertyOwner.id}
          />
        </Box>
        <Box mt="1em">
          <FormLabel text="Description Of Service" />
          <Typography variant="body2" sx={{py: '0.5rem'}}>
            {report.description || '-'}
          </Typography>
        </Box>

        <Box mt="1em" mb="1.5em">
          <FormLabel text="Signature" />
          <Box display="flex" justifyContent="space-between">
            <Signature
              name={report.elevator.propertyOwner.name}
              designation="Customer"
              url={downloadUrls[signatureKeys.CUSTOMER]}
            />
            <Signature
              name={
                report.serviceOrder.schedules.length
                  ? `${report.serviceOrder.schedules[0].technician.userAccount.firstName} ${report.serviceOrder.schedules[0].technician.userAccount.lastName}`
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
        primaryButtonAction={() => {
          if (items.length && orderId)
            updateArticles({
              data: items.map(
                (i): ServiceOrderItemRecord => ({
                  articleId: i.article.id,
                  articleUnit: i.article.unit,
                  description: i.description,
                  name: i.name,
                  quantity: i.quantity,
                  unitAmount: i.unitAmount,
                }),
              ),
              orderId,
            });
        }}
        listItems={[]}
        isValid={!!items.length}
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onClose={() => setIsSendEmailDialogOpen(false)}
        confirmBtnDisabled={publishingWorkReport}
        title="Send work report"
        confirmBtnLabel="Send Work Report"
        email={
          report.elevator.propertyOwner?.additionalInfo.billingEmail ||
          report.elevator.propertyOwner?.contact.email
        }
        subject=""
        content={report.description}
        callback={(emailRecord) => {
          publishWorkReport(
            {
              id: orderId!,
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
