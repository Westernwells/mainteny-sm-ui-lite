import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';

interface Props {
  url?: string;
  name: string;
  designation: string;
}

export const Signature = ({url, name, designation}: Props) => {
  const {t} = useTranslation();
  return (
    <Box
      mt=".5em"
      display="grid"
      justifyItems="center"
      textAlign="center"
      textTransform="capitalize">
      <Box
        height="8em"
        width="20em"
        border="2px solid"
        borderColor="primary.outlinedHoverBg"
        padding=".75em"
        borderRadius=".75em"
        display="flex"
        alignItems="center"
        overflow="hidden"
        justifyContent="center">
        {url ? (
          <img
            alt=""
            src={url}
            style={{
              objectFit: 'cover',
              objectPosition: 'top',
              maxWidth: '100%',
              maxHeight: '300%',
              height: '100%',
            }}
          />
        ) : (
          t('No Signature')
        )}
      </Box>
      <Box mt="-.8em" px=".25em" bgcolor="white">
        <Typography variant="h6">{name}</Typography>
      </Box>
      <Typography variant="body2" color="textSecondary">
        {t(designation)}
      </Typography>
    </Box>
  );
};
