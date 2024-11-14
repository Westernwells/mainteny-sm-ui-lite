import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useEffect} from 'react';

interface Props {
  url: string;
  fileName: string;
}

export const Actions = ({url, fileName}: Props) => {
  const {data: downloadUrl, refetch: downloadDocument} = useDownloadUrl(
    url ? [url] : [],
    {enabled: false},
  );

  useEffect(() => {
    if (downloadUrl && Object.values(downloadUrl).length) {
      const uploadUrl = Object.values(downloadUrl)[0];
      fetch(uploadUrl).then((response) =>
        response.blob().then((file) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.setAttribute('download', fileName);
          link.click();
        }),
      );
    }
  }, [downloadUrl]);

  return (
    <Box>
      {url ? (
        <IconButton onClick={() => downloadDocument()}>
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
