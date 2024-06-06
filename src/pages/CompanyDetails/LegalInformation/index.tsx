import {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {GavelOutlined, PersonOutline, TagOutlined} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {Card} from 'components/Card';
import {CardDataListItem} from 'components/CardDataListItem';
import {ServiceCompanyItem} from 'models/service-company';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {LegalInformationCompanyFormModel} from './model';
import {EditLegalInformation} from './EditLegalInformation';

interface Props {
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  managingDirector: Yup.string()
    .nullable()
    .required('Managing Director is required'),
  arbitrationCourt: Yup.string()
    .nullable()
    .required('Arbitration Court is required'),
  tradeRegisterNumber: Yup.string()
    .nullable()
    .required('Trade Register Number is required'),
});

export const LegalInformation = ({company}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<LegalInformationCompanyFormModel>({
    initialValues: {
      managingDirector: company?.settings?.managingDirector || '',
      arbitrationCourt: company?.settings?.arbitrationCourt || '',
      tradeRegisterNumber: company?.settings?.tradeRegisterNumber || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        managingDirector: formik.values.managingDirector,
        arbitrationCourt: formik.values.arbitrationCourt,
        tradeRegisterNumber: formik.values.tradeRegisterNumber,
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <Card
        title="Legal"
        actionHandler={() => setOpenDialog(true)}
        containerProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          height: '100%',
        }}>
        <CardDataListItem
          label="Managing director"
          value={company.settings.managingDirector}
          Icon={PersonOutline}
        />
        <CardDataListItem
          label="Arbitration court"
          value={company.settings.arbitrationCourt}
          Icon={GavelOutlined}
        />
        <CardDataListItem
          label="Trade registration number"
          value={company.settings.tradeRegisterNumber}
          Icon={TagOutlined}
        />
      </Card>
      <Dialog
        title="Edit Legal"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        saveButtonText="Save Changes"
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
        }}>
        <EditLegalInformation formik={formik} />
      </Dialog>
    </>
  );
};
