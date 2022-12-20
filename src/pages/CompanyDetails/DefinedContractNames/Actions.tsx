import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {DeleteOutline, Edit} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ContractNameInput} from './ContractNameInput';
import {ContractNameFormModel} from './model';

interface Props {
  id: string;
  contractTypes: string[];
  contractType: string;
}

const validationSchema = Yup.object().shape({
  contractName: Yup.string().required('Contract name is required'),
});

export const Actions = ({id, contractTypes, contractType}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Contract types updated successfully',
  );

  const formik = useFormik<ContractNameFormModel>({
    initialValues: {
      contractName: contractType,
    },
    onSubmit: (values) => {
      updateCompany(
        {
          body: {
            contractTypes: contractTypes.map((i) =>
              i === contractType ? values.contractName : i,
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
        contractTypes: contractTypes.filter((i) => i !== contractType),
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
        <IconButton onClick={onDelete} sx={{color: 'action.active'}}>
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Box>

      <Dialog
        title="Edit contract name"
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
