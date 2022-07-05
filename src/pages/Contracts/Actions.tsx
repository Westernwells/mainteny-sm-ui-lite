import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';

import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';

interface Props {
  url: string;
}

export const Actions = ({url}: Props) => {
  const {data: downloadUrl} = useDownloadUrl(url ? [url] : []);

  return (
    <Box>
      {url ? (
        <IconButton
          onClick={() => {
            if (downloadUrl && Object.values(downloadUrl).length) {
              const uploadUrl = Object.values(downloadUrl)[0];
              fetch(uploadUrl).then((response) =>
                response.blob().then((file) => {
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(file);
                  link.setAttribute('download', 'contract');
                  link.click();
                }),
              );
            }
          }}>
          <FileDownloadOutlinedIcon
            fontSize="small"
            sx={{color: 'action.active'}}
          />
        </IconButton>
      ) : (
        <IconButton disabled>
          <FileDownloadOffOutlinedIcon
            fontSize="small"
            sx={{color: 'action.active', cursor: 'not-allowed'}}
          />
        </IconButton>
      )}
    </Box>
  );
};
