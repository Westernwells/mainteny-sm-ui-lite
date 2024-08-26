import {ReactNode, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {FormikProps} from 'formik';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {AddressRecord} from 'models/misc';
import {formatAddressFullname} from 'utils/utils';
import {QuotationFormData} from 'models/quotation';
import {EditCustomerForm} from 'pages/QuotationDetails/EditCustomerForm';
import AddIcon from '@mui/icons-material/Add';
import {TFunction} from 'i18next';
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
  cardOnClose?: () => void;
  editButtonText: string;
  modalHeader: string;
  addressType: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress';
  formik: FormikProps<QuotationFormData>;
  address?: AddressRecord;
  translate?: TFunction<'translation', 'translation'>;
}

export const QuotationSelectAndEditCombined = ({
  label,
  labelRequired,
  selected,
  buttonText,
  cardOnClose,
  editButtonText,
  modalHeader,
  addressType,
  formik,
  address,
  translate,
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

  const onSaveAddress = () => {
    formik.setValues({
      ...formik.values,
      [addressType]: {
        ...formik.values[addressType],
        component: {
          ...formik.values[addressType]?.component,
          country: formik.values[addressType]?.component?.country
            ? translate
              ? translate(
                  formik.values[addressType]?.component
                    ?.country as unknown as string,
                )
              : formik.values[addressType]?.component?.country
            : '',
        },
        fullName: formatAddressFullname(
          formik.values?.[addressType] ?? null,
          translate,
        )?.fullName,
      },
    });
    setIsModalOpen(false);
  };

  const renderSelectedButton = () => {
    if (addressType === 'alternativeAddress') {
      return (
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
          alignItems="flex-start">
          <Button
            label={t(buttonText)}
            style={{color: theme.palette.primary.dark}}
            buttonProps={{
              size: 'small',
              startIcon: <AddIcon />,
              onClick: () => setIsModalOpen(true),
            }}
          />
        </Box>
      );
    }

    return (
      <SelectButton
        text={t(buttonText)}
        onClick={() => setIsModalOpen(true)}
        buttonProps={{size: 'small'}}
      />
    );
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
          header={
            address ? (
              <>
                <Typography variant="body2">
                  {address.component?.name ?? ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatAddressFullname(address, translate)?.fullName}
                </Typography>
              </>
            ) : null
          }
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
        renderSelectedButton()
      )}

      <Dialog
        title={modalHeader}
        onCancel={onCloseDialog}
        onSave={onSaveAddress}
        disableSaveBtn={!formik.values?.[addressType]?.component?.name}
        dialogProps={{
          maxWidth: 'md',
          open: isModalOpen || false,
        }}>
        <EditCustomerForm formik={formik} address={addressType} />
      </Dialog>
    </Box>
  );
};
