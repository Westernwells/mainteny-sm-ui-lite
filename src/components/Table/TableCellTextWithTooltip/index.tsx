import React from 'react';
import {Box, SxProps, Tooltip} from '@mui/material';
import {ReactComponent as CalendarVectorIcon} from 'assets/icons/CalendarVector.svg';
import TableCellText from '../TableCellText';

type TableCellTextWithTooltipProps = {
  mainContent: string;
  showSecondaryContent: boolean;
  secondaryContent?: string;
  secondaryIcon?: React.ReactNode;
  containerStyles?: SxProps;
};

const TableCellTextWithTooltip = ({
  mainContent,
  showSecondaryContent,
  secondaryContent,
  secondaryIcon,
  containerStyles,
}: TableCellTextWithTooltipProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      ...containerStyles,
    }}>
    <TableCellText>{mainContent}</TableCellText>

    {showSecondaryContent && (
      <Tooltip
        title={secondaryContent || ''}
        arrow
        placement="top"
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -5],
              },
            },
          ],
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
          {secondaryIcon || (
            <CalendarVectorIcon
              fontSize="large"
              color="action"
              style={{cursor: 'pointer', marginLeft: '0.4em'}}
            />
          )}
        </Box>
      </Tooltip>
    )}
  </Box>
);

export default TableCellTextWithTooltip;
