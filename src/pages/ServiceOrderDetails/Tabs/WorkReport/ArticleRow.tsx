/* eslint-disable */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import DeleteIcon from '@mui/icons-material/Delete';

export const ArticleRow = () => {
  return (
    <Box
      sx={{
        boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
        p: '.5em',
        py: '1em',
      }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '3ch 2fr repeat(4, 10ch)',
          placeItems: 'center',
          gap: '0.5em',
        }}>
        <Typography
          variant="body2"
          component="p"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            height: '100%',
          }}>
          1
        </Typography>
        <Box sx={{justifySelf: 'start'}}>
          <Typography component="p" variant="body2">
            Renew hanging cable
          </Typography>
          <Box
            sx={{
              border: '1px solid #BDBDBD',
              borderRadius: '4px',
              p: '1em',
              mt: '1em',
            }}>
            <Typography variant="caption" component="p">
              ⦁ Prepare the elevator system
            </Typography>
            <Typography variant="caption" component="p">
              ⦁ Disconnecting and dismantling the old traveling cable
            </Typography>
            <Typography variant="caption" component="p">
              ⦁ Installation of a new traveling cable
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2"> €7,700</Typography>
        <Typography variant="body2"> 4</Typography>
        <Typography variant="body2">Products</Typography>
        <Typography variant="body2"> €30,800</Typography>
      </Box>
      <Box sx={{display: 'grid', justifyItems: 'end'}}>
        <Button
          label=" Delete Article"
          buttonProps={{
            color: 'error',
            endIcon: <DeleteIcon />,
            onClick: () => {},
            sx: {
              bgcolor: '#FF182F14',
              mx: '.5em',
              my: '0.5em',
            },
          }}
        />
      </Box>
    </Box>
  );
};
