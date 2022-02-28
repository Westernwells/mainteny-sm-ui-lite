import {ReactChild, ReactNode} from 'react';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import {Elevator} from 'models/elevator';
import Typography from '@mui/material/Typography';

export interface Props {
  renderIcon?: () => ReactChild;
  renderHeaderText?: () => ReactChild;
  addShadowToCard?: boolean;
  cardHeight?: number | string;
  contentHeight?: number | string;
  children: ReactNode;
  disableScroll?: boolean;
  containerStyles?: {[key: string | number]: string | number};
  headerStyles?: {[key: string | number]: string | number};
  showMoreBtn?: boolean;
  minHeight?: number | string;
  onMoreClick?: () => void;
}

export const ScrollableCard = ({
  renderIcon,
  renderHeaderText,
  addShadowToCard,
  cardHeight = '100%',
  contentHeight = '90%',
  children,
  disableScroll,
  containerStyles,
  headerStyles,
  showMoreBtn,
  minHeight,
  onMoreClick,
}: Props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: '#fff',
        borderRadius: '8px',
        ...(minHeight ? {minHeight} : {height: cardHeight}),
        boxShadow: addShadowToCard
          ? '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)'
          : null,
        pt: 2,
        pb: 3,
        px: 2,
        ...containerStyles,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          ...headerStyles,
        }}
      >
        {renderHeaderText ? renderHeaderText() : null}
        {renderIcon ? renderIcon() : null}
      </Box>

      <Box
        pt={2}
        height={contentHeight}
        sx={{overflowY: disableScroll ? 'visible' : 'scroll'}}
      >
        {children}
      </Box>

      {showMoreBtn ? (
        <Typography
          variant="h6"
          textAlign="center"
          color={theme.palette.info.main}
          sx={{cursor: 'pointer'}}
          onClick={onMoreClick || (() => {})}
        >
          More...
        </Typography>
      ) : null}
    </Box>
  );
};
