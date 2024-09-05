import {Box, Grid, Typography} from '@mui/material';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {ServiceCompanyItem} from 'models/service-company';
import {useCallback, useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {createEmptyResource, makePage} from 'utils/paging';
import * as Yup from 'yup';
import {Dialog} from 'components/Dialog';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {Confirm} from 'components/Confirm';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {
  TextBlockCategory,
  TextBlockFormModel,
  TextBlockOrderField,
  TextBlockRow,
  TextBlockView,
} from 'models/text-block';
import {
  useCreateTextBlock,
  useUpdateTextBlock,
  useDeleteTextBlock,
  useTextBlocks,
} from 'hooks/reactQuery/useTextBlock';
import {theme} from 'theme';
import {useSearchValues} from 'hooks/useSearchValues';
import {
  mapJsonToTextBlockView,
  convertCategoryToMacro,
  convertCategoryToText,
} from 'utils/text-block';
import DOMPurify from 'dompurify';
import {TextBlockForm} from './TextBlockForm';
import {columns, makeRows} from './TextBlockDataGridProps';
import {Order, OrderByParams} from '../../../models/pagination';

type Props = {
  company: ServiceCompanyItem;
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  text: Yup.string().required('Text is required'),
});

const pageSize = 25;

const TextBlocks = ({company}: Props) => {
  const {t} = useTranslation();
  const serviceCompanyId = company.id;
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [activeTextBlock, setActiveTextBlock] = useState<
    TextBlockView | undefined
  >(undefined);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [typeAction, setTypeAction] = useState<'edit' | undefined>(undefined);
  const [query, setQuery] = useState<string>('');
  const textInput = useRef<HTMLInputElement>(null);
  const {values} = useSearchValues<OrderByParams<TextBlockOrderField>>();
  const {sortOrder, orderByField} = values;

  const formik = useFormik<TextBlockFormModel>({
    initialValues: {
      name: '',
      category: TextBlockCategory.QUOTATION,
      text: '',
    },
    onSubmit: (_, {resetForm}) => {
      resetForm();
    },
    validationSchema,
  });

  const {mutate: createTextBlock} = useCreateTextBlock(
    'Text Block created successfully',
  );

  const {mutateAsync: updateTextBlock} = useUpdateTextBlock(
    'Text Block updated successfully',
  );

  const {mutateAsync: deleteTextBlock} = useDeleteTextBlock(
    'Text Block deleted successfully',
  );

  const {
    data: textBlocks = createEmptyResource<TextBlockView>(pageSize),
    isLoading,
    isFetching,
    isIdle,
  } = useTextBlocks(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query,
      categories: [],
      order: sortOrder || Order.DESC,
      orderByField: orderByField || TextBlockOrderField.CREATED_AT,
    },
    {keepPreviousData: true},
  );

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
  }, [query]);

  useEffect(() => {
    setPageCount(Math.ceil(textBlocks.total / page.pageSize));
  }, [page.pageSize]);

  useEffect(() => {
    if (!isIdle && !isLoading) {
      setRows(makeRows(textBlocks.data));
    }
  }, [textBlocks]);

  const getEditableTextBlocks = useCallback(
    (item: TextBlockRow) => {
      const textBlockItem = mapJsonToTextBlockView(item);

      formik.setValues({
        name: textBlockItem.name || '',
        text: textBlockItem?.text || '',
        category: textBlockItem.category || '',
      });

      setActiveTextBlock(mapJsonToTextBlockView(item));
      setOpenDialog(true);
      setTypeAction('edit');
    },
    [formik],
  );

  const getPreviewTextBlocks = (item: TextBlockRow) => {
    const textBlockItem = mapJsonToTextBlockView(item);

    setActiveTextBlock(textBlockItem);
    setOpenPreviewDialog(true);
  };

  const onCreateContact = useCallback(() => {
    formik.setValues({
      name: '',
      text: '',
      category: TextBlockCategory.QUOTATION,
    });

    setActiveTextBlock(undefined);
    setOpenDialog(true);
    formik.resetForm();
  }, [formik]);

  const getDeletableTextBlocks = useCallback((item: TextBlockRow) => {
    const textBlockItem = mapJsonToTextBlockView(item);

    setActiveTextBlock(textBlockItem);
    setOpenCancelConfirm(true);
  }, []);

  const updateCurrentTextBlock = async () => {
    await updateTextBlock({
      textBlockId: activeTextBlock?.id!,
      textBlock: {
        name: formik.values.name,
        category: convertCategoryToMacro(formik.values.category),
        text: formik.values.text,
      },
    });

    setOpenDialog(false);
    setTypeAction(undefined);
  };

  const saveNewTextBlock = async () => {
    setOpenDialog(false);
    createTextBlock({
      serviceCompanyId,
      category: convertCategoryToMacro(formik.values.category),
      name: formik.values.name,
      text: formik.values.text,
    });
    setTypeAction(undefined);
  };

  const onDelete = async () => {
    await deleteTextBlock({
      textBlockId: activeTextBlock?.id || '',
    });

    setOpenCancelConfirm(false);
  };

  const handleEditOnSave = () => {
    if (typeAction === 'edit') {
      updateCurrentTextBlock();
    } else {
      saveNewTextBlock();
    }
  };

  const columnsMemo = useCallback(
    () =>
      columns(
        getEditableTextBlocks,
        getDeletableTextBlocks,
        getPreviewTextBlocks,
      ),
    [getEditableTextBlocks, getDeletableTextBlocks, getPreviewTextBlocks],
  );

  const infoItems = [
    {label: t('Name'), value: activeTextBlock?.name || ''},
    {
      label: t('Category'),
      value: activeTextBlock?.category
        ? convertCategoryToText(activeTextBlock?.category)
        : '',
    },
    {label: t('Text'), value: activeTextBlock?.text || ''},
  ];

  return (
    <Grid
      container
      direction="column"
      gap={3}
      sx={{background: theme.palette.background.paper, padding: '1.5em'}}>
      <PageListingLayout
        renderWidget={
          <Widget
            searchPlaceholder="Search"
            getSearchValue={setQuery}
            refInput={textInput}
            showActionBtn
            btnLabel="New Block"
            btnOnClick={onCreateContact}
            btnIcon={<ListAltIcon />}
          />
        }>
        <DataGridLayout
          rows={rows}
          columns={columnsMemo()}
          fullHeight={false}
          isCellClickable
          height={400}
          noRowsEmptySection={
            <EmptySection
              illustration="articles"
              size="large"
              containerStyle={{my: '7rem'}}
              label="No blocks yet"
              subLabel="Create and customize your own block to be used later"
              showActionBtn
              btnLabel="New Block"
              btnAction={onCreateContact}
            />
          }
          isWidget
          containerStyle={{
            borderBottom: 'none',
          }}
          pageIndex={page.pageIndex + 1}
          pageSize={page.pageSize}
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={textBlocks.total}
          loading={isFetching}
          scrollToTop={query}
          onCellClick={(params) => {
            if (params.field !== 'actions') {
              getPreviewTextBlocks(params.row);
            }
          }}
        />
      </PageListingLayout>

      <Dialog
        title={typeAction === 'edit' ? 'Edit text block' : 'New text block'}
        saveButtonText={typeAction === 'edit' ? 'Save' : 'Create Block'}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => {
          setOpenDialog(false);
          setActiveTextBlock(undefined);
          setTypeAction(undefined);
          formik.resetForm();
        }}
        onSave={handleEditOnSave}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <TextBlockForm formik={formik} />
      </Dialog>

      <Dialog
        title={activeTextBlock?.name || ''}
        saveButtonText="Edit Block"
        onCancel={() => {
          setOpenPreviewDialog(false);
          setActiveTextBlock(undefined);
          setTypeAction(undefined);
        }}
        onSave={() => {
          setOpenPreviewDialog(false);
          formik.setValues({
            name: activeTextBlock?.name || '',
            text: activeTextBlock?.text || '',
            category: convertCategoryToMacro(activeTextBlock?.category!) || '',
          });
          setTypeAction('edit');
          setOpenDialog(true);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: openPreviewDialog || false,
        }}>
        <Box>
          {infoItems?.map((item, index) => (
            <Box key={index} sx={{mb: '1.5em'}}>
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}>
                {item.label.toUpperCase()}
              </Typography>
              {item.label === t('Text') ? (
                <Box
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.value),
                  }}
                  sx={{
                    margin: '0em',
                    padding: '0em',
                    '& p': {
                      marginBottom: '0em',
                      lineHeight: '1.1em',
                    },
                  }}
                />
              ) : item.label === t('Category') ? (
                <Typography
                  color={theme.palette.text.primary}
                  sx={{mt: '0.3em'}}>
                  {t(item.value)}
                </Typography>
              ) : (
                <Typography
                  color={theme.palette.text.primary}
                  sx={{mt: '0.3em'}}>
                  {item.value}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Dialog>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => onDelete()}
        onClose={() => setOpenCancelConfirm(false)}
        title="Delete"
        content={t(
          'Do you want to delete "{{textBlockName}}" from this list?',
          {
            textBlockName: `${activeTextBlock?.name}`,
          },
        )}
      />
    </Grid>
  );
};

export default TextBlocks;
