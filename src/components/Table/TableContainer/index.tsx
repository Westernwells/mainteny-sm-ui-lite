import React, {PropsWithChildren, RefObject, useEffect} from 'react';
import {Box} from '@mui/system';
import {Table} from '@mui/material';
import {useScrollHorizontalPosition} from 'hooks/useScrollPosition';
import NoMatchTable from 'components/Table/NoMatchTable';

type Props = {
  showNoMatchWarning?: boolean;
  setShowLeftShadow?: (value: boolean) => void;
  setShowRightShadow?: (value: boolean) => void;
  containerRef?: RefObject<HTMLDivElement>;
};

const TableContainer = ({
  children,
  showNoMatchWarning = false,
  setShowRightShadow,
  setShowLeftShadow,
  containerRef,
}: PropsWithChildren<Props>) => {
  // const containerRef = useRef<HTMLDivElement>(null);
  const scroller = useScrollHorizontalPosition(containerRef?.current ?? null);

  useEffect(() => {
    if (containerRef?.current) {
      setShowRightShadow?.(!scroller.isAtStart);
    }
  }, [scroller.isAtStart, containerRef?.current]);

  useEffect(() => {
    if (containerRef?.current) {
      setShowLeftShadow?.(!scroller.isAtEnd);
    }
  }, [scroller.isAtEnd, containerRef?.current]);

  return (
    <Box
      ref={containerRef}
      sx={{
        overflow: showNoMatchWarning ? undefined : 'auto',
        height: 'fill-available',
      }}
      date-testid="table-scroll-div-container">
      <Table stickyHeader date-testid="table-container">
        {children}
      </Table>

      {showNoMatchWarning && (
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '1px solid  #222B451F',
          }}>
          <NoMatchTable />
        </Box>
      )}
    </Box>
  );
};

export default TableContainer;
