import styled from '@mui/system/styled';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import {useTranslation} from 'react-i18next';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AddIcon from '@mui/icons-material/Add';
import {ReactComponent as HyperlinkIcon} from 'assets/icons/Hyperlink.svg';
import {
  ConnectionTypeLabels,
  ContactPersonAssociationType,
  CreateContactPersonAssociationRecord,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {convertToText} from 'utils/utils';
import {SetStateAction, useEffect, useState} from 'react';
import {theme} from 'theme';
import {
  useAddContactPersonAssociation,
  useContactPersonAssociations,
  useDisconnectContactPersonAssociation,
} from 'hooks/reactQuery/useContacts';
import {useInView} from 'react-intersection-observer';
import {ConnectionCardSkeleton} from 'components/ConnectionCardSkeleton';
import {Button} from 'components/Button';
import ConnectionCard from './ConnectionCard';
import AddConnectionCard from './AddConnectionCard';

interface Props {
  contactPerson: ServiceCompanyContactPersonView | undefined;
}

const StyledExpandIcon = styled(ExpandMoreIcon)({
  fill: theme.palette.primary.main,
});

interface EmptyStateProps {
  setShowAddConnectionCard: (value: SetStateAction<boolean>) => void;
}
const EmptyState = ({setShowAddConnectionCard}: EmptyStateProps) => {
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        boxShadow: '0 4px 15px 0 rgba(144, 144, 144, 0.2)',
        border: '1px solid rgba(34, 43, 69, 0.12)',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: '4px',
        gap: '0.6rem',
      }}>
      <HyperlinkIcon width={30} height={30} />
      <Typography variant="h6">{t('No connections')}</Typography>
      <Typography color="text.secondary" variant="body1">
        {t('Add a connection by clicking the button bellow')}
      </Typography>
      <Button
        buttonProps={{
          onClick: () => setShowAddConnectionCard(true),
          variant: 'contained',
          size: 'medium',
          sx: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            lineHeight: 1,
          },
        }}>
        <AddIcon />
        {t('New connection')}
      </Button>
    </Box>
  );
};

const ConnectionsList = ({contactPerson}: Props) => {
  const {t} = useTranslation();
  const {ref: connectionsRef, inView: connectionsInView} = useInView();
  const contactPersonId = contactPerson?.id || '';

  const [showAddConnectionCard, setShowAddConnectionCard] = useState(false);
  const [connectionType, setConnectionType] = useState<
    ContactPersonAssociationType | 'ALL_CONNECTIONS'
  >('ALL_CONNECTIONS');

  const {
    data: contactPersonAssociations,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContactPersonAssociations(contactPerson?.id || '', {
    pageIndex: 0,
    pageSize: 10,
    ...(connectionType !== 'ALL_CONNECTIONS' && {refType: connectionType}),
  });
  const {mutate: disconnect} =
    useDisconnectContactPersonAssociation('Connection removed');
  const {mutate: addConnection} = useAddContactPersonAssociation(
    'Connection successfully added',
  );

  useEffect(() => {
    if (connectionsInView && hasNextPage) {
      fetchNextPage();
    }
  }, [connectionsInView]);

  const handleAddConnection = async (
    data: CreateContactPersonAssociationRecord,
  ) => {
    await addConnection({body: data, contactPersonId});
  };

  const handleDisconnect = async (associationId: string) => {
    await disconnect({associationId, contactPersonId});
  };

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Typography
            color="text.secondary"
            fontWeight={600}
            letterSpacing={1.1}>
            {t('CONNECTED TO')}
          </Typography>
          <Select
            labelId="demo-simple-select-label"
            label={t('Role')}
            size="small"
            required
            notched
            onChange={(e) => {
              setConnectionType(e.target.value as ContactPersonAssociationType);
            }}
            value={connectionType}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& [aria-labelledby="demo-simple-select-label"]': {
                fontWeight: 600,
              },
            }}
            IconComponent={StyledExpandIcon}>
            <MenuItem value="ALL_CONNECTIONS">{t('All connections')}</MenuItem>
            {Object.keys(ConnectionTypeLabels).map((type, index) => (
              <MenuItem value={type} key={index}>
                {convertToText(
                  t(ConnectionTypeLabels[type as ContactPersonAssociationType]),
                )}
              </MenuItem>
            ))}
          </Select>
        </Box>
        {contactPersonAssociations &&
          contactPersonAssociations?.pages?.[0]?.data?.length > 0 && (
            <IconButton onClick={() => setShowAddConnectionCard(true)}>
              <AddOutlinedIcon />
            </IconButton>
          )}
      </Box>

      {isLoading && <ConnectionCardSkeleton length={1} />}

      {showAddConnectionCard && (
        <AddConnectionCard
          onAddConnection={handleAddConnection}
          onCancel={() => setShowAddConnectionCard(false)}
        />
      )}

      {contactPersonAssociations?.pages?.[0].data.length === 0 &&
        !showAddConnectionCard && (
          <EmptyState setShowAddConnectionCard={setShowAddConnectionCard} />
        )}

      <Box display="flex" flexDirection="column">
        {contactPersonAssociations?.pages.map((page, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            gap="1rem"
            mb="1rem">
            {page.data.map((connection, idx) => (
              <Box key={idx} ref={connectionsRef}>
                <ConnectionCard
                  onDisconnect={handleDisconnect}
                  connection={connection}
                />
              </Box>
            ))}
          </Box>
        ))}
        {isFetchingNextPage && <ConnectionCardSkeleton length={1} />}
      </Box>
    </Box>
  );
};

export default ConnectionsList;
