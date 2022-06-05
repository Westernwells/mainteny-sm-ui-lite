import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useFetchElevatorComments} from 'hooks/reactQuery/useElevator';
import {EmptySection} from 'components/EmptySection';

interface Props {
  elevatorId?: string;
}

export const Notes = ({elevatorId}: Props) => {
  const theme = useTheme();
  const {data: elevatorNotes} = useFetchElevatorComments(
    {pageIndex: 0, pageSize: 50},
    elevatorId || '',
  );

  console.log(elevatorNotes, '|||||||');
  const renderNote = () => (
    <Box
      sx={{
        border: `1px solid ${theme.palette.suvaGrey.light}`,
        p: '0.5em',
        borderRadius: '4px',
      }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="caption">23.09.2021 (10:30)</Typography>
        <Box sx={{display: 'flex'}}>
          <EditIcon sx={{color: theme.palette.action.active}} />
          <DeleteIcon sx={{color: theme.palette.action.active}} />
        </Box>
      </Box>
      <Typography variant="subtitle2">Bruce Wayne</Typography>
      <Typography variant="caption">
        The door engine has to be replaced within the next 5 months.
      </Typography>
    </Box>
  );
  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
        },
      }}
      showHeaderBackground
      header={
        <Typography component="div" variant="subtitle1">
          Notes
        </Typography>
      }
      headerActionIcon={<Typography color="info.main">+Add</Typography>}>
      <EmptySection />
      <Box>{renderNote()}</Box>
    </InfoCard>
  );
};
