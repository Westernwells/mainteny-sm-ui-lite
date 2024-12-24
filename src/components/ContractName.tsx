import {FC, useState} from 'react';
import {useTranslation} from 'react-i18next';
import InputAdornment from '@mui/material/InputAdornment';
import {FormInput} from 'components/form/FormInput';
import {
  ContractBasicInfoFormModel,
  ContractTermView,
  ContractUpdateRequest,
} from 'models/contract';
import {ServiceCompanyType} from 'models/service-company';
import {FormikProps} from 'formik';
import {IconButton} from '@mui/material';
import {useCompanyTerms} from 'hooks/reactQuery/useCompanies';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {ContractTerm} from 'components/ContractTerm';
import {ContractTermInput as NewContractName} from 'components/ContractTermInput';
import {createEmptyResource} from 'utils/paging';

interface Props {
  formik: FormikProps<ContractBasicInfoFormModel | ContractUpdateRequest>;
}

const ContractName: FC<Props> = ({formik}) => {
  const {t} = useTranslation();
  const [showContractNameSection, setShowContractNameSection] = useState(false);
  const [edit, setEdit] = useState<ContractTermView | undefined>(undefined);
  const [showDrawer, setShowDrawer] = useState(false);

  const {data: contracts = createEmptyResource(500)} = useCompanyTerms({
    page: {
      pageIndex: 0,
      pageSize: 500,
    },
    query: '',
    type: ServiceCompanyType.CONTRACT_NAME,
  });

  const handleContractNameTerm = (nameId: string) => {
    const name = contracts?.data.find(({id}) => nameId === id);
    formik.setFieldValue('name', name?.term || '');
    if (nameId) {
      setShowContractNameSection(false);
    }
  };

  return (
    <>
      <FormInput
        fieldProps={{
          label: 'Contract Name',
          name: 'name',
          value: formik.values.name,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
          multiline: true,
          required: true,
          helperText: formik.touched.name && formik.errors.name,
          error: !!formik.errors.name && formik.touched.name,
          InputProps: {
            endAdornment: (
              <InputAdornment
                component={IconButton}
                disableRipple
                position="end"
                sx={{
                  mt: 1,
                  mr: -1,
                  alignSelf: 'flex-start',
                }}
                onClick={() => setShowContractNameSection(true)}
                size="small">
                <TextSnippetIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <ContractTerm
        title={t('Defined contract names')}
        open={showContractNameSection}
        serviceCompanyType={ServiceCompanyType.CONTRACT_NAME}
        onCancel={() => setShowContractNameSection(false)}
        onSave={handleContractNameTerm}
        defaultValue={formik.values.name}
        onClick={() => setShowDrawer(true)}
        setEdit={setEdit}
      />

      <NewContractName
        title={t('New contract name')}
        serviceCompanyType={ServiceCompanyType.CONTRACT_NAME}
        open={showDrawer}
        onCancel={() => setShowDrawer(false)}
        defaultTerm={edit}
        setEdit={setEdit}
      />
    </>
  );
};

export default ContractName;
