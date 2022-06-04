import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {MyDropZone} from 'components/MyDropzone';
import {useState} from 'react';

export const Pictures = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const onSave = () => {};
  return (
    <InfoCard
      headerActionIcon={<Typography color="info.main">+Add</Typography>}
      handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">Pictures</Typography>}>
      <Box>kdk</Box>

      <Dialog
        title="Add Pictures"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <MyDropZone
          getAcceptedFiles={(file) => {
            console.log(file, '#####@@@@@');
          }}
          getRejectedFileWithErrors={(file) => {
            console.log(file, '||||');
          }}
        />
      </Dialog>
    </InfoCard>
  );
};
