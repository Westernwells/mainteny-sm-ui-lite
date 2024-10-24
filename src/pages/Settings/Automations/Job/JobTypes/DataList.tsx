import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  MouseEvent,
} from 'react';
import {
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {Box, styled} from '@mui/system';
import {useTranslation} from 'react-i18next';
import {CrossButton} from 'components/CrossButton';
import {DoneButton} from 'components/DoneButton';
import {ALL_SERVICE_ORDER_TYPE_PRIORITY} from 'utils/constants';
import {
  ServiceOrderTypePriority,
  ServiceOrderTypeRecord,
} from 'models/service-order';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import WifiTetheringOutlinedIcon from '@mui/icons-material/WifiTetheringOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ZoomOutMapOutlinedIcon from '@mui/icons-material/ZoomOutMapOutlined';
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import WaterDamageOutlinedIcon from '@mui/icons-material/WaterDamageOutlined';
import WatchOutlinedIcon from '@mui/icons-material/WatchOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import VolumeDownOutlinedIcon from '@mui/icons-material/VolumeDownOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import UmbrellaOutlinedIcon from '@mui/icons-material/UmbrellaOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import {generateOptions} from 'utils/settings';
import {IconPicker} from 'components/IconPicker';
import {Actions} from './Actions';

interface StyledProps {
  flex?: number | string;
  paddingLeft?: number | string;
}

export const StyledDataListCell = styled(Box)<StyledProps>(({theme, flex}) => ({
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
  paddingTop: theme.spacing(0.7),
  paddingBottom: theme.spacing(0.7),
  '&:last-of-type': {
    borderRight: '0',
  },
}));

export const StyledDataListHeading = styled(Box)<StyledProps>(
  ({theme, flex, paddingLeft}) => ({
    flex: flex || '1',
    paddingLeft: paddingLeft || theme.spacing(1.3),
    paddingRight: theme.spacing(1.3),
    paddingTop: theme.spacing(0.7),
    paddingBottom: theme.spacing(0.7),
    boxSizing: 'border-box',
  }),
);

export const StyledDataListRow = styled(Box)(() => ({
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
    fontWeight: 'bold',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '0px',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '0px !important',
  },
}));

const StyledSelect = styled(Select)<{mode: 'view' | 'edit' | 'create'}>(
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

const menuProps = {
  PaperProps: {
    style: {
      maxHeight: 230,
    },
  },
};

export const iconMapping = {
  LoopOutlinedIcon,
  WarningAmberOutlinedIcon,
  SettingsOutlinedIcon,
  PhoneInTalkOutlinedIcon,
  BuildOutlinedIcon,
  MemoryOutlinedIcon,
  SearchOutlinedIcon,
  RemoveRedEyeOutlinedIcon,
  HandymanOutlinedIcon,
  WbIncandescentOutlinedIcon,
  WeekendOutlinedIcon,
  WifiTetheringOutlinedIcon,
  WorkOutlineOutlinedIcon,
  ZoomOutMapOutlinedIcon,
  TextsmsOutlinedIcon,
  WaterDamageOutlinedIcon,
  WatchOutlinedIcon,
  VpnKeyOutlinedIcon,
  VolumeDownOutlinedIcon,
  VideoCameraFrontOutlinedIcon,
  VerifiedUserOutlinedIcon,
  TwoWheelerOutlinedIcon,
  UmbrellaOutlinedIcon,
  ElevatorOutlinedIcon,
  HelpOutlineOutlinedIcon,
};

export const PriorityCircle = styled(Box)(({color}) => ({
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  border: `2px solid ${color}`,
  marginRight: '20px',
}));

// Map the priority levels to their respective colors
export const priorityColorMap = {
  Urgent: '#FF605A',
  High: '#FFB547',
  Medium: '#64B6F7',
  Low: '#828DA3',
};

export const priorityToText = (priority: string): string => {
  enum Priority {
    URGENT = 'Urgent',
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
  }

  return Priority[priority as keyof typeof Priority] || 'Unknown';
};

interface FormState {
  name: string;
  icon: string;
  priority: ServiceOrderTypePriority;
  createInAdvanceDays: number;
}

interface Props {
  data: ServiceOrderTypeRecord[];
  mode?: 'view' | 'edit' | 'create';
  onCancel: () => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  loading?: boolean;
  onCreate?: () => Promise<void>;
  onEditStart: (event: ServiceOrderTypeRecord, index: number) => void;
  editingEvent: {
    event?: ServiceOrderTypeRecord;
    index?: number;
  };
  onDeleteStart?: (event: ServiceOrderTypeRecord, index: number) => void;
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

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleIconClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleIconSelect = (iconName: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      icon: iconName,
    }));
    handleClosePopover();
  };

  const isPopoverOpen = Boolean(anchorEl);

  const NewFormIconComponent =
    iconMapping[
      (form.icon as keyof typeof iconMapping) || 'HelpOutlineOutlinedIcon'
    ];

  const boxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const isValid = !!form.name && !!form.icon && !!form.priority;

  useEffect(() => {
    if (mode === 'create') {
      scrollToBottom();
      setForm((prevForm) => ({
        ...prevForm,
        icon: 'HelpOutlineOutlinedIcon',
      }));
    }
  }, [mode]);

  const renderTableHeader = () => (
    <Box display="flex" flexDirection="row" sx={{position: 'relative'}}>
      <StyledDataListHeading flex="0 0 10%">
        <Typography variant="h6">{t('Icon')}</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading flex="0 0 30%">
        <Typography variant="h6">{t('Name')}</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading flex="0 0 22%">
        <Typography variant="h6">{t('Priority')}</Typography>
      </StyledDataListHeading>

      <StyledDataListHeading
        flex="0 0 33%"
        sx={{alignItems: 'center', flexDirection: 'row', display: 'flex'}}>
        <Tooltip
          title={t(
            'E.g. If you select 15 days, the system will create all jobs for May on the 15th of April. If you select 0 days, the jobs will be created 1st of May.',
          )}
          placement="top"
          arrow>
          <Box sx={{mr: 1, mb: 0, cursor: 'pointer'}}>
            <AlertInfoIcon width="16px" height="16px" />
          </Box>
        </Tooltip>
        <Typography variant="h6">{t('Create in advance')}</Typography>
      </StyledDataListHeading>

      {loading && (
        <LinearProgress sx={{position: 'absolute', width: '100%', bottom: 0}} />
      )}
    </Box>
  );

  return (
    <Box>
      {renderTableHeader()}

      <Box
        ref={boxRef}
        sx={{overflowY: 'auto', maxHeight: '45vh', position: 'relative'}}>
        <>
          {data?.map((item, index) => {
            const IconComponent =
              iconMapping[item.icon as keyof typeof iconMapping];

            const isEditing = mode === 'edit' && index === editingEvent.index;

            return (
              <StyledDataListRow
                key={`${item.name}-${index}`}
                sx={{
                  backgroundColor: isEditing ? '#F8F9FC' : 'transparent',
                  transition: 'background-color 0.3s ease',
                }}>
                <StyledDataListCell flex="0 0 10%">
                  {isEditing ? (
                    <IconButton
                      onClick={(event) => handleIconClick(event)}
                      sx={
                        isEditing
                          ? {
                              borderRadius: '4px',
                              border: '1px solid #8F9BB380',
                              '&:hover': {
                                background: '#000034',
                                color: 'white',
                              },
                            }
                          : {}
                      }>
                      {React.createElement(
                        iconMapping[form.icon! as keyof typeof iconMapping],
                      )}{' '}
                    </IconButton>
                  ) : (
                    IconComponent && (
                      <IconButton
                        sx={
                          isEditing
                            ? {
                                borderRadius: '4px',
                                border: '1px solid #8F9BB380',
                              }
                            : {}
                        }>
                        <IconComponent />
                      </IconButton>
                    )
                  )}

                  {isEditing && (
                    <IconPicker
                      anchorEl={anchorEl}
                      open={isPopoverOpen}
                      onClose={handleClosePopover}
                      onIconSelect={(iconName) => {
                        setForm((prevForm) => ({
                          ...prevForm,
                          icon: iconName,
                        }));
                        handleClosePopover();
                      }}
                      activeIcon={form.icon || 'HelpOutlineOutlinedIcon'}
                    />
                  )}
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 30%">
                  {isEditing ? (
                    <StyledTextField
                      value={form.name}
                      onChange={(e) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          name: e.target.value,
                        }))
                      }
                      size="small"
                      placeholder="Enter name"
                    />
                  ) : (
                    <Typography ml={1} variant="body2">
                      {serviceOrderTypeToString(item.name) === '-'
                        ? item.name
                        : t(serviceOrderTypeToString(item.name))}
                    </Typography>
                  )}
                </StyledDataListCell>

                <StyledDataListCell
                  flex="0 0 22%"
                  sx={isEditing ? {paddingTop: 0, paddingBottom: 0} : {}}>
                  <Box flex={1}>
                    {isEditing ? (
                      <StyledSelect
                        mode={mode}
                        value={form.priority ?? ''}
                        sx={!form.priority ? {color: '#828DA3'} : {}}
                        onChange={(e) =>
                          setForm((prevForm) => ({
                            ...prevForm,
                            priority: e.target
                              .value as ServiceOrderTypePriority,
                          }))
                        }
                        MenuProps={menuProps}>
                        {ALL_SERVICE_ORDER_TYPE_PRIORITY.map(
                          (orderPriority) => (
                            <MenuItem
                              key={orderPriority.value}
                              value={orderPriority.value}>
                              <Box sx={{alignItems: 'center', display: 'flex'}}>
                                <PriorityCircle
                                  color={
                                    priorityColorMap[
                                      orderPriority.label as keyof typeof priorityColorMap
                                    ]
                                  }
                                />
                                <Typography>
                                  {t(orderPriority.label)}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ),
                        )}
                      </StyledSelect>
                    ) : (
                      <Box sx={{alignItems: 'center', display: 'flex'}}>
                        <PriorityCircle
                          color={
                            priorityColorMap[
                              priorityToText(
                                item.priority,
                              ) as keyof typeof priorityColorMap
                            ]
                          }
                        />
                        <Typography color="primary.main" variant="body2">
                          {t(priorityToText(item.priority))}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </StyledDataListCell>

                <StyledDataListCell
                  flex={isEditing ? '0 0 23%' : '0 0 36%'}
                  sx={isEditing ? {paddingTop: 0, paddingBottom: 0} : {}}>
                  <Box flex={1}>
                    {isEditing ? (
                      <StyledSelect
                        mode={mode}
                        value={form.createInAdvanceDays ?? ''}
                        onChange={(e) =>
                          setForm((prevForm) => ({
                            ...prevForm,
                            createInAdvanceDays: Number(e.target.value),
                          }))
                        }
                        MenuProps={menuProps}>
                        {generateOptions().map((daysInAdvance) => (
                          <MenuItem
                            key={daysInAdvance.value}
                            value={daysInAdvance.value}>
                            {t(daysInAdvance.label)}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    ) : (
                      <Typography color="primary.main" variant="body2">
                        {t(
                          item.createInAdvanceDays === 1
                            ? '{{time}} day'
                            : '{{time}} days',
                          {
                            time: item.createInAdvanceDays,
                          },
                        )}
                      </Typography>
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

                <StyledDataListCell
                  sx={{
                    flex: isEditing ? '0 0 14%' : '0 0 0%',
                    justifyContent: 'space-around',
                  }}>
                  {isEditing && (
                    <>
                      <CrossButton onClick={onCancel} />
                      <DoneButton disabled={!isValid} onClick={onCreate} />
                    </>
                  )}
                </StyledDataListCell>
              </StyledDataListRow>
            );
          })}

          {mode === 'create' && (
            <StyledDataListRow
              sx={{
                backgroundColor: '#F8F9FC',
                transition: 'background-color 0.3s ease',
              }}>
              <StyledDataListCell flex="0 0 10%">
                <IconButton
                  sx={{
                    borderRadius: '4px',
                    border: '1px solid #8F9BB380',
                    '&:hover': {
                      background: '#000034',
                      color: 'white',
                    },
                  }}
                  onClick={(event) => handleIconClick(event)}>
                  <NewFormIconComponent />
                </IconButton>
                <IconPicker
                  anchorEl={anchorEl}
                  open={isPopoverOpen}
                  onClose={handleClosePopover}
                  onIconSelect={handleIconSelect}
                  activeIcon={form.icon || 'HelpOutlineOutlinedIcon'}
                />
              </StyledDataListCell>
              <StyledDataListCell flex="0 0 30%">
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
              <StyledDataListCell sx={{flex: '0 0 22%', padding: 0}}>
                <StyledSelect
                  mode={mode}
                  value={form.priority ?? ''}
                  sx={!form.priority ? {color: '#828DA3'} : {}}
                  displayEmpty
                  onChange={(e) => {
                    setForm((prevForm) => ({
                      ...prevForm,
                      priority: e.target.value as ServiceOrderTypePriority,
                    }));
                  }}
                  MenuProps={menuProps}>
                  <MenuItem disabled value="">
                    {t('Pick priority')}
                  </MenuItem>
                  {ALL_SERVICE_ORDER_TYPE_PRIORITY.map((orderPriority) => (
                    <MenuItem
                      key={orderPriority.value}
                      value={orderPriority.value}>
                      <Box sx={{alignItems: 'center', display: 'flex'}}>
                        <PriorityCircle
                          color={
                            priorityColorMap[
                              orderPriority.label as keyof typeof priorityColorMap
                            ]
                          }
                        />
                        <Typography>{t(orderPriority.label)}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </StyledSelect>
              </StyledDataListCell>
              <StyledDataListCell flex="0 0 25%">
                <StyledSelect
                  mode={mode}
                  value={form.createInAdvanceDays}
                  sx={{marginLeft: 0}}
                  displayEmpty
                  onChange={(e) => {
                    setForm((prevForm) => ({
                      ...prevForm,
                      createInAdvanceDays: Number(e.target.value) as number,
                    }));
                  }}
                  MenuProps={menuProps}>
                  {generateOptions().map((daysInAdvance) => (
                    <MenuItem
                      key={daysInAdvance.value}
                      value={daysInAdvance.value}>
                      {t(daysInAdvance.label)}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </StyledDataListCell>
              <StyledDataListCell
                sx={{flex: '0 0 10%', justifyContent: 'space-around'}}>
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
