export interface Note {
  id: string;
  content: string;
  meta: {
    createdAt: string;
  };
}

export type NoteMutationArgs = {
  body: {
    content: string;
    subject: string;
  };
  noteId: string;
};

export type DeleteNoteVars = Pick<NoteMutationArgs, 'noteId'>;
export type UpdateNoteVars = NoteMutationArgs;
export type CreateNoteVars = Pick<NoteMutationArgs, 'body'>;
