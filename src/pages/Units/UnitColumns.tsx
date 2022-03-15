import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';

export const UnitColumns = () => (
  <Box
    // display="flex"
    sx={{
      backgroundColor: '#fff',
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: '15px',
      boxShadow: '0px 0px 0px 1px #E0E0E0',
      borderRadius: '4px',
      minHeight: '2.5rem',
    }}>
    <Grid container sx={{pl: 2}}>
      <Grid item xs={3}>
        <Typography variant="subtitle2">UNIT NAME</Typography>
      </Grid>
      <Grid
        item
        container
        xs={9}
        spacing={2}
        sx={{display: 'flex', justifyContent: 'flex-end'}}>
        <Grid item xs={2}>
          <Typography variant="subtitle2">LAST VISIT</Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="subtitle2">NEXT VISIT</Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="subtitle2">
            <Box display="flex" justifyContent="center">
              AVAILABILITY
            </Box>
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="subtitle2">
            <Box display="flex" justifyContent="center">
              STATUS
            </Box>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Box>
);
