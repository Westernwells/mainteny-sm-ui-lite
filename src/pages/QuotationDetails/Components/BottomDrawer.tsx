import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import MoreIcon from '@mui/icons-material/MoreVert';
import PreviewIcon from '@mui/icons-material/Preview';

interface Props {
  isOpen: boolean;
}

export const BottomDrawer = ({isOpen}: Props) => (
  <Drawer
    PaperProps={{
      sx: {
        background: 'white',
        color: 'primary.main',
        py: '1em',
        zIndex: 'mobileStepper',
      },
    }}
    variant="persistent"
    anchor="bottom"
    open={isOpen}>
    <Box
      display="flex"
      justifyContent="flex-end"
      gap={2}
      sx={{my: 'auto', px: '4em'}}>
      <Button variant="outlined" startIcon={<PreviewIcon />} type="reset">
        Preview
      </Button>
      <ButtonGroup variant="contained" aria-label="button group">
        <Button>Save</Button>
        <IconButton
          sx={{
            color: 'primary.contrastText',
            bgcolor: 'primary.main',
            borderRadius: '0 4px 4px 0',
            overflow: 'hidden',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}>
          <MoreIcon />
        </IconButton>
      </ButtonGroup>
    </Box>
  </Drawer>
);
