import React from 'react';
import {Tooltip, Typography, Button} from '@mui/material';
import DOMPurify from 'dompurify';
import {useTranslation} from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Props = {
  textContent: string;
  valueToShow: string;
  onButtonClick: () => void;
};

const TruncatedTooltip = ({textContent, valueToShow, onButtonClick}: Props) => {
  const {t} = useTranslation();

  return (
    <Tooltip
      style={{zIndex: 2000}}
      title={
        <div>
          <Typography
            sx={{
              maxWidth: 250,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              whiteSpace: 'normal',
              fontSize: '0.9rem',
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(textContent),
            }}
          />
          <Button
            variant="text"
            size="small"
            sx={{
              my: 1,
              width: '100%',
              color: 'white',
              border: '1px solid white',
              borderRadius: '1px',
            }}
            onClick={(event) => {
              event.stopPropagation();
              onButtonClick();
            }}>
            {t('Show full description')}
            <InfoOutlinedIcon fontSize="small" style={{marginLeft: '0.2em'}} />
          </Button>
        </div>
      }
      arrow
      placement="top">
      <Typography
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(valueToShow),
        }}
      />
    </Tooltip>
  );
};

export default TruncatedTooltip;
