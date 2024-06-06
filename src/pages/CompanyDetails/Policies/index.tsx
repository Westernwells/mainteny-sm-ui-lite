import {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {BeachAccessOutlined} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {Card} from 'components/Card';
import {CardDataListItem} from 'components/CardDataListItem';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyItem} from 'models/service-company';
import {PoliciesCompanyFormModel} from './model';
import {EditPolicies} from './EditPolicies';

interface Props {
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  totalYearlyVacationDaysAllowed: Yup.number()
    .nullable()
    .required('Yearly Vacation Days is required')
    .min(0, 'Minimum 0'),
});

export const Policies = ({company}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<PoliciesCompanyFormModel>({
    initialValues: {
      totalYearlyVacationDaysAllowed:
        company?.settings?.totalYearlyVacationDaysAllowed,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        totalYearlyVacationDaysAllowed:
          formik.values.totalYearlyVacationDaysAllowed,
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
        title="Company Policy"
        actionHandler={() => setOpenDialog(true)}
        containerProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          height: '100%',
        }}>
        <CardDataListItem
          label="Yearly vacation days"
          value={company.settings.totalYearlyVacationDaysAllowed}
          Icon={BeachAccessOutlined}
        />
      </Card>
      <Dialog
        title="Edit Company Policy"
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
        <EditPolicies formik={formik} />
      </Dialog>
    </>
  );
};
