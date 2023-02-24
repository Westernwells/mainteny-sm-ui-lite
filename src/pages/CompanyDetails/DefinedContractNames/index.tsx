import {useMemo, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
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
});

export const DefinedContractNames = ({company, containerStyles}: Props) => {
  const {t} = useTranslation();
  const rows = useMemo(() => makeRows(company), [company]);
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
          hideFooter
        />
      </InfoCard>
      <Dialog
        title="New contract name"
        onCancel={() => setOpenDialog(false)}
        onSave={() => formik.handleSubmit()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <ContractNameInput formik={formik} />
        <ContractTypeRadio
          label="Maintenance contract"
          name="contractType"
          value={ContractTypes.SERVICE}
          checked={formik.values.contractType === ContractTypes.SERVICE}
          handleChange={formik.handleChange}
        />

        <ContractTypeRadio
          label="Non-maintenance contract"
          name="contractType"
          value={ContractTypes.NON_SERVICE}
          checked={formik.values.contractType === ContractTypes.NON_SERVICE}
          handleChange={formik.handleChange}
        />
      </Dialog>
    </>
  );
};
