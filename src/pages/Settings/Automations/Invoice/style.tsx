import {Box, Select, TextField} from '@mui/material';
import {styled} from '@mui/system';

interface StyledProps {
  flex?: number | string;
  paddingLeft?: number | string;
  textAlign?: 'left' | 'center' | 'right';
}

export const StyledDataListCell = styled(Box)<StyledProps>(
  ({theme, flex, textAlign}) => ({
    borderBottom: '0',
    borderLeft: '0',
    borderTop: '1px solid',
    borderRight: '1px solid',
    borderColor: '#222B451F',
    display: 'flex',
    alignItems: 'center',
    flex: flex || '1',
    paddingLeft: theme.spacing(1.3),
    paddingRight: theme.spacing(1.3),
    paddingTop: theme.spacing(1.3),
    paddingBottom: theme.spacing(1.3),
    textAlign: textAlign || 'left',
    zIndex: 0,
    '&:last-of-type': {
      borderRight: '0',
    },
  }),
);

export const StyledDataListHeading = styled(Box)<StyledProps>(
  ({theme, flex, paddingLeft, textAlign}) => ({
    flex: flex || '1',
    paddingLeft: paddingLeft || theme.spacing(1.3),
    paddingRight: theme.spacing(1.3),
    paddingTop: theme.spacing(0.7),
    paddingBottom: theme.spacing(0.7),
    boxSizing: 'border-box',
    textAlign: textAlign || 'left',
  }),
);

export const StyledDataListRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  '&:last-child > *': {
    borderBottom: '1px solid #222B451F',
  },
}));

export const StyledTextField = styled(TextField)(({theme}) => ({
  flex: 1,
  marginLeft: theme.spacing(1),
  fontSize: '14px',
  '& .MuiInputBase-root': {
    background: 'transparent',
  },
  '& .MuiInputBase-input': {
    paddingLeft: 0,
    paddingRight: 0,
    fontWeight: 'bold',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '0px',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '0px !important',
  },
}));

export const StyledSelect = styled(Select)<{mode?: 'view' | 'edit' | 'create'}>(
  ({theme, mode}) => ({
    background: 'none',
    width: '100%',
    marginLeft: mode === 'create' ? theme.spacing(1.3) : 0,
    marginRight: theme.spacing(1.3),
    marginTop: theme.spacing(0.7),
    marginBottom: theme.spacing(0.7),
    '& .MuiSelect-select': {
      borderWidth: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 0,
      outline: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  }),
);

export const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 230,
    },
  },
};
