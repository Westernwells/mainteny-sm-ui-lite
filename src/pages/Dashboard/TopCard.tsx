import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Check from '@mui/icons-material/Check';
import {SvgIconComponent} from '@mui/icons-material';

interface Props {
  icon?: SvgIconComponent;
  iconColor?: string;
  iconBackgroundColor?: string;
  title: string;
  value: string;
  subValue?: string;
}

export const TopCard = ({
  icon: Icon = Check,
  iconColor = 'success.main',
  iconBackgroundColor = 'success.outlinedHoverBg',
  title,
  value,
  subValue = '',
}: Props) => {
  const theme = useTheme();
  return (
    <Grid
      container
      alignItems="center"
      padding="1.5rem"
      flexWrap="nowrap"
      bgcolor="#fff"
      border={`1px solid ${theme.palette.background.default}`}
      borderRadius="0.25rem"
      boxShadow={`0px 4px 15px ${theme.palette.suvaGrey.light}`}>
      <Grid item>
        <IconButton
          sx={{
            bgcolor: iconBackgroundColor,
            padding: '0.75rem',
          }}>
          <Icon sx={{color: iconColor}} fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item justifyContent="space-between" paddingLeft="0.75rem">
        <Typography
          variant="subtitle2"
          color={theme.palette.text.secondary}
          pb="0.375rem">
          {title}
        </Typography>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Typography variant="h4">{value}</Typography>
          </Grid>
          {subValue && (
            <Grid item>
              <Chip
                label={subValue}
                variant="outlined"
                size="small"
                sx={{borderColor: '#E4E9F2'}}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
