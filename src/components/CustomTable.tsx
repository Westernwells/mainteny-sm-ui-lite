import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface Props {
  columns: string[];
  rows: {title: string; key: string; cells: {value: any}[]}[];
}

export const CustomTable = ({columns, rows}: Props) => (
  <TableContainer component={Paper}>
    <Table sx={{minWidth: 650}} aria-label="simple table">
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell>{col}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.key}
            sx={{'&:last-child td, &:last-child th': {border: 0}}}>
            <TableCell align="right">sskksk</TableCell>
            <TableCell align="right">sskksk</TableCell>
            <TableCell align="right">sskksk</TableCell>
            <TableCell align="right">sskksk</TableCell>
            <TableCell align="right">sskksk</TableCell>
            {/* {row.title ? <TableCell>{row.title}</TableCell> : null}
            {row.cells.map((cell, index) => (
              <TableCell
              align="right"
                {...(index === 0 ? {component: 'th', scope: 'row'} : {})}>
                {cell.value}
              </TableCell>
            ))} */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
