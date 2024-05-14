import {Grid, Typography} from '@mui/material';
import {
  ConnectionTypeLabels,
  ContactPersonAssociationType,
  ContactPersonAssociationView,
} from 'models/contacts';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import StoreMallDirectoryOutlinedIcon from '@mui/icons-material/StoreMallDirectoryOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TagIcon from '@mui/icons-material/Tag';
import BusinessIcon from '@mui/icons-material/Business';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import {InfoCard} from 'components/InfoCard';
import {CardProps} from 'components/CardProps';
import {useTranslation} from 'react-i18next';
import {ReactNode, useState} from 'react';
import {ElevatorView} from 'models/elevator';
import {PropertyOwnerView} from 'models/propertyManager';
import {ContractView} from 'models/contract';
import {ArticleSupplierView} from 'models/article';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {statusColor} from 'components/StatusChip';
import {ServiceOrderLabels, ServiceOrderView} from 'models/service-order';
import {Confirm} from 'components/Confirm';

interface CardItemProps {
  label: string;
  value: ReactNode;
  icon: JSX.Element;
}
const getConnectionCardData = (
  connection: ContactPersonAssociationView,
): CardItemProps[] => {
  const {t} = useTranslation();
  switch (connection.refType) {
    case ContactPersonAssociationType.ELEVATOR: {
      const elevator = connection?.data as ElevatorView;
      return [
        {
          label: t('Customer name'),
          value: elevator?.propertyOwner?.name || '-',
          icon: <BusinessCenterOutlinedIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Address'),
          value: elevator.address?.fullName || '-',
          icon: <BusinessCenterOutlinedIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Building'),
          value: elevator.additionalInfo?.buildingLocation || '-',
          icon: <BusinessIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Serial number'),
          value: elevator.serialNumber || '-',
          icon: <TagIcon sx={{color: 'primary.light'}} />,
        },
      ];
    }
    case ContactPersonAssociationType.PROPERTY_OWNER: {
      const propertyOwner = connection?.data as PropertyOwnerView;
      return [
        {
          label: t('Customer name'),
          value: propertyOwner?.name || '-',
          icon: <BusinessCenterOutlinedIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Customer number'),
          value: propertyOwner.externalId || '-',
          icon: <TagIcon sx={{color: 'primary.light'}} />,
        },
      ];
    }
    case ContactPersonAssociationType.CONTRACT: {
      const contract = connection?.data as ContractView;
      return [
        {
          label: t('Customer name'),
          value: contract.propertyOwner?.name || '-',
          icon: <TagIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Contract name'),
          value: contract.name || '-',
          icon: <NoteAltOutlinedIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Contract number'),
          value: contract.externalId || '-',
          icon: <NoteAltOutlinedIcon sx={{color: 'primary.light'}} />,
        },
      ];
    }
    case ContactPersonAssociationType.ARTICLE_SUPPLIER: {
      const supplier = connection?.data as ArticleSupplierView;
      return [
        {
          label: t('Supplier name'),
          value: supplier?.name || '-',
          icon: (
            <StoreMallDirectoryOutlinedIcon sx={{color: 'primary.light'}} />
          ),
        },
        {
          label: t('Supplier number'),
          value: supplier.externalId || '-',
          icon: <TagIcon sx={{color: 'primary.light'}} />,
        },
      ];
    }
    case ContactPersonAssociationType.SERVICE_ORDER: {
      const serviceOrder = connection?.data as ServiceOrderView;
      return [
        {
          label: t('Job type'),
          value: t(ServiceOrderLabels[serviceOrder?.type]) || '-',
          icon: (
            <StoreMallDirectoryOutlinedIcon sx={{color: 'primary.light'}} />
          ),
        },
        {
          label: t('Job number'),
          value: serviceOrder.externalId || '-',
          icon: <TagIcon sx={{color: 'primary.light'}} />,
        },
        {
          label: t('Job status'),
          value: (
            <Typography
              color={
                statusColor[getServiceOrderStatusColor(serviceOrder.status)]
              }>
              {t(serviceOrderStatusToString(serviceOrder.status))}
            </Typography>
          ),
          icon: <InfoOutlinedIcon sx={{color: 'primary.light'}} />,
        },
      ];
    }
    default:
      return [];
  }
};

interface Props {
  connection: ContactPersonAssociationView;
  onDisconnect: (associationId: string) => void;
}
const ConnectionCard = ({connection, onDisconnect}: Props) => {
  const {t} = useTranslation();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  return (
    <>
      <Confirm
        maxWidth={450}
        open={openConfirmDialog}
        onConfirm={() => {
          onDisconnect(connection.id);
          setOpenConfirmDialog(false);
        }}
        onClose={() => setOpenConfirmDialog(false)}
        title="Remove connection"
        content="You are about to remove the connection from this contact person."
        secondContent="Are you sure?"
        closeBtnLabel="Cancel"
        confirmBtnLabel="Remove"
      />
      <InfoCard
        handleAction={() => setOpenConfirmDialog(true)}
        header={
          <Typography
            color="text.secondary"
            fontWeight={600}
            letterSpacing={1.1}>
            {t(ConnectionTypeLabels[connection.refType]).toUpperCase()}
          </Typography>
        }
        headerActionIcon={
          <LinkOffOutlinedIcon sx={{color: 'secondary.mainLight'}} />
        }
        containerStyles={{
          padding: '1.5rem',
          paddingTop: '0',
          border: '1px solid rgba(34, 43, 69, 0.12)',
        }}
        headerStyles={{marginTop: '1.5rem', padding: 0}}>
        <Grid container spacing={2}>
          {getConnectionCardData(connection).map(
            ({label, value, icon}, index) => (
              <Grid
                item
                xs={6}
                sm={6}
                md={6}
                key={`${label}-${value}-${index}`}>
                <CardProps
                  icon={icon}
                  label={t(label)}
                  bodyText={value}
                  iconMaxHeight="3em"
                  containerStyles={{alignItems: 'center'}}
                />
              </Grid>
            ),
          )}
        </Grid>
      </InfoCard>
    </>
  );
};

export default ConnectionCard;
