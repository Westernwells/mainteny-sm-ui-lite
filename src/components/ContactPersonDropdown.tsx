import React, {
  HTMLAttributes,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useServiceCompanyContactPersons} from 'hooks/reactQuery/useContacts';
import {debounce} from 'lodash';
import {Option} from 'models/filter';
import Autocomplete from 'components/Autocomplete';
import {Box, Typography} from '@mui/material';

interface ContactPersonDropdownProps {
  selectedContactId: string | undefined;
  onContactChange: (id: string | null) => void;
}

export const ContactPersonDropdown = ({
  selectedContactId,
  onContactChange,
}: ContactPersonDropdownProps) => {
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const {data: contactPersonsResource, isFetched} =
    useServiceCompanyContactPersons({
      pageSize: 100,
      query,
    });

  const contactOptions: Option[] = useMemo(
    () =>
      contactPersonsResource?.data.map((contact) => ({
        label: contact.userAccount.firstName
          ? `${contact.userAccount.firstName} ${contact.userAccount.lastName}`
          : contact.userAccount.lastName,
        value: contact.id,
      })) || [],
    [contactPersonsResource],
  );

  const contactPersonById = useMemo(
    () =>
      new Map(
        contactPersonsResource?.data.map((contact) => [contact.id, contact]) ||
          [],
      ),
    [contactPersonsResource],
  );

  const debouncedChangeHandler = useCallback(
    debounce((newValue: string) => {
      setQuery(newValue);
    }, 250),
    [],
  );

  const handleInputChange = (
    e: SyntheticEvent,
    newValue: string,
    reason: string,
  ) => {
    if (reason === 'reset') return;
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
    if (reason === 'clear') {
      setQueryView('');
      onContactChange(null);
    }
  };

  const handleChange = (_: SyntheticEvent, option: Option | null) => {
    onContactChange(option?.value ? option.value : null);
  };

  // set value on load
  useEffect(() => {
    if (!initialLoad || !isFetched) return;

    const foundContractId =
      contactOptions.find((contact) => contact.value === selectedContactId)
        ?.label || '';
    setQueryView(foundContractId);
    setInitialLoad(false);
  }, [selectedContactId, contactOptions, initialLoad, isFetched]);

  // handle reset
  useEffect(() => {
    if (selectedContactId === undefined) {
      setQueryView('');
    }
  }, [selectedContactId]);

  return (
    <Autocomplete
      size="small"
      options={contactOptions}
      onInputChange={handleInputChange}
      inputValue={queryView}
      sx={{
        '.MuiFormLabel-root': {
          marginTop: '-6px',
        },
      }}
      placeholderKey="Select contact"
      onChange={handleChange}
      renderOption={(props: HTMLAttributes<HTMLLIElement>, option: Option) => (
        <Box
          component="li"
          {...props}
          key={option.value}
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
            {option.label}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'left',
              width: '100%',
            }}>
            {contactPersonById.get(option.value)?.companyName || '-'}
          </Typography>
        </Box>
      )}
    />
  );
};
