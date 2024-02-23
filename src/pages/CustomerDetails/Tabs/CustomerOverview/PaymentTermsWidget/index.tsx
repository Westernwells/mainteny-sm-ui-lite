import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import {Button} from 'components/Button';
import Typography from '@mui/material/Typography';
import {EmptySection} from 'components/EmptySection';
import {Button as LoadingButton} from 'components/LoadingButton';
import {InfoCard} from 'components/InfoCard';
import {createEmptyResource} from 'utils/paging-utils';
import {useTranslation} from 'react-i18next';
import Drawer from '@mui/material/Drawer';
import {useState} from 'react';
import {InfoBanner} from 'components/InfoBanner';
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Grid from '@mui/material/Grid';
import {Controller, useForm} from 'react-hook-form';
import {UpdateContractPaymentTermRecord} from 'models/contract';

const pageSize = 50;

const PaymentTermsWidget = () => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const {handleSubmit, control, reset, watch} =
    useForm<UpdateContractPaymentTermRecord>();
  const selectedValue = watch('term');

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
    });

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
    reset();
  };

  const onSubmit = (formData: UpdateContractPaymentTermRecord) => {
    console.log('formData', formData);
    const [id, term] = formData.term.split('<>');
    console.log(`id: ${id}, term: ${term}`);
  };

  return (
    <>
      <InfoCard
        header={
          <Box display="flex">
            <Typography variant="subtitle1">{t('Payment terms')}</Typography>
          </Box>
        }
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        headerActionIcon={<EditIcon />}
        handleAction={handleOpenSideDrawer}
        showHeaderBackground>
        <EmptySection
          illustration="clipboard"
          size="tiny"
          containerStyle={{m: 'auto', width: '60%'}}
          label="No payment terms applied."
        />
      </InfoCard>
      <Drawer
        anchor="right"
        open={showSideDrawer}
        onClose={handleCloseSideDrawer}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
          },
        }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="sticky"
          top={0}
          bgcolor="white"
          py="2rem"
          px="1rem"
          zIndex={99}>
          <Typography variant="h5" letterSpacing="normal">
            {t('Payment terms')}
          </Typography>
          <Button
            label={t('Close')}
            buttonProps={{
              onClick: handleCloseSideDrawer,
              size: 'small',
              variant: 'text',
            }}
          />
        </Box>
        <Grid
          container
          direction="column"
          margin={2}
          width="fit-content"
          justifyContent="space-between"
          height="100%">
          <Grid>
            <InfoBanner
              sx={{height: 'fit-content'}}
              body={[
                `Add or edit your payment terms that would be used later in invoicing.`,
              ]}
            />
            <form onSubmit={handleSubmit(onSubmit)} id="payment-term-form">
              <Controller
                name="term"
                control={control}
                defaultValue=""
                render={({field}) => (
                  <RadioGroup {...field}>
                    {contractPaymentTerms.data.map((paymentTerm) => (
                      <FormControlLabel
                        key={paymentTerm.id}
                        value={`${paymentTerm.id}<>${paymentTerm.term}`}
                        control={<Radio />}
                        label={paymentTerm.term}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </form>
          </Grid>
          <Grid container justifyContent="space-between" pt="0.625rem">
            <Button
              buttonProps={{
                size: 'medium',
                onClick: () => {
                  reset();
                  handleCloseSideDrawer();
                },
              }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Cancel')}
              </Typography>
            </Button>
            <LoadingButton
              buttonProps={{
                onClick: handleSubmit(onSubmit),
                size: 'medium',
                variant: 'contained',
                disabled: !selectedValue,
                // loading: isCreating || isUpdating,
              }}>
              {t('Confirm')}
            </LoadingButton>
          </Grid>
        </Grid>
      </Drawer>
    </>
  );
};

export default PaymentTermsWidget;
