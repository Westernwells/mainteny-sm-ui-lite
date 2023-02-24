import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {DeleteOutline, Edit} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
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
  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Contract types updated successfully',
  );

  const formik = useFormik<ContractNameFormModel>({
    initialValues: {
      contractName: contractNameType.name,
      contractType: contractNameType.name,
    },
    onSubmit: (values) => {
      console.log(values, '%%%%%%%%');
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
