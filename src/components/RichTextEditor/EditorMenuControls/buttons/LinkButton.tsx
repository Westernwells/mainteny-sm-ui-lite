import {IconButton, Tooltip} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import {t} from 'i18next';

const LinkButton = ({editor}: {editor: any}) => {
  const handleLinkInput = () => {
    // eslint-disable-next-line no-alert
    let userLink = prompt('Enter the URL, email address, or telephone number:');
    if (userLink) {
      // Ensure the URL is correctly formatted before inserting
      if (
        !userLink.startsWith('http://') &&
        !userLink.startsWith('https://') &&
        !userLink.startsWith('mailto:') &&
        !userLink.startsWith('tel:')
      ) {
        userLink = `https://${userLink}`;
      }

      editor.chain().focus().setLink({href: userLink}).run();
    }
  };

  return (
    <Tooltip title={t('Insert Link')} arrow placement="top">
      <IconButton
        onClick={handleLinkInput}
        sx={{borderRadius: '4px', padding: '5px'}}>
        <LinkIcon sx={{fontSize: '1.3rem'}} />
      </IconButton>
    </Tooltip>
  );
};

export default LinkButton;
