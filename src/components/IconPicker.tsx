import {
  Popover,
  IconButton,
  Grid,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
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
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormInput} from './form/FormInput';

const iconMapping = {
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

interface IconPickerPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onIconSelect: (iconName: string) => void;
  open: boolean;
  activeIcon: string;
}

export const IconPicker = ({
  anchorEl,
  open,
  onClose,
  onIconSelect,
  activeIcon,
}: IconPickerPopoverProps) => {
  const {t} = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter icons based on search query
  const filteredIcons = Object.keys(iconMapping).filter((iconName) =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleIconClick = (iconName: string) => {
    onIconSelect(iconName);
    onClose(); // Close the popover after selecting the icon
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}>
      <Grid
        container
        spacing={1}
        sx={{
          padding: 2,
          maxWidth: 300,
          height: 380,
          borderRadius: 4,
          py: 3,
          pl: 4,
          pr: 3,
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            pb: 2,
          }}>
          <Typography>{t('Job icon')}</Typography>
          <IconButton sx={{p: 0}} onClick={onClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        <Box sx={{pb: 1, width: '100%'}}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: 'Search icons',
              label: '',
              name: 'searchQuery',
              required: true,
              value: searchQuery,
              onChange: (event) => setSearchQuery(event?.target.value),
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Grid container spacing={1}>
          {filteredIcons.length > 0 ? (
            filteredIcons?.map((iconName) => {
              const IconComponent =
                iconMapping[iconName as keyof typeof iconMapping];
              return (
                <Grid item xs={2.4} key={iconName}>
                  <IconButton
                    onClick={() => handleIconClick(iconName)}
                    sx={{
                      background: '#F7F9FC',
                      borderRadius: '4px',
                      my: 0.5,
                      border:
                        activeIcon === iconName
                          ? '2px solid #000034'
                          : '2px solid transparent',
                      '&:hover': {
                        border: '2px solid #000034',
                      },
                    }}>
                    <IconComponent />
                  </IconButton>
                </Grid>
              );
            })
          ) : (
            <Box sx={{textAlign: 'center', width: '100%'}}>
              <Typography variant="body2">No icons found</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Popover>
  );
};
