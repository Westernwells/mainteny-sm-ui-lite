import React, {ReactNode, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {InvoiceFormData} from 'models/invoice';
import {EditCustomerForm} from 'pages/InvoiceDetails/EditCustomerForm';
import {AddressRecord} from 'models/misc';
import {formatAddressFullname} from 'utils/utils';
import {TFunction} from 'i18next';
import AddIcon from '@mui/icons-material/Add';
import {getCountryCode} from 'utils/countries';
import {UseFormReturn} from 'react-hook-form';
import cloneDeep from 'lodash/cloneDeep';
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
  formMethods: UseFormReturn<InvoiceFormData>;
  address?: AddressRecord;
  customerName?: string;
  translate?: TFunction<'translation', 'translation'>;
}

export const SelectAndEditCombined = ({
  label,
  labelRequired,
  selected,
  buttonText,
  cardOnClose,
  editButtonText,
  modalHeader,
  addressType,
  formMethods,
  address,
  customerName,
  translate,
}: Props) => {
  const {t} = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();

  const {setValue, getValues} = formMethods;

  const [savedInitialAddress, setSavedInitialAddress] = useState<
    AddressRecord | undefined
  >(undefined);

  const openModal = () => {
    setSavedInitialAddress(cloneDeep(getValues()[addressType]));
    setIsModalOpen(true);
  };

  const onCloseDialog = () => {
    setIsModalOpen(false);
    setValue(addressType, savedInitialAddress);
    setSavedInitialAddress(undefined);
  };

  const onSaveAddress = () => {
    const currentAddress = getValues(addressType);
    const updatedAddress = {
      ...currentAddress,
      component: {
        ...currentAddress?.component,
        country: currentAddress?.component?.country
          ? translate
            ? translate(currentAddress.component.country as string)
            : currentAddress.component.country
          : '',
      },
      ...(currentAddress?.component?.country && {
        countryCode: getCountryCode(currentAddress.component.country),
      }),
      fullName:
        formatAddressFullname(currentAddress, translate)?.fullName ?? null,
    };
    setValue(addressType, updatedAddress);
    setIsModalOpen(false);
    setSavedInitialAddress(undefined);
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
              onClick: openModal,
            }}
          />
        </Box>
      );
    }

    return (
      <SelectButton
        text={t(buttonText)}
        onClick={openModal}
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
                onClick: openModal,
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
        dialogProps={{
          maxWidth: 'md',
          open: isModalOpen || false,
        }}>
        <EditCustomerForm
          formMethods={formMethods}
          address={addressType}
          customerName={customerName}
        />
      </Dialog>
    </Box>
  );
};
