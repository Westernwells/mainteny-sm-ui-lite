import useTheme from '@mui/material/styles/useTheme';
import {Box, Grid, Skeleton} from '@mui/material';

export const NotificationCardSkeleton = ({length = 10}: {length?: number}) => {
  const theme = useTheme();
  return (
    <>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <Grid
            key={index}
            container
            flexDirection="column"
            rowGap={2}
            py="1.5em"
            px="1em"
            borderTop={`1px solid ${theme.state.hover}`}>
            <Grid item xs={12} display="flex" alignItems="center">
              <Box>
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
              <Box pl="0.5rem">
                <Skeleton variant="rectangular" width="12rem" height={16} />
              </Box>
            </Grid>
            <Skeleton variant="rectangular" height={16} />
            <Skeleton variant="rectangular" width="9rem" height={32} />
          </Grid>
        ))}
    </>
  );
};
