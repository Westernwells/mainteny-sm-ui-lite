import {Dispatch, SetStateAction, UIEvent, useState} from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ServiceCompanyContactPersonView} from 'models/contacts';
import debounce from 'lodash/debounce';
import Notes from '../Notes';
import {ProfilePicturePreview} from '../ProfilePictureInput';
import ContactHeaderInfo from './ContactHeaderInfo';
import ConnectionsList from './ConnectionsList';

interface Props {
  showSideDrawer: boolean;
  setShowSideDrawer: Dispatch<SetStateAction<boolean>>;
  contactPerson: ServiceCompanyContactPersonView | undefined;
}

const ContactDetails = ({
  showSideDrawer,
  setShowSideDrawer,
  contactPerson,
}: Props) => {
  const [scrollTop, setScrollTop] = useState(0);
  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  const debouncedSetScrollTop = debounce((scrollToTop: number) => {
    setScrollTop(scrollToTop);
  }, 15);

  return (
    <Drawer
      anchor="right"
      open={showSideDrawer}
      onClose={handleCloseSideDrawer}
      PaperProps={{
        onScroll: (event: UIEvent<HTMLDivElement, UIEvent>) => {
          event.stopPropagation();
          debouncedSetScrollTop(event.currentTarget.scrollTop);
        },

        sx: {
          width: '32em',
          color: 'text.primary',
          background: 'white',
        },
      }}>
      <Box
        py="1.5rem"
        px="2rem"
        display="flex"
        flexDirection="column"
        gap="2rem">
        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="sticky"
          top={0}
          margin="0 -2rem"
          marginTop="-1.5rem"
          padding="1.5rem 2rem"
          bgcolor="white"
          boxShadow={`${
            scrollTop > 30 ? '0px 4px 15px rgba(144, 144, 144, 0.2)' : 'none'
          }`}
          zIndex={99}>
          <Box display="flex" alignItems="center" gap="1rem">
            <ProfilePicturePreview
              imageUrl={contactPerson?.userAccount?.photoUrl ?? ''}
              contactPerson={{
                name: contactPerson?.userAccount?.firstName ?? '',
                surname: contactPerson?.userAccount?.lastName ?? '',
              }}
            />
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">
                {`${contactPerson?.userAccount?.firstName} ${contactPerson?.userAccount?.lastName}`}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {contactPerson?.userAccount?.contact?.email}
              </Typography>
            </Box>
          </Box>
          <Notes
            showLabel
            shouldGoBack
            contactPersonId={contactPerson?.id ?? ''}
            notesCount={contactPerson?.commentCount ?? 0}
          />
        </Box>

        <ContactHeaderInfo contactPerson={contactPerson} />

        <ConnectionsList contactPerson={contactPerson} />
      </Box>
    </Drawer>
  );
};
export default ContactDetails;
