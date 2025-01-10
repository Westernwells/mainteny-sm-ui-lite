import React from 'react';
import {Autocomplete, TextField, Typography, Box} from '@mui/material';
import {ServiceCompanyContactPersonView} from 'models/contacts';
import {useTranslation} from 'react-i18next';

interface ContactPersonDropdownProps {
  contactPersons?: ServiceCompanyContactPersonView[];
  selectedContactId: string | undefined;
  onContactChange: (contact: ServiceCompanyContactPersonView | null) => void;
}

export const ContactPersonDropdown: React.FC<ContactPersonDropdownProps> = ({
  contactPersons,
  selectedContactId,
  onContactChange,
}) => {
  const {t} = useTranslation();

  const selectedContact = contactPersons?.find(
    (contact) => contact.id === selectedContactId,
  );

  return (
    <Autocomplete
      options={contactPersons!}
      value={selectedContact || null}
      getOptionLabel={(option) =>
        `${option.userAccount.firstName} ${option.userAccount.lastName}`
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('Contact Person')}
          sx={{
            '& .MuiInputBase-root': {
              padding: '4px 8px',
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'left',
              width: '100%',
            }}>
            {`${option.userAccount.firstName} ${option.userAccount.lastName}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'left',
              width: '100%',
            }}>
            {option.companyName || '-'}
          </Typography>
        </Box>
      )}
      onChange={(event, value) => onContactChange(value || null)}
      ListboxProps={{
        style: {
          maxHeight: '180px',
          overflow: 'auto',
        },
      }}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
    />
  );
};
