import React, {
  Dispatch,
  Fragment,
  MutableRefObject,
  SetStateAction,
} from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {NoteCard} from 'components/NoteCard';
import LinearProgress from '@mui/material/LinearProgress';
import {Theme} from '@mui/material/styles';
import {FormikProps} from 'formik';
import {Comment} from 'models/comment';
import {Note} from 'models/note';

interface GroupedNotes {
  [key: string]: Note[];
}

interface Props {
  groupedNotes: GroupedNotes;
  theme: Theme;
  formik: FormikProps<{note: string}>;
  isDeleting: boolean;
  isUpdating: boolean;
  notesRef: (node?: Element | null | undefined) => void;
  notesTopRef: MutableRefObject<HTMLElement | undefined>;
  activeNote: {id: string; action: 'edit' | 'delete' | undefined};
  setActiveNote: Dispatch<
    SetStateAction<{
      id: string;
      action: 'edit' | 'delete' | undefined;
    }>
  >;
}

const NoteList: React.FC<Props> = ({
  groupedNotes,
  theme,
  formik,
  isDeleting,
  isUpdating,
  notesRef,
  notesTopRef,
  activeNote,
  setActiveNote,
}) => (
  <>
    {Object.entries(groupedNotes).map(([date, notes], index) => (
      <Fragment key={date}>
        <Box
          display="flex"
          alignItems="center"
          py="10px"
          px="1.5rem"
          bgcolor={theme.palette.grey[50]}
          {...(index === 0 && {ref: notesTopRef})}>
          <Typography variant="overline" textTransform="uppercase">
            {date}
          </Typography>
        </Box>
        <Box sx={{width: '100%'}}>
          {notes.map((note) => (
            <Fragment key={note.id}>
              <Box ref={notesRef}>
                <NoteCard
                  note={note as unknown as Comment}
                  onDelete={() => {
                    setActiveNote({id: note.id, action: 'delete'});
                  }}
                  onEdit={() => {
                    setActiveNote({id: note.id, action: 'edit'});
                    if (activeNote.id === note.id) return;
                    formik.setValues({note: note.content});
                  }}
                  isEditing={
                    activeNote.id === note.id && activeNote.action === 'edit'
                  }
                  styles={{
                    backgroundColor:
                      activeNote.id === note.id
                        ? theme.palette.action.hover
                        : 'inherit',
                  }}
                />
                {activeNote.id === note.id && (isDeleting || isUpdating) ? (
                  <Box height="4px">
                    <LinearProgress />
                  </Box>
                ) : null}
                <Divider />
              </Box>
            </Fragment>
          ))}
        </Box>
      </Fragment>
    ))}
  </>
);

export default NoteList;
