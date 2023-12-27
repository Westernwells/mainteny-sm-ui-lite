import {ReactNode, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {FormikProps} from 'formik';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import {InvoiceFormData} from 'models/invoice';
import {EditCustomerForm} from 'pages/InvoiceDetails/EditCustomerForm';
import {AddressRecord} from 'models/misc';
import {FormLabel} from './form/FormLabel';
import {SelectCard} from './SelectCard';
import {SelectButton} from './SelectButton';
import {Button} from './Button';
import {Dialog} from './Dialog';

interface Props {
  label: string | ReactNode;
  labelRequired?: boolean;
  selected: boolean;
  buttonText: string;
  cardHeader: ReactNode;
  cardOnClose?: () => void;
  editButtonText: string;
  modalHeader: string;
  addressType: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress';
  formik: FormikProps<InvoiceFormData>;
}

export const SelectAndEditCombined = ({
  label,
  labelRequired,
  selected,
  buttonText,
  cardHeader,
  cardOnClose,
  editButtonText,
  modalHeader,
  addressType,
  formik,
}: Props) => {
  const {t} = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();

  const initialValues: AddressRecord | undefined = useMemo(
    () => formik.values[addressType],
    [isModalOpen],
  );

  const onCloseDialog = () => {
    setIsModalOpen(false);
    formik.setValues({
      ...formik.values,
      [addressType]: initialValues,
    });
  };

  return (
    <Box>
      {typeof label === 'string' ? (
        <FormLabel text={t(label)} required={labelRequired} />
      ) : (
        label
      )}

      {selected ? (
        <SelectCard
          header={cardHeader}
          body={
            <Button
              label={t(editButtonText)}
              buttonProps={{
                size: 'small',
                startIcon: <EditIcon />,
                onClick: () => setIsModalOpen(true),
                sx: {
                  display: 'inline-flex',
                  mt: '10px',
                  color: theme.palette.primary.dark,
                },
              }}
            />
          }
          onClose={cardOnClose}
        />
      ) : (
        <SelectButton
          text={t(buttonText)}
          onClick={() => setIsModalOpen(true)}
          buttonProps={{size: 'small'}}
        />
      )}

      <Dialog
        title={modalHeader}
        onCancel={onCloseDialog}
        onSave={() => setIsModalOpen(false)}
        disableSaveBtn={!formik.values?.[addressType]?.fullName}
        dialogProps={{
          maxWidth: 'md',
          open: isModalOpen || false,
        }}>
        <EditCustomerForm formik={formik} address={addressType} />
      </Dialog>
    </Box>
  );
};
