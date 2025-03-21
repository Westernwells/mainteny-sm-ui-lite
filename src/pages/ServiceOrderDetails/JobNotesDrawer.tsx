import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {ServiceOrderView} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import {Alert, Chip} from '@mui/material';
import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {TabItems, Tabs} from 'components/Tab';
import {
  useCreateComment,
  useDeleteComment,
  useInfiniteComments,
  useUpdateComment,
} from 'hooks/reactQuery/useComment';
import {CommentCategory, CommentType} from 'models/comment';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

type Props = {
  serviceOrder: ServiceOrderView;
  open: boolean;
  setOpen: (open: boolean) => void;
};

enum TabIndex {
  All = 0,
  Office = 1,
}

const JobNotesDrawer = ({serviceOrder, open, setOpen}: Props) => {
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(TabIndex.All);
  const user = useUserSession();

  const {
    data: allNotes = {
      pages: [],
      pageParams: [],
    },
    isLoading: allNotesLoading,
    isFetchingNextPage: allNotesIsFetchingNextPage,
    hasNextPage: allNotesHasNextPage,
    fetchNextPage: allNotesFetchNextPage,
  } = useInfiniteComments({
    refId: serviceOrder.id,
    type: CommentType.SERVICE_ORDER_COMMENT,
    category: CommentCategory.ALL,
    pageIndex: 0,
    pageSize: 10,
  });
  const {
    data: officeNotes = {
      pages: [],
      pageParams: [],
    },
    isLoading: officeNotesLoading,
    isFetchingNextPage: officeNotesIsFetchingNextPage,
    hasNextPage: officeNotesHasNextPage,
    fetchNextPage: officeNotesFetchNextPage,
  } = useInfiniteComments({
    refId: serviceOrder.id,
    type: CommentType.SERVICE_ORDER_COMMENT,
    category: CommentCategory.OFFICE,
    pageIndex: 0,
    pageSize: 10,
  });

  const totalAllNotes = allNotes.pages?.[0]?.total ?? 0;
  const totalOfficeNotes = officeNotes.pages?.[0]?.total ?? 0;

  const {mutate: createServiceOrderNote, isLoading: isCreating} =
    useCreateComment();
  const {mutate: deleteServiceOrderNote, isLoading: isDeleting} =
    useDeleteComment();
  const {mutate: updateServiceOrderNote, isLoading: isUpdating} =
    useUpdateComment();

  const tabItems: TabItems[] = [
    {
      label: 'All',
      iconPosition: 'end',
      icon: (
        <Chip
          label={totalAllNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            minWidth: 24,
            opacity: tabValue === TabIndex.All ? 1 : 0.4,
          }}
        />
      ),
    },
    {
      label: 'Office',
      iconPosition: 'end',
      icon: (
        <Chip
          label={totalOfficeNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            minWidth: 24,
            opacity: tabValue === TabIndex.Office ? 1 : 0.4,
          }}
        />
      ),
    },
  ];

  const handleCloseSideDrawer = () => {
    setOpen(false);
  };

  const createNote = async (
    variables: CreateNoteVars,
    options?:
      | MutateOptions<unknown, unknown, CreateNoteVars, unknown>
      | undefined,
  ) => {
    createServiceOrderNote(
      {
        body: {
          ...variables.body,
          refId: serviceOrder.id,
          category:
            tabValue === 0 ? CommentCategory.ALL : CommentCategory.OFFICE,
          type: CommentType.SERVICE_ORDER_COMMENT,
          serviceCompanyId: user.user?.userAccount.serviceCompany.id!,
        },
      },
      options,
    );
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?:
      | MutateOptions<unknown, unknown, DeleteNoteVars, unknown>
      | undefined,
  ) => {
    deleteServiceOrderNote({...variables}, options);
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?:
      | MutateOptions<unknown, unknown, UpdateNoteVars, unknown>
      | undefined,
  ) => {
    updateServiceOrderNote(
      {
        ...variables,
        body: {
          ...variables.body,
        },
      },
      options,
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCloseSideDrawer}
      PaperProps={{
        sx: {
          width: '30em',
          color: 'text.primary',
          background: 'white',
        },
      }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="sticky"
        top={0}
        bgcolor="white"
        pb="1rem"
        pt="1.5rem"
        px="1rem"
        zIndex={99}>
        <Typography variant="h5" letterSpacing="normal">
          {t('Notes')}
        </Typography>
        <Button
          label={t('Close')}
          buttonProps={{
            onClick: handleCloseSideDrawer,
            size: 'small',
            variant: 'text',
          }}
        />
      </Box>

      <Tabs
        hideDivider
        tabItems={tabItems}
        currentIndex={tabValue}
        onChange={(index) => setTabValue(index)}
        tabStyle={{
          '& div[role="tablist"]': {
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            gap: '0',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            '& button': {
              width: '50%',
              '& > div': {
                width: '100%',
                justifyContent: 'center',
              },
            },
          },
        }}
        containerStyles={{
          height: '80vh',
          overflowY: 'scroll',
          paddingBottom: 0,
          '& > div:first-of-type': {
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
        }}>
        <TabsBody value={tabValue} index={TabIndex.All}>
          <Notes
            notes={allNotes}
            isLoading={allNotesLoading}
            isFetchingNextPage={allNotesIsFetchingNextPage}
            isDeleting={isDeleting}
            isUpdating={isUpdating}
            isCreating={isCreating}
            hasNextPage={allNotesHasNextPage}
            fetchNextPage={allNotesFetchNextPage}
            createNote={createNote}
            updateNote={updateNote}
            deleteNote={deleteNote}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={TabIndex.Office}>
          <>
            <Alert severity="info">
              <Typography variant="body2">
                {t('The notes below will be visible to office only.')}
              </Typography>
            </Alert>
            <Notes
              notes={officeNotes}
              isLoading={officeNotesLoading}
              isFetchingNextPage={officeNotesIsFetchingNextPage}
              isDeleting={isDeleting}
              isUpdating={isUpdating}
              isCreating={isCreating}
              hasNextPage={officeNotesHasNextPage}
              fetchNextPage={officeNotesFetchNextPage}
              createNote={createNote}
              updateNote={updateNote}
              deleteNote={deleteNote}
            />
          </>
        </TabsBody>
      </Tabs>
    </Drawer>
  );
};

export default JobNotesDrawer;
