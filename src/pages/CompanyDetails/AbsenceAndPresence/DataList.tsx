import {
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {Box, styled} from '@mui/system';
import {useTranslation} from 'react-i18next';
import {EmployeeEventType, EmployeeEventTypeRecord} from 'models/employee';
import {convertToText} from 'utils/utils';
import {CrossButton} from 'components/CrossButton';
import {DoneButton} from 'components/DoneButton';
import {Dispatch, SetStateAction, useEffect, useRef} from 'react';
import {ALL_EMPLOYEE_EVENT_TYPES} from 'utils/constants';
import {EmployeeEventTypeIconWithBackground} from 'components/EmployeeEventTypeIcon/EmployeeEventTypeIconWithBackground';
import {getEventSubtype} from 'utils/employee';
import {Actions} from './Actions';

const StyledDataListCell = styled(Box)(({theme}) => ({
  borderBottom: '0',
  borderLeft: '0',
  borderTop: '1px solid',
  borderRight: '1px solid',
  borderColor: '#222B451F',
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  paddingLeft: theme.spacing(1.3),
  paddingRight: theme.spacing(1.3),
  paddingTop: theme.spacing(0.7),
  paddingBottom: theme.spacing(0.7),

  '&:last-of-type': {
    borderRight: '0',
  },
}));

const StyledDataListHeading = styled(Box)(({theme}) => ({
  flex: 1,
  paddingLeft: theme.spacing(1.3),
  paddingRight: theme.spacing(1.3),
  paddingTop: theme.spacing(0.7),
  paddingBottom: theme.spacing(0.7),
  boxSizing: 'border-box',
}));

const StyledDataListRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  '&:last-child > *': {
    borderBottom: '1px solid #222B451F',
  },
}));

const StyledTextField = styled(TextField)(({theme}) => ({
  flex: 1,
  marginLeft: theme.spacing(1),
  fontSize: '14px',
  '& .MuiInputBase-root': {
    background: 'transparent',
  },
  '& .MuiInputBase-input': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '0px',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '0px !important',
  },
}));

const StyledSelect = styled(Select)(({theme}) => ({
  background: 'none',
  width: '100%',
  marginLeft: theme.spacing(1.3),
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
}));

interface Props {
  data: EmployeeEventTypeRecord[];
  mode?: 'view' | 'edit' | 'create';
  onCancel: () => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  loading?: boolean;
  onCreate?: () => Promise<void>;
  onEditStart: (event: EmployeeEventTypeRecord, index: number) => void;
  editingEvent: {
    event?: EmployeeEventTypeRecord;
    index?: number;
  };
  onDeleteStart?: (event: EmployeeEventTypeRecord, index: number) => void;
}

interface FormState {
  name?: string;
  type?: EmployeeEventType;
}

export const DataList = ({
  data,
  onCancel,
  form,
  setForm,
  onCreate,
  onEditStart,
  editingEvent,
  onDeleteStart,
  mode = 'view',
  loading = false,
}: Props) => {
  const {t} = useTranslation();
  const boxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: 'smooth', // Enables smooth scrolling
      });
    }
  };

  const isValid = !!form.name && !!form.type;

  useEffect(() => {
    if (mode === 'create') {
      scrollToBottom();
    }
  }, [mode]);

  return (
    <Box>
      <Box display="flex" flexDirection="row" sx={{position: 'relative'}}>
        <StyledDataListHeading>
          <Typography variant="h6">{t('Name')}</Typography>
        </StyledDataListHeading>

        <StyledDataListHeading>
          <Typography variant="h6">{t('Type')}</Typography>
        </StyledDataListHeading>
        {loading && (
          <LinearProgress
            sx={{position: 'absolute', width: '100%', bottom: 0}}
          />
        )}
      </Box>
      <Box
        ref={boxRef}
        sx={{overflowY: 'auto', maxHeight: '45vh', position: 'relative'}}>
        <>
          {data.map((item, index) => {
            const isEditing = mode === 'edit' && index === editingEvent.index;

            return (
              <StyledDataListRow>
                <StyledDataListCell>
                  <EmployeeEventTypeIconWithBackground type={item.type} />
                  {isEditing ? (
                    <StyledTextField
                      value={form.name}
                      onChange={(e) => {
                        setForm((prevForm) => ({
                          ...prevForm,
                          name: e.target.value,
                        }));
                      }}
                      size="small"
                      placeholder="Enter name"
                    />
                  ) : (
                    <Typography ml={1} variant="body2">
                      {getEventSubtype(
                        {
                          subtype: item.subtype,
                          type: item.type,
                        },
                        t,
                      )}
                    </Typography>
                  )}
                </StyledDataListCell>

                <StyledDataListCell
                  sx={isEditing ? {paddingTop: 0, paddingBottom: 0} : {}}>
                  <Box flex={1}>
                    {isEditing ? (
                      <StyledSelect
                        value={form.type}
                        sx={{marginLeft: 0}}
                        onChange={(e) => {
                          setForm((prevForm) => ({
                            ...prevForm,
                            type: e.target.value as EmployeeEventType,
                          }));
                        }}>
                        {ALL_EMPLOYEE_EVENT_TYPES.map((eventType) => (
                          <MenuItem
                            key={eventType.value}
                            value={eventType.value}>
                            {t(eventType.label)}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    ) : (
                      <>
                        <Typography color="primary.main" variant="body2">
                          {t(convertToText(item.type)).toUpperCase()}
                        </Typography>
                        <Typography color="#828DA3" variant="caption">
                          {item.presence
                            ? t('presence').toUpperCase()
                            : t('absence').toUpperCase()}
                        </Typography>
                      </>
                    )}
                  </Box>
                  {!isEditing && (
                    <Actions
                      eventType={item}
                      disabled={mode !== 'view'}
                      onEdit={() => {
                        onEditStart(item, index);
                      }}
                      onDelete={() => {
                        onDeleteStart?.(item, index);
                      }}
                    />
                  )}
                </StyledDataListCell>
              </StyledDataListRow>
            );
          })}
          {mode === 'create' && (
            <StyledDataListRow>
              <StyledDataListCell>
                <EmployeeEventTypeIconWithBackground type={form.type} />
                <StyledTextField
                  value={form.name}
                  onChange={(e) => {
                    setForm((prevForm) => ({
                      ...prevForm,
                      name: e.target.value,
                    }));
                  }}
                  size="small"
                  placeholder={t('Enter name')}
                />
              </StyledDataListCell>
              <StyledDataListCell sx={{flex: 0.8, padding: 0}}>
                <StyledSelect
                  value={form.type ?? ''}
                  sx={!form.type ? {color: '#828DA3'} : {}}
                  displayEmpty
                  onChange={(e) => {
                    setForm((prevForm) => ({
                      ...prevForm,
                      type: e.target.value as EmployeeEventType,
                    }));
                  }}>
                  <MenuItem disabled value="">
                    {t('Pick a type')}
                  </MenuItem>
                  {ALL_EMPLOYEE_EVENT_TYPES.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {t(item.label)}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </StyledDataListCell>
              <StyledDataListCell
                sx={{flex: 0.2, justifyContent: 'space-around'}}>
                <CrossButton onClick={onCancel} />
                <DoneButton disabled={!isValid} onClick={onCreate} />
              </StyledDataListCell>
            </StyledDataListRow>
          )}
        </>
      </Box>
    </Box>
  );
};
