import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileDownloadOffOutlinedIcon from '@mui/icons-material/FileDownloadOffOutlined';

import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import Delete from '@mui/icons-material/Delete';
import {useState} from 'react';
import {useDeleteContract} from 'hooks/reactQuery/useContract';
import {Confirm} from 'components/Confirm';

interface Props {
  url: string;
  fileName: string;
  contractId: string;
}

export const Actions = ({url, fileName, contractId}: Props) => {
  const {data: downloadUrl} = useDownloadUrl(url ? [url] : []);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const {mutateAsync: deleteContract, isLoading: isDeleting} =
    useDeleteContract('Contract deleted successfully');

  return (
    <Box>
      {url ? (
        <>
          <IconButton
            onClick={() => {
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
            }}>
            <FileDownloadOutlinedIcon
              fontSize="small"
              sx={{color: 'action.active'}}
            />
          </IconButton>
          <IconButton onClick={() => setOpenDeleteConfirm(true)}>
            <Delete sx={{ml: '0.5em'}} />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton disabled>
            <FileDownloadOffOutlinedIcon
              fontSize="small"
              sx={{color: 'action.active', cursor: 'not-allowed'}}
            />
          </IconButton>
          <IconButton onClick={() => setOpenDeleteConfirm(true)}>
            <Delete sx={{ml: '0.5em'}} />
          </IconButton>
        </>
      )}

      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteContract(contractId!);
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this contract?"
      />
    </Box>
  );
};
