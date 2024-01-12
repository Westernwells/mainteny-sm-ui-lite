import {useMemo, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Add from '@mui/icons-material/Add';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ContractTypes} from 'models/contract';
import {ServiceCompanyItem} from 'models/service-company';
import {ContractNameFormModel} from './model';
import {ContractNameInput} from './ContractNameInput';
import {columns, makeRows} from './ContractNamesDataGridProps';
import {ContractTypeRadio} from './ContractTypeRadio';

interface Props {
  company: ServiceCompanyItem;
  containerStyles?: {[key: string]: any};
}

const validationSchema = Yup.object().shape({
  contractName: Yup.string().required('Contract name is required'),
  contractType: Yup.string().required('Contract type is required'),
});

export const DefinedContractNames = ({company, containerStyles}: Props) => {
  const {t} = useTranslation();
  const rows = useMemo(() => makeRows(company), [company, t]);
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Contract types updated successfully',
  );

  const formik = useFormik<ContractNameFormModel>({
    initialValues: {
      contractName: '',
      contractType: '',
    },
    onSubmit: (values) => {
      updateCompany(
        {
          body: {
            contractNameTypes: [
              ...company.settings.contractNameTypes,
              {
                name: values.contractName,
                type: values.contractType as ContractTypes,
              },
            ],
          },
          companyId: company.id,
        },
        {
          onSuccess: () => setOpenDialog(false),
        },
      );
    },
    validationSchema,
  });

  return (
    <>
      <InfoCard
        containerStyles={{...containerStyles, pb: '4rem'}}
        bodyContainerStyle={{height: '100%'}}
        testId="contract-info"
        handleAction={() => setOpenDialog(true)}
        header={
          <Typography variant="subtitle1">
            {t('Defined contract names')}
          </Typography>
        }
        showHeaderBackground
        headerActionIcon={<Add />}>
        <DataGridLayout
          fullHeight={false}
          isCellClickable={false}
          height="100%"
          rows={rows}
          columns={columns}
          noRowsEmptySection={
            <EmptySection
              illustration="clipboard"
              size="tiny"
              containerStyle={{my: 'auto'}}
              label="No contracts defined yet. They will appear here once added!"
            />
          }
          containerStyle={{
            borderBottom: 'none',
          }}
        />
      </InfoCard>
      <Dialog
        title="New contract name"
        onCancel={() => setOpenDialog(false)}
        onSave={() => formik.handleSubmit()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
          sx: {border: '1px solid green'},
        }}>
        <ContractNameInput formik={formik} />
        <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('Contract type')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <ContractTypeRadio
              label="Maintenance contract"
              name="contractType"
              value={ContractTypes.SERVICE}
              checked={formik.values.contractType === ContractTypes.SERVICE}
              handleChange={formik.handleChange}
              helperTexts={[
                'All contracts that are related to regular maintenance',
                'These contracts have a fixed service cycle (e.g. 4 times per year)',
                'The system will automatically create the related work orders',
              ]}
            />
          </Grid>
          <Grid item xs={6}>
            <ContractTypeRadio
              label="Non-maintenance contract"
              name="contractType"
              value={ContractTypes.NON_SERVICE}
              checked={formik.values.contractType === ContractTypes.NON_SERVICE}
              handleChange={formik.handleChange}
              helperTexts={[
                'These contracts are not related to maintenance, e.g. auto dialer systems',
                'The contracts have specific invoice cycles, e.g. monthly',
                'The invoices will be created automatically by the system',
              ]}
            />
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
};
