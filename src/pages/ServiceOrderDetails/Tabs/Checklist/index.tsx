import React, {useEffect, useMemo} from 'react';
import {Avatar, Grid, Typography} from '@mui/material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {FormikProps, useFormik} from 'formik';
import {groupBy, sortBy} from 'lodash';
import {EmptySection} from 'components/EmptySection';
import {FormLabel} from 'components/form/FormLabel';
import {InfoCard} from 'components/InfoCard';
import {PageCard} from 'components/PageCard';
import {Progress} from 'components/Progress';
import {
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
import {BottomDrawer} from 'components/BottomDrawer';
import {ServiceOrderStatus} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import {ChecklistQuestion} from 'models/checklist';

const EmptyChecklist = () => (
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
  checkListAnswers: ChecklistQuestion[];
}

export const Checklist = ({orderId}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const {data: serviceOrderReport, isLoading: isLoadingServiceOrderReport} =
    useServiceOrderReport({serviceOrderId: orderId || ''});
  const {mutate: updateServiceOrderCheckListAnswers} =
    useUpdateServiceOrderCheckListAnswers();
  const serviceOrderDetails = useMemo(
    () => serviceOrderReport?.[0]?.serviceOrder,
    [serviceOrderReport?.[0]?.additionalInfo.checkListAnswers.length],
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
    const questionsWithStatus = sortBy(
      serviceOrderDetails?.additionalInfo.checkList.questions.map(
        (question) => {
          if (
            !serviceOrderReport?.[0]?.additionalInfo.checkListAnswers?.length
          ) {
            return {...question, checked: false};
          }
          const isChecked =
            !!serviceOrderReport?.[0]?.additionalInfo.checkListAnswers?.find(
              (answer) => answer.questionId === question.id,
            );
          return {
            ...question,
            checked: isChecked,
          };
        },
      ),
      'question',
    );

    const groupedByCategories = groupBy(questionsWithStatus, 'category');

    return {
      withStatus: questionsWithStatus,
      byCategories: sortBy(Object.keys(groupedByCategories)).map(
        (category) => ({
          category,
          questions: groupedByCategories[category],
        }),
      ),
    };
  }, [serviceOrderDetails, serviceOrderReport]);

  useEffect(() => {
    formik.resetForm({
      values: {
        ...formik.values,
        checkListAnswers: questions.withStatus?.filter((q) => q.checked) ?? [],
      },
    });
  }, [questions.withStatus?.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {checked, value} = e.target;
    if (checked) {
      formik.setFieldValue('checkListAnswers', [
        ...formik.values.checkListAnswers,
        serviceOrderDetails?.additionalInfo.checkList.questions.find(
          (question) => question.id === value,
        ),
      ]);
    } else {
      formik.setFieldValue(
        'checkListAnswers',
        formik.values.checkListAnswers.filter((v) => v.id !== value),
      );
    }
  };

  const technicianUserAccount =
    serviceOrderDetails?.schedules?.[0]?.technician?.userAccount;
  const technicianName = technicianUserAccount
    ? `${technicianUserAccount.firstName} ${technicianUserAccount.lastName}`
    : '';

  if (isLoadingServiceOrderReport) {
    return <Progress />;
  }

  if (
    !serviceOrderDetails?.additionalInfo.checkList ||
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
        <EmptyChecklist />
      </InfoCard>
    );
  }

  return (
    <>
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
              <FormLabel
                text="Status"
                sx={{color: theme.palette.text.primary}}
              />
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
                {serviceOrderDetails.additionalInfo.checkList.name}
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
                {questions.byCategories.map((category) => (
                  <Box
                    boxShadow="0px 4px 15px 0px #90909033"
                    p="1rem"
                    bgcolor="grey.50"
                    key={category.category}>
                    <Typography
                      variant="subtitle2"
                      color={theme.palette.text.primary}>
                      {category.category}:
                    </Typography>
                    <Grid container pt="0.25rem">
                      {category.questions.map((question) => (
                        <Grid item xs={12} key={question.id}>
                          <FormCheckbox
                            checked={
                              !!formik.values?.checkListAnswers?.find(
                                (a) => a.id === question.id,
                              )
                            }
                            value={question.id}
                            id={question.id}
                            handleChange={handleChange}
                            label={question.question}
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
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}>
                Signature
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt="0.5rem"
                mb="2.3rem"
                border="1px solid"
                borderColor="grey.300"
                borderRadius="0.5rem"
                position="relative"
                maxWidth="17.5rem">
                <Avatar
                  src={
                    serviceOrderReport?.[0]?.attachments?.[0]?.fileResource.uri
                  }
                  variant="square"
                  sx={{height: 'auto', my: '1.5rem'}}
                  style={{
                    height: 'auto',
                    width: 'auto',
                  }}
                />
                {technicianName && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    mt="-2rem"
                    bgcolor="white"
                    px="0.625rem"
                    position="absolute"
                    bottom="-2.2rem"
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
            </Box>
          </Box>
        </Grid>
      </Grid>
      <BottomDrawer
        isOpen={
          serviceOrderDetails.status === ServiceOrderStatus.COMPLETED &&
          formik.dirty
        }
        primaryButtonLabel={t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={[]}
        isValid={!formik.isSubmitting}
      />
    </>
  );
};
