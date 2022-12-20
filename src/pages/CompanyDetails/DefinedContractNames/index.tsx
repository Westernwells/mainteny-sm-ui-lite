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
import {ServiceCompanyItem} from 'models/service-company';
import {ContractNameFormModel} from './model';
import {ContractNameInput} from './ContractNameInput';
import {columns, makeRows} from './ContractNamesDataGridProps';

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
    },
    onSubmit: (values) => {
      updateCompany(
        {
          body: {
            contractTypes: [
              values.contractName,
              ...company.settings.contractTypes,
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
        containerStyles={{...containerStyles}}
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
          height={210}
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
      </Dialog>
    </>
  );
};
