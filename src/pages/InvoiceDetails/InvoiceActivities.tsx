import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {theme} from 'theme';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  InvoiceActivityOverdueNoticeSentData,
  InvoiceActivityType,
  InvoiceActivityView,
  InvoiceView,
  MyInvoiceActivityView,
  Payment,
} from 'models/invoice';
import {
  getInvoiceActivityDescription,
  getInvoiceActivityTitle,
} from 'utils/invoice';
import {PageCard} from 'components/PageCard';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {Dialog} from 'components/Dialog';
import {Button} from 'components/Button';
import DialogPdfPreview from 'components/pdf-templates/DialogPdfPreview';

export const InvoiceActivities = ({
  activities,
  invoice,
}: {
  activities: InvoiceActivityView[];
  invoice: InvoiceView;
}) => {
  const {t} = useTranslation();
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [filePathToDownload, setFilePathToDownload] = useState('');

  const overdueNotices = invoice?.overdueNotices || [];

  const pdfPathById = useMemo(
    () =>
      overdueNotices?.reduce<Record<string, string>>((acc, notice) => {
        acc[notice.id] = notice.additionalInfo.pdfPath;
        return acc;
      }, {}),
    [overdueNotices],
  );

  const activitiesWithOverdueNoticeCount = useMemo(() => {
    let overdueNoticeCount = 0;

    return activities.map((item) => {
      if (item.type === InvoiceActivityType.OVERDUE_NOTICE_SENT) {
        const data = JSON.parse(
          item.data,
        ) as InvoiceActivityOverdueNoticeSentData;
        overdueNoticeCount += 1;
        return {
          ...item,
          overdueNoticeId: data.overdueNoticeId,
          overdueNoticePdfPath: pdfPathById[data.overdueNoticeId],
          count: overdueNoticeCount,
        };
      }
      if (item.type === InvoiceActivityType.PAYMENT_RECEIVED) {
        const data = JSON.parse(item.data) as Payment;
        return {
          ...item,
          amount: data?.amount,
        };
      }
      return item;
    });
  }, [activities, pdfPathById]);

  const allPaths = activitiesWithOverdueNoticeCount
    .map((a) => a.overdueNoticePdfPath)
    .filter(Boolean) as string[];

  const {data: pdfBlobUrls = {}} = useDownloadUrl(
    allPaths,
    undefined,
    invoice.serviceCompany.id,
  );

  const {downloadFile} = useDownloadFileWithCustomName(
    invoice?.externalId,
    pdfBlobUrls[filePathToDownload],
  );

  const handlePreviewClose = () => {
    setOpenPreviewDialog(false);
    setFilePathToDownload('');
  };

  return (
    <>
      <PageCard
        headerLabel={t('Invoice history')}
        headerIcon={<HistoryOutlinedIcon sx={{color: '#8F9BB380'}} />}
        headerStyles={{
          py: '0.25rem',
          px: '0.5rem',
        }}>
        <Timeline sx={{padding: 0, marginTop: 0}}>
          {activitiesWithOverdueNoticeCount.map((activity) => (
            <TimelineItem
              key={activity.id}
              sx={{
                '::before': {
                  display: 'none',
                },
              }}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: 'white',
                    borderColor: '#BDBDBD',
                    boxShadow: 'none',
                  }}
                />
                <TimelineConnector sx={{background: '#BDBDBD'}} />
              </TimelineSeparator>
              <TimelineContent sx={{marginTop: '-0.5em'}}>
                {activity.type === InvoiceActivityType.OVERDUE_NOTICE_SENT &&
                (activity as MyInvoiceActivityView).overdueNoticeId &&
                activity.overdueNoticePdfPath ? (
                  <Button
                    variant="text"
                    buttonProps={{
                      onClick: () => {
                        setFilePathToDownload(activity.overdueNoticePdfPath!);
                        setOpenPreviewDialog(true);
                      },
                      endIcon: (
                        <OpenInNewIcon
                          fontSize="small"
                          sx={{color: theme.palette.text.secondary}}
                        />
                      ),
                      variant: 'text',
                      size: 'medium',
                      sx: {
                        background: 'white',
                        p: 0,
                        minWidth: 0,
                        textTransform: 'none',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        fontWeight: 400,
                        color: theme.palette.text.primary,
                        textDecoration: 'underline',
                        '&:hover': {textDecoration: 'none'},
                      },
                    }}>
                    {`${t(getInvoiceActivityTitle(activity.type))} - ${
                      (activity as MyInvoiceActivityView).count
                    }`}
                  </Button>
                ) : (
                  <Typography variant="subtitle1">
                    {t(
                      getInvoiceActivityTitle(
                        activity.type,
                        activity as MyInvoiceActivityView,
                      ),
                    )}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.9rem',
                    display: 'block',
                  }}>
                  {format(
                    new Date(activity.meta.createdAt),
                    'dd.MM.yyyy | HH:mm',
                  )}
                </Typography>
                <Typography variant="subtitle2">
                  {getInvoiceActivityDescription(activity, invoice)}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </PageCard>

      <Dialog
        title={t('Invoice preview')}
        onClose={handlePreviewClose}
        onCancel={() => downloadFile()}
        dialogProps={{
          open: openPreviewDialog || false,
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: '750px',
            maxWidth: 'none',
            maxHeight: '844px',
          },
        }}
        leftButton={
          <Button
            label="Close"
            buttonProps={{
              onClick: handlePreviewClose,
              variant: 'text',
              size: 'medium',
              sx: {background: 'white'},
            }}
          />
        }
        cancelButtonText={t('Download')}
        cancelButtonVariant="contained"
        cancelButtonTextColor="white"
        cancelButtonStyles={{marginRight: '1em', border: '1px solid #000034'}}
        onSave={handlePreviewClose}
        showSaveButton={false}
        showCancelButton>
        <DialogPdfPreview
          filePathToDownload={pdfBlobUrls?.[filePathToDownload]}
        />
      </Dialog>
    </>
  );
};
