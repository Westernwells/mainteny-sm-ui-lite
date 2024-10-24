import {PropsWithChildren, useEffect, useRef} from 'react';
import {Box} from '@mui/system';
import {Table} from '@mui/material';
import {useScrollHorizontalPosition} from 'hooks/useScrollPosition';

type Props = {
  setShowLeftShadow?: (value: boolean) => void;
  setShowRightShadow?: (value: boolean) => void;
};

const TableContainer = ({
  children,
  setShowRightShadow,
  setShowLeftShadow,
}: PropsWithChildren<Props>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scroller = useScrollHorizontalPosition(containerRef.current);

  useEffect(() => {
    setShowRightShadow?.(!scroller.isAtStart);
  }, [scroller.isAtStart]);

  useEffect(() => {
    setShowLeftShadow?.(!scroller.isAtEnd);
  }, [scroller.isAtEnd]);

  return (
    <Box
      ref={containerRef}
      sx={{
        overflow: 'auto',
        height: 'fill-available',
      }}
      date-testid="table-scroll-div-container">
      <Table stickyHeader date-testid="table-container">
        {children}
      </Table>
    </Box>
  );
};

export default TableContainer;
