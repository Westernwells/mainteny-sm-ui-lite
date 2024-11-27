import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import {theme} from 'theme';
import {Typography} from '@mui/material';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {NoteAltOutlined} from '@mui/icons-material';
import React from 'react';

type Props = {
  hasNotes?: boolean;
  timeStamp?: string;
  noteContent?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const NoteIcon = ({
  hasNotes = false,
  timeStamp,
  noteContent,
  onMouseEnter,
  onMouseLeave,
}: Props) =>
  hasNotes ? (
    <Tooltip
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
          gap={theme.spacing(0.5)}>
          <Typography
            sx={{
              color: '#BDBDBD',
              lineHeight: '14px',
              fontSize: '10px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}>
            {timeStamp}
          </Typography>
          <Typography
            sx={{
              lineHeight: '14px',
              fontSize: '10px',
            }}>
            {noteContent}
          </Typography>
        </Box>
      }
      arrow
      placement="top">
      <NoteAlt fontSize="small" />
    </Tooltip>
  ) : (
    <NoteAltOutlined fontSize="small" />
  );

export default NoteIcon;
