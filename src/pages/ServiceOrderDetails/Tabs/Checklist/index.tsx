import {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Grid, Typography} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Send from '@mui/icons-material/Send';
import * as _ from 'lodash';
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
  useServiceOrderDetails,
  useServiceOrderReport,
  useUpdateServiceOrderCheckListAnswers,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {grey} from '@mui/material/colors';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {ServiceOrderStatus} from 'models/service-order';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {PdfGenerationStatus} from 'models/misc';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {CheckListQuestionType, CheckListQuestion} from 'models/checklist';
import {optionStates} from './Checklist.styles';

const YES_NO_ANSWER: {[key: string]: string} = {
  y: 'Yes',
  n: 'No',
};

const EmptyCheckList = () => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{width: '60%'}}
    label="No checklist yet."
  />
);

interface Props {
  orderId?: string;
}

interface FormikValues {
  checkListAnswers: CheckListQuestion[];
}

export const CheckList = ({orderId}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const {data: serviceOrderReport, isLoading: isLoadingServiceOrderReport} =
    useServiceOrderReport({serviceOrderId: orderId || ''});
  const {mutate: updateServiceOrderCheckListAnswers} =
    useUpdateServiceOrderCheckListAnswers();

  const {data: serviceOrderDetails, isLoading: isLoadingServiceOrder} =
    useServiceOrderDetails(orderId);

  const {mutateAsync: publishCheckList, isLoading: publishingCheckList} =
    usePublishChecklist();

  const {data: serviceOrderCheckList, isLoading: isLoadingCheckList} =
    useServiceOrderCheckList(
      serviceOrderDetails?.additionalInfo.checkListInfo.checkListId && orderId,
    );
  const isPdfGenerated = useRef(
    serviceOrderDetails?.additionalInfo.checkListInfo.pdfGenerationStatus ===
      PdfGenerationStatus.DONE,
  ).current;

  const {data: downloadUrl = {}} = useDownloadUrl(
    isPdfGenerated
      ? [serviceOrderDetails!.additionalInfo.checkListInfo.pdfPath]
      : [],
  );

  const formik: FormikProps<FormikValues> = useFormik<FormikValues>({
    initialValues: {
      checkListAnswers: [],
    },
    onSubmit: async (values: FormikValues) => {
      await updateServiceOrderCheckListAnswers({
        serviceOrderId: orderId || '',
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

  const questions = useMemo(() => {
    const sortedQuestions = _.sortBy(serviceOrderCheckList?.questions, [
      'category',
      (obj) => obj.additionalInfo.orderNumber,
    ]);
    return _.groupBy(sortedQuestions, (question) => question.category);
  }, [serviceOrderCheckList]);

  const technicianUserAccount =
    serviceOrderDetails?.schedules?.[0]?.technician?.userAccount;
  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

  const questionLabel = (question: CheckListQuestion) => {
    const YES_NO = !(
      question.type === CheckListQuestionType.SINGLE_CHECK ||
      question.type === CheckListQuestionType.MULTIPLE_CHECKS
    );
    const checked = !!question.additionalInfo.answer;
    const {options} = question.additionalInfo;
    const answers = question.additionalInfo.answer;
    const notes = question.additionalInfo.note;

    return (
      <Box>
        <Box sx={{display: 'flex', mt: '0.1em'}}>
          <Typography
            variant="body2"
            color={checked ? 'text.secondary' : 'primary'}
            sx={{textDecoration: checked ? 'line-through' : 'none'}}>
            {question.question}
          </Typography>
          {answers?.map((answer) => {
            const color = YES_NO ? 'DEFAULT' : options[Number(answer)].color;
            return (
              <StatusChip
                variant="outlined"
                label={
                  YES_NO ? YES_NO_ANSWER[answer] : options[Number(answer)].text
                }
                style={{
                  ml: 0.5,
                  ...optionStates[color],

                  border: 'none',
                }}
                maxChars={10}
              />
            );
          })}
        </Box>
        {notes ? (
          <Box
            sx={{py: '0.5rem', px: '0.5rem', borderRadius: '4px'}}
            bgcolor="grey.100">
            <Typography variant="body2">
              I’ve noticed a defect in the applicable area approximately 5cm in
              thickness compromising the area.
            </Typography>
          </Box>
        ) : null}
      </Box>
    );
  };

  if (
    isLoadingServiceOrderReport ||
    isLoadingServiceOrder ||
    isLoadingCheckList
  ) {
    return <Progress />;
  }

  if (
    !serviceOrderDetails?.additionalInfo.checkListInfo.checkListId ||
    serviceOrderDetails.status !== ServiceOrderStatus.COMPLETED
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
      gap="1.5rem">
      <Grid item xs={12} md={10}>
        <PageCard
          containerStyles={{
            borderRadius: '0.5rem',
          }}
          contentContainerStyles={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
          <Box>
            <FormLabel text="Date" sx={{color: theme.palette.text.primary}} />
            <Typography variant="subtitle1">
              {serviceOrderDetails.dueDate}
            </Typography>
          </Box>

          <Box>
            <FormLabel
              text="Type"
              sx={{color: theme.palette.text.primary, display: 'block'}}
            />
            <Box display="flex" alignItems="flex-end" gap="0.5rem">
              <ServiceOrderIcons
                serviceOrderType={serviceOrderDetails.type}
                size="medium"
              />
              <ServiceOrderTypeText
                serviceOrderType={serviceOrderDetails.type}
                capitalizeText
                variant="subtitle1"
              />
            </Box>
          </Box>

          <Box>
            <FormLabel
              text="Order ID"
              sx={{color: theme.palette.text.primary}}
            />
            <Typography variant="subtitle1">
              {serviceOrderDetails.number}
            </Typography>
          </Box>

          <Box>
            <FormLabel text="Status" sx={{color: theme.palette.text.primary}} />
            <Typography variant="subtitle1">
              <StatusChip
                color={getServiceOrderStatusColor(serviceOrderDetails.status)}
                label={serviceOrderStatusToString(serviceOrderDetails.status)}
              />
            </Typography>
          </Box>
        </PageCard>
      </Grid>
      <Grid item xs={12} md={10} pb="5rem">
        <Box
          bgcolor="grey.300"
          border="2px solid"
          borderColor="text.disabled"
          borderRadius=".5em"
          sx={{px: '1.25rem', py: '1.5rem'}}>
          <Box bgcolor="white" px="1rem" py="0.625rem">
            <Typography variant="subtitle1" sx={{color: grey[700]}}>
              {serviceOrderCheckList?.name}
            </Typography>
            <Box
              bgcolor="grey.50"
              border="1px solid"
              borderColor="grey.300"
              mt="0.5rem"
              mb="2rem"
              borderRadius="4px"
              py="1rem"
              px="0.5rem"
              display="flex"
              flexDirection="column"
              gap="1rem">
              {Object.keys(questions).map((category) => (
                <Box
                  boxShadow="0px 4px 15px 0px #90909033"
                  p="1rem"
                  bgcolor="grey.50"
                  key={category}>
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.text.primary}>
                    {category}:
                  </Typography>
                  <Grid container pt="0.25rem">
                    {questions[category].map((question) => (
                      <Grid item xs={12} key={question.id}>
                        <FormCheckbox
                          checked={!!question.additionalInfo.answer}
                          value={question.id}
                          id={question.id}
                          // handleChange={handleChange}
                          label={questionLabel(question)}
                          typographyProps={{
                            fontSize: '0.875rem',
                            py: '0.5rem',
                          }}
                          sx={{alignItems: 'flex-start'}}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              Signature
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
              maxWidth="17.5rem">
              <Box>
                {serviceOrderReport?.[0]?.attachments?.[0]?.fileResource.uri ||
                  'No Signature'}
              </Box>
              {technicianName && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  top="5.5rem"
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
                    Technician
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
                      ? serviceOrderDetails!.additionalInfo.checkListInfo
                          .pdfPath
                      : '';
                    window.open(downloadUrl[url], '_blank');
                  },
                  sx: {
                    background: 'transparent',
                  },

                  startIcon: <FileDownloadIcon />,
                }}
              />

              <Button
                label="Send Checklist"
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
              callback={async (emailRecord) => {
                setIsSendEmailDialogOpen(false);
                await publishCheckList({
                  id: serviceOrderDetails!.id,
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
