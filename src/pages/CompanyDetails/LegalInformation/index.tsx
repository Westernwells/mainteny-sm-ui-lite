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
  managingDirector: Yup.string().nullable(),
  owner: Yup.string().nullable(),
  representedBy: Yup.string()
    .required('You must select a representation option')
    .oneOf(['owner', 'managingDirector'], 'Invalid option selected'),
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
      owner: company?.settings?.owner || '',
      representedBy: company?.settings?.managingDirector?.trim()
        ? 'managingDirector'
        : 'owner',
    },
    validationSchema,
    onSubmit: async () => {
      const {managingDirector, owner, representedBy} = formik.values;

      const updatedData = {
        managingDirector:
          representedBy === 'managingDirector' ? managingDirector || '' : '',
        owner: representedBy === 'owner' ? owner || '' : '',
        arbitrationCourt: formik.values.arbitrationCourt,
        tradeRegisterNumber: formik.values.tradeRegisterNumber,
      };

      await updateCompany({
        body: updatedData,
        companyId: company?.id || '',
      });

      formik.resetForm({
        values: {
          ...formik.values,
          managingDirector: updatedData.managingDirector,
          owner: updatedData.owner,
          arbitrationCourt: updatedData.arbitrationCourt,
          tradeRegisterNumber: updatedData.tradeRegisterNumber,
          representedBy,
        },
      });

      setOpenDialog(false);
    },
  });

  const onSave = async () => {
    await formik.submitForm();
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
          label="Owner"
          value={company.settings.owner}
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
        onSave={onSave}
        saveButtonText="Save Changes"
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'sm',
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
