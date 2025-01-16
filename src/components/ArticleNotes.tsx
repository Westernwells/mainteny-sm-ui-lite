import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {
  useCreateArticleComment,
  useDeleteArticleComment,
  useInfiniteArticleComments,
  useUpdateArticleComment,
} from 'hooks/reactQuery/useArticle';

interface Props {
  articleId: string;
}

export const ArticleNotes = ({articleId}: Props) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteArticleComments(articleId, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createArticleComment, isLoading: isCreating} =
    useCreateArticleComment();
  const {mutate: deleteArticleComment, isLoading: isDeleting} =
    useDeleteArticleComment();
  const {mutate: updateArticleComment, isLoading: isUpdating} =
    useUpdateArticleComment();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    createArticleComment({...variables, id: articleId}, {...options});
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    deleteArticleComment({...variables, id: articleId}, {...options});
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    updateArticleComment({...variables, id: articleId}, {...options});
  };

  return (
    <Notes
      notes={notes}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isDeleting={isDeleting}
      isUpdating={isUpdating}
      isCreating={isCreating}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      createNote={createNote}
      updateNote={updateNote}
      deleteNote={deleteNote}
    />
  );
};
