import useTheme from '@mui/material/styles/useTheme';
import {Box, Grid, Skeleton} from '@mui/material';

export const ConnectionCardSkeleton = ({length = 10}: {length?: number}) => {
  const theme = useTheme();
  return (
    <>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <Box key={index}>
            <Grid
              container
              flexDirection="column"
              rowGap={1.5}
              py="1.5em"
              px="1em"
              borderTop={`1px solid ${theme.state.hover}`}>
              <Grid
                item
                xs={12}
                display="flex"
                alignItems="center"
                justifyContent="space-between">
                <Box>
                  <Skeleton variant="text" width="5rem" height={16} />
                </Box>
                <Box display="flex" gap={2}>
                  <Skeleton variant="circular" width={20} height={20} />
                </Box>
              </Grid>
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} width="13rem" />
            </Grid>
          </Box>
        ))}
    </>
  );
};
