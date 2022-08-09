import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  url?: string;
  name: string;
  designation: string;
}

export const Signature = ({url, name, designation}: Props) => (
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
      justifyContent="center">
      {url ? (
        <img
          alt=""
          src={url}
          style={{
            objectFit: 'cover',
            objectPosition: 'top',
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        'Not Available'
      )}

      {/* {url} */}
    </Box>
    <Box mt="-.8em" px=".25em" bgcolor="white">
      <Typography variant="h6">{name}</Typography>
    </Box>
    <Typography variant="body2" color="textSecondary">
      {designation}
    </Typography>
  </Box>
);
