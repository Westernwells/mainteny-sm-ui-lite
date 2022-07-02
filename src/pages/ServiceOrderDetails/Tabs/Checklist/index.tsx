import {Avatar, Grid, Typography} from '@mui/material';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {EmptySection} from 'components/EmptySection';
import {FormLabel} from 'components/form/FormLabel';
import {InfoCard} from 'components/InfoCard';
import {PageCard} from 'components/PageCard';
import {Progress} from 'components/Progress';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {grey} from '@mui/material/colors';
import {FormCheckbox} from 'components/form/FormCheckbox';
import signatureImage from 'assets/images/signature.png';
import {BottomDrawer} from 'components/BottomDrawer';
import {ServiceOrderStatus} from 'models/service-order';
import {useTranslation} from 'react-i18next';

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

export const Checklist = ({orderId}: Props) => {
  const {data: serviceOrderDetails, isLoading} =
    useServiceOrderDetails(orderId);
  console.log(
    '🚀 ~ file: index.tsx ~ line 21 ~ Checklist',
    serviceOrderDetails,
  );
  const theme = useTheme();
  const {t} = useTranslation();

  if (isLoading) {
    return <Progress />;
  }

  if (!serviceOrderDetails?.additionalInfo.checkList) {
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
                KONE TravelMaster’s check list
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
                <Box
                  boxShadow="0px 4px 15px 0px #90909033"
                  p="1rem"
                  bgcolor="grey.50">
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.text.primary}>
                    Category 1:
                  </Typography>
                  <Grid container pt="0.25rem">
                    <Grid item xs={12}>
                      <FormCheckbox
                        checked
                        value="something"
                        handleChange={() => {}}
                        label="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book?"
                        typographyProps={{fontSize: '0.875rem', py: '0.5rem'}}
                        sx={{alignItems: 'flex-start'}}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormCheckbox
                        checked={false}
                        value="something2"
                        handleChange={() => {}}
                        label="Question 2"
                        typographyProps={{fontSize: '0.875rem', py: '0.5rem'}}
                        sx={{alignItems: 'flex-start'}}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormCheckbox
                        checked={false}
                        value="something3"
                        handleChange={() => {}}
                        label="Question 3"
                        typographyProps={{fontSize: '0.875rem', py: '0.5rem'}}
                        sx={{alignItems: 'flex-start'}}
                      />
                    </Grid>
                  </Grid>
                </Box>
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
                  src={signatureImage}
                  variant="square"
                  sx={{height: 'auto', my: '1.5rem'}}
                  style={{
                    height: 'auto',
                    width: 'auto',
                  }}
                />
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
                    Noman Gul
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.text.secondary}>
                    Technician
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <BottomDrawer
        isOpen={serviceOrderDetails.status !== ServiceOrderStatus.COMPLETED}
        primaryButtonLabel={t('Save')}
        primaryButtonAction={() => {
          //
        }}
        listItems={[]}
        isValid
      />
    </>
  );
};
