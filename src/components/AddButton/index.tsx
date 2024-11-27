import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {SxProps} from '@mui/system';
import {Button} from '../Button';

type Props = {
  label: string;
  onClick: () => void;
  Icon?: JSX.Element;
  styles?: SxProps;
  labelStyles?: SxProps;
};

const AddButton = ({label, styles, labelStyles, Icon, onClick}: Props) => {
  const {t} = useTranslation();

  return (
    <Button
      buttonProps={{
        onClick,
        sx: {
          textTransform: 'capitalize',
          fontSize: '14px',
          height: '36px',
          ...styles,
        },
        variant: 'contained',
        color: 'primary',
        size: 'small',
        startIcon: Icon || <AddIcon />,
      }}>
      <Typography
        variant="body1"
        sx={{textTransform: 'capitalize', ...labelStyles}}>
        {t(label)}
      </Typography>
    </Button>
  );
};

export default AddButton;
