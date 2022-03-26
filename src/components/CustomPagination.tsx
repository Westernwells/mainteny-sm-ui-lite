import React, {useEffect, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import {SelectChangeEvent} from '@mui/material/Select';
import {makePage} from 'utils/paging-utils';
import {CustomSelect} from './CustomSelect';

interface Props {
  pageSize?: number;
  handlePageSizeChange?: (pageSize: number) => void;
  handlePageChange?: (newPage: number) => void;
  pageCount?: number;
  totalRows?: number;
}

export const CustomPagination = ({
  handlePageSizeChange,
  pageSize,
  handlePageChange,
  pageCount,
  totalRows,
}: Props) => {
  const theme = useTheme();
  const [page, setPage] = useState(makePage(0, pageSize || 10));
  const [goToPage, setGotoPage] = useState('');
  const [currentPageDetails, setCurrentPageDetails] = useState<string | null>(
    null,
  );

  const onPageSizeChange = (event: SelectChangeEvent) => {
    if (handlePageSizeChange) {
      handlePageSizeChange(Number(event.target.value));
    }

    setPage({...page, pageSize: Number(event.target.value)});
  };

  useEffect(() => {
    const start = page.pageIndex * page.pageSize;
    let end = (page.pageIndex + 1) * page.pageSize;
    let totalNumOfRows = totalRows;
    const currentTotal = (page.pageIndex + 1) * page.pageSize;
    if (totalRows && totalRows <= currentTotal) {
      totalNumOfRows = totalRows;
      end = totalNumOfRows;
    }
    setCurrentPageDetails(`${start + 1} to ${end} of ${totalNumOfRows}`);
  }, [page, totalRows]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        py: '1em',
        px: '0.8em',
      }}>
      <Typography
        variant="subtitle2"
        sx={{color: theme.palette.text.secondary, mt: '0.3em'}}>
        {currentPageDetails}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
        <Box>
          <CustomSelect
            handleChange={onPageSizeChange}
            options={[
              {label: '10', value: 10},
              {label: '25', value: 25},
              {label: '50', value: 50},
            ]}
            defaultOption={page.pageSize}
            label="rows per page"
            size="small"
          />
        </Box>
        <Pagination
          count={pageCount || 10}
          defaultPage={page.pageIndex + 1}
          shape="rounded"
          onChange={(event: React.ChangeEvent<unknown>, newPage: number) => {
            event.preventDefault();
            if (handlePageChange) {
              handlePageChange(newPage);
            }
            setPage({...page, pageIndex: newPage - 1});
          }}
          sx={{
            mt: '0.3em',
            mx: '1em',
            '& .MuiPaginationItem-previousNext': {
              border: '1px solid #000000',
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              background: theme.palette.primary.main,
              color: '#fff',
            },
          }}
        />

        <Box>
          <TextField
            id="outlined-basic"
            label="Got to page"
            variant="outlined"
            size="small"
            value={goToPage}
            sx={{width: '5rem', textAlign: 'center'}}
            onChange={(event) => {
              let pageNumber = 1;
              if (pageCount && Number(event.target.value) <= pageCount) {
                pageNumber = Number(event.target.value) - 1;
                if (pageNumber > 0) {
                  setPage({...page, pageIndex: pageNumber});
                } else {
                  setPage({...page, pageIndex: 0});
                }
                setGotoPage(event.target.value);
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
