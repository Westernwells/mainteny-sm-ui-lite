import {Box, IconButton, Typography} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {t} from 'i18next';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import {
  containerStyle,
  escIconButtonStyle,
  escTextStyle,
  iconButtonContainerStyle,
  iconButtonStyle,
  itemStyle,
  textStyle,
} from './Footer.styles';

const Footer = () => (
  <Box sx={containerStyle}>
    <Box sx={itemStyle}>
      <Box sx={iconButtonContainerStyle}>
        <IconButton sx={iconButtonStyle} disableRipple>
          <ArrowDropDownIcon sx={{fontSize: '1rem'}} />
        </IconButton>
        <IconButton sx={iconButtonStyle} disableRipple>
          <ArrowDropUpIcon sx={{fontSize: '1rem'}} />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{textStyle}}>
        {t('Navigate')}
      </Typography>
    </Box>
    <Box style={itemStyle}>
      <IconButton sx={iconButtonStyle} disableRipple>
        <SubdirectoryArrowLeftIcon sx={{fontSize: '1rem'}} />
      </IconButton>
      <Typography variant="body2" sx={{textStyle}}>
        {t('Select')}
      </Typography>
    </Box>
    <Box style={itemStyle}>
      <IconButton sx={escIconButtonStyle} disableRipple>
        <Typography variant="body2" sx={{escTextStyle}} fontWeight="600">
          {t('esc')}
        </Typography>
      </IconButton>
      <Typography variant="body2" sx={{textStyle}}>
        {t('Dismiss')}
      </Typography>
    </Box>
  </Box>
);

export default Footer;
