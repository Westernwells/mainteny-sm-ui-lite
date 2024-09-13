import {Box} from '@mui/material';
import {GridCellParams, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {useTextBlocks} from 'hooks/reactQuery/useTextBlock';
import {useSearchValues} from 'hooks/useSearchValues';
import {
  TextBlockCategory,
  TextBlockFormModel,
  TextBlockOrderField,
  TextBlockRow,
  TextBlockView,
} from 'models/text-block';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {createEmptyResource, makePage} from 'utils/paging';
import {mapJsonToTextBlockView} from 'utils/text-block';
import {Widget} from 'components/Widget';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {columns, makeRows} from './TextBlockSelectGridProps';
import {Order, OrderByParams} from '../../models/pagination';

type Props = {
  textBlockCategory: TextBlockCategory;
  setOpenTextBlockDialog: Dispatch<SetStateAction<boolean>>;
  setActiveSubDialog: Dispatch<
    SetStateAction<'edit' | 'preview' | 'delete' | 'create' | undefined>
  >;
  setActiveTextBlock: Dispatch<SetStateAction<TextBlockView | undefined>>;
  handleCellClick: (rowParams: GridCellParams<any, any, any>) => void;
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  text: Yup.string().required('Text is required'),
});

const pageSize = 500;

const TextBlockSelect = ({
  textBlockCategory,
  setOpenTextBlockDialog,
  setActiveSubDialog,
  setActiveTextBlock,
  handleCellClick,
}: Props) => {
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
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
      categories: [textBlockCategory],
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

  const onCreateContact = useCallback(() => {
    formik.setValues({
      name: '',
      text: '',
      category: TextBlockCategory.QUOTATION,
    });
    setActiveTextBlock(undefined);
    setOpenTextBlockDialog(false);
    setActiveSubDialog('create');
  }, []);

  const getEditableTextBlocks = useCallback((item: TextBlockRow) => {
    const textBlockItem = mapJsonToTextBlockView(item);
    setActiveTextBlock(textBlockItem);
    setOpenTextBlockDialog(false);
    setActiveSubDialog('edit');
  }, []);

  const getPreviewTextBlocks = (item: TextBlockRow) => {
    const textBlockItem = mapJsonToTextBlockView(item);
    setActiveTextBlock(textBlockItem);
    setOpenTextBlockDialog(false);
    setActiveSubDialog('preview');
  };

  const getDeletableTextBlocks = useCallback((item: TextBlockRow) => {
    const textBlockItem = mapJsonToTextBlockView(item);
    setActiveTextBlock(textBlockItem);
    setOpenTextBlockDialog(false);
    setActiveSubDialog('delete');
  }, []);

  const columnsMemo = useCallback(
    () =>
      columns(
        getEditableTextBlocks,
        getDeletableTextBlocks,
        getPreviewTextBlocks,
      ),
    [getEditableTextBlocks, getDeletableTextBlocks, getPreviewTextBlocks],
  );

  return (
    <Box>
      <Widget
        searchPlaceholder="Find your text block"
        getSearchValue={setQuery}
        refInput={textInput}
        showActionBtn
        btnLabel="New Block"
        btnOnClick={onCreateContact}
        searchInputStyles={{width: '100%'}}
        searchInputWrapperStyles={{width: '60%'}}
      />

      <DataGridLayout
        rows={rows}
        columns={columnsMemo()}
        fullHeight={false}
        isCellClickable
        height={380}
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
        onCellClick={(params: GridCellParams<any, any, any>) =>
          handleCellClick(params)
        }
      />
    </Box>
  );
};

export default TextBlockSelect;
