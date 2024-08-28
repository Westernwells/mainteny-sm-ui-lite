import {Box, CircularProgress, IconButton} from '@mui/material';
import {FileResourceRecord} from 'models/media';
import useTheme from '@mui/material/styles/useTheme';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useMemo} from 'react';

interface Props {
  data: FileResourceRecord;
  isEditing?: boolean;
  onDelete?: (data: FileResourceRecord) => void;
  serviceCompanyId?: string;
}

export const Image = ({
  data,
  onDelete,
  serviceCompanyId,
  isEditing = false,
}: Props) => {
  const theme = useTheme();
  const url = data.uri;
  const shouldNotDownload =
    url.startsWith('http') || url.includes('localhost') || url === 'loading';

  const {data: urls, isLoading: loadingState} = useDownloadUrl(
    [url],
    {
      enabled: !shouldNotDownload && !!url,
      refetchOnWindowFocus: false,
    },
    serviceCompanyId,
  );

  const urlToUse = useMemo(
    () => (shouldNotDownload ? data.uri : urls?.[url]),
    [urls, data],
  );
  const isLoading = loadingState || urlToUse === 'loading';

  return (
    <Box
      sx={{
        width: 150,
        height: 150,
        borderRadius: 1,
        margin: '0 5px',
        flexShrink: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${urlToUse})`,
        position: 'relative',
      }}>
      {isLoading && (
        <Box
          sx={{width: '100%', height: '100%'}}
          display="flex"
          justifyContent="center"
          alignItems="center">
          <CircularProgress size={25} />
        </Box>
      )}
      {isEditing && (
        <Box sx={{position: 'absolute', right: 5, top: 5}}>
          <IconButton
            onClick={() => onDelete?.(data)}
            sx={{
              backgroundColor: theme.palette.secondary.mainLight,
              p: 0.8,
              '&:hover': {
                backgroundColor: theme.palette.text.secondary,
              },
            }}>
            <DeleteOutlineIcon sx={{width: 20, height: 20}} htmlColor="white" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
