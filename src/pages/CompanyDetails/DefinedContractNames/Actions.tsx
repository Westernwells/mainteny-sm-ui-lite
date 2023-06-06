import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import {DeleteOutline, Edit} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {Confirm} from 'components/Confirm';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ContractTypes, ContractNameTypes} from 'models/contract';
import {ContractNameInput} from './ContractNameInput';
import {ContractNameFormModel} from './model';
import {ContractTypeRadio} from './ContractTypeRadio';

interface Props {
  id: string;
  contractNameTypes: ContractNameTypes[];
  contractNameType: ContractNameTypes;
}

const validationSchema = Yup.object().shape({
  contractName: Yup.string().required('Contract name is required'),
});

export const Actions = ({id, contractNameTypes, contractNameType}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const {t} = useTranslation();
  const {mutateAsync: updateCompany, isLoading: isDeleting} = useUpdateCompany(
    'Contract types updated successfully',
  );

  const formik = useFormik<ContractNameFormModel>({
    initialValues: {
      contractName: contractNameType.name,
      contractType: contractNameType.type,
    },
    onSubmit: (values) => {
      updateCompany(
        {
          body: {
            contractNameTypes: contractNameTypes.map((i) =>
              i.name === contractNameType.name
                ? ({
                    name: values.contractName,
                    type: values.contractType,
                  } as ContractNameTypes)
                : i,
            ),
          },
          companyId: id,
        },
        {
          onSuccess: () => setOpenDialog(false),
        },
      );
    },
    validationSchema,
  });

  const onDelete = () => {
    updateCompany({
      body: {
        contractNameTypes: contractNameTypes.filter(
          (i) => i.name !== contractNameType.name,
        ),
      },
      companyId: id,
    });
  };

  return (
    <>
      <Box>
        <IconButton
          onClick={() => setOpenDialog(true)}
          sx={{color: 'action.active'}}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton
          onClick={() => setOpenDeleteConfirm(true)}
          sx={{color: 'action.active'}}>
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Box>

      <Dialog
        title="Edit contract name"
        onCancel={() => setOpenDialog(false)}
        onSave={() => formik.handleSubmit()}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
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

      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await onDelete();
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Remove defined contract name"
        content={[
          t(
            'If you delete this contract name, all existing contracts with the same contract name will lose their properties.',
          ),
          <br />,
          <br />,
          t('Do you want to delete this defined contract name?'),
        ]}
      />
    </>
  );
};
