import {IconButton, Tooltip} from '@mui/material';
import {TextSnippetOutlined} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import {MouseEventHandler} from 'react';

interface Props {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
const TextBlockButton = ({onClick}: Props) => {
  const {t} = useTranslation();

  return (
    <Tooltip title={t('Text Blocks')} arrow placement="top">
      <IconButton
        sx={{
          borderRadius: '4px',
          padding: '5px',
        }}
        onClick={onClick}>
        <TextSnippetOutlined sx={{fontSize: '1.3rem', color: 'inherit'}} />
      </IconButton>
    </Tooltip>
  );
};
export default TextBlockButton;
