import {useState} from 'react';
import Box from '@mui/material/Box';
import {CustomProgress} from 'components/CustomProgress';

interface Props {
  downloadUrl?: string[];
}

export const HistoryAttachments = ({downloadUrl}: Props) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
      }}>
      {!loaded ? (
        <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>
          <CustomProgress />
        </Box>
      ) : null}
      {downloadUrl?.map((item, index) => (
        <Box
          sx={{
            width: '10.0625rem',
            height: '7.5rem',
            visibility: !loaded ? 'hidden' : 'visible',

            borderRadius: 1,
            mr: '1em',

            mt: '0.5em',
          }}>
          <img
            src={item}
            alt=""
            style={{objectFit: 'cover', height: '100%', width: '100%'}}
            onLoad={() => {
              if (downloadUrl.length === index + 1) {
                setLoaded(true);
              }
            }}
          />
        </Box>
      ))}
    </Box>
  );
};
