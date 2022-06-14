import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import EditIcon from '@mui/icons-material/Edit';

interface Props {
  content?: string;
}

export const DescriptionCard = ({content = ''}: Props) => {
  console.log();
  return (
    <InfoCard
      // handleAction={() => setOpenDialog(true)}
      header={<Typography variant="subtitle1">Description</Typography>}
      showHeaderBackground
      headerActionIcon={<EditIcon />}>
      {content}
    </InfoCard>
  );
};
