import {useEffect, useState} from 'react';
import {
  AccessTimeOutlined,
  DateRangeOutlined,
  PublicOutlined,
  RequestPageOutlined,
  TranslateOutlined,
} from '@mui/icons-material';
import {useFormik} from 'formik';
import {Card} from 'components/Card';
import {CardDataListItem} from 'components/CardDataListItem';
import {Dialog} from 'components/Dialog';
import {ServiceCompanyItem} from 'models/service-company';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {SettingsCompanyFormModel} from './model';
import {EditSettings, languages, timeFormats} from './EditSettings';

interface Props {
  company: ServiceCompanyItem;
}

export const Settings = ({company}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Company updated successfully',
  );

  const formik = useFormik<SettingsCompanyFormModel>({
    initialValues: {
      language: company?.language || '',
      dateFormat: company?.settings?.dateFormat || '',
      timeFormat: company?.settings?.timeFormat || '',
      timeZone: company?.settings?.timezone || '',
    },
    onSubmit: () => {},
  });

  const onSave = async () => {
    await updateCompany({
      body: {
        language: formik.values.language,
        dateFormat: formik.values.dateFormat,
        timezone: formik.values.timeZone,
        timeFormat: formik.values.timeFormat,
      },
      companyId: company?.id || '',
    });

    await queryClient.invalidateQueries([queryKeys.fetchCompany, company?.id]);

    setOpenDialog(false);
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <Card
        title="Global"
        actionHandler={() => setOpenDialog(true)}
        containerProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}>
        <CardDataListItem
          label="Language"
          value={
            company.language
              ? languages.find((item) => item.value === company.language)?.label
              : company.language
          }
          Icon={TranslateOutlined}
        />
        <CardDataListItem
          label="Date format"
          value={company?.settings.dateFormat.toLowerCase()}
          translateValue={false}
          Icon={DateRangeOutlined}
        />
        <CardDataListItem
          label="Time format"
          value={
            company.settings.timeFormat
              ? timeFormats.find(
                  (item) => item.value === company.settings?.timeFormat,
                )?.label
              : company.language
          }
          Icon={AccessTimeOutlined}
        />
        <CardDataListItem
          label="Time zone"
          value={company.settings.timezone}
          Icon={PublicOutlined}
        />
        <CardDataListItem
          label="VAT"
          value={
            company.settings.percentageVat
              ? `${company.settings.percentageVat}%`
              : '-'
          }
          Icon={RequestPageOutlined}
        />
      </Card>
      <Dialog
        title="Edit Global"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
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
        <EditSettings formik={formik} />
      </Dialog>
    </>
  );
};
