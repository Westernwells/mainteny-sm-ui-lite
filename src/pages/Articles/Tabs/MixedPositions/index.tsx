import {Box, CircularProgress, Grid2 as Grid, TextField} from '@mui/material';
import {t} from 'i18next';
import React, {
  ChangeEvent,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AddButton from 'components/AddButton';
import PageHeaderContainer from 'components/PageHeaderContainer';
import {useQueryState} from 'hooks/useQueryState';
import SearchInput from 'components/SearchInput/index';
import Pagination from 'components/Pagination';
import TableRow from 'components/Table/TableRow';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import TableCell from 'components/Table/TableCell';
import {
  ArticleOrderField,
  ArticleSubAssociationView,
  ArticleType,
  ArticleView,
  MixedPositionFormValues,
  MixedPositionRow,
  QueryArticleParams,
  SubPositionFormValues,
  SubPositionRow,
} from 'models/article';
import {
  fetchArticleSubAssociations,
  useArticles,
  useDeleteArticle,
  useDeleteArticleSubAssociation,
  useUpdateArticle,
  useUpdateArticleSubAssociation,
} from 'hooks/reactQuery/useArticle';
import {createEmptyResource, makePage} from 'utils/paging';
import {Order} from 'models/pagination';
import {
  aggregateMixedPositionRow,
  calculateMargin,
  transformToSubPositionRow,
} from 'utils/article-utils';
import TableBody from 'components/Table/TableBody';
import {useForm, useWatch} from 'react-hook-form';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {debounce} from 'lodash';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Dialog} from 'components/Dialog';
import RichTextEditor from 'components/RichTextEditor';
import {Button} from 'components/Button';
import {
  useCompanyById,
  useCompanyNextNumber,
} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyNumberType} from 'models/service-company';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import {useTheme} from '@mui/material/styles';
import {State} from 'models/misc';
import {useSnackbar} from 'hooks/useSnackbar';
import {useCurrentCurrency} from 'utils/currency';
import {removeHtmlTags} from 'utils/rich-field-string';
import MixedPositionPdf from 'components/pdf-templates/MixedPositionPdf';
import {pdf} from '@react-pdf/renderer';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {companyLanguageContextMap} from 'utils/language';
import {EmptySection} from 'components/EmptySection';
import {ReactComponent as PackageIcon} from 'assets/icons/PackageIcon.svg';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import PositionPreview from './PositionPreview';
import SubPositionRowComponent from './SubPositionRowComponent';
import MixedPositionRowComponent from './MixedPositionRowComponent';

const pageSize = 25;

export interface DeleteEventState {
  userTypedName: string;
  isOpen?: boolean;
  event?: {
    type: 'mixed' | 'sub';
    id: string;
    name: string;
    articleId?: string;
    externalId: string;
  };
  index?: number;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const getIconByType = (type: ArticleType) => {
  switch (type) {
    case ArticleType.LABOR:
      return <TimerOutlinedIcon fontSize="medium" />;
    case ArticleType.MATERIAL:
      return <SettingsOutlinedIcon fontSize="medium" />;
    case ArticleType.MIX:
      return <FolderOpenOutlinedIcon fontSize="medium" />;
    case ArticleType.PACKAGE:
      return <PackageIcon fontSize="1.3rem" color="#828DA3" />;
    default:
      return <DashboardOutlinedIcon fontSize="medium" />;
  }
};

const MixedPositions = () => {
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const theme = useTheme();
  const [createdMixId, setCreatedMixId] = useState<string | null>(null);

  const {fontStyles, primaryColor, secondaryColor} =
    useContext(PdfStylesContext);

  const {enqueueSnackbar, showError} = useSnackbar();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {mutateAsync: updateArticle, isLoading: isUpdatingArticle} =
    useUpdateArticle('');
  const {mutateAsync: deleteArticle, isLoading: isDeleting} = useDeleteArticle(
    t('Article deleted successfully'),
  );

  const {
    mutateAsync: updateArticleSubPosition,
    isLoading: isUpdatingSubPosition,
  } = useUpdateArticleSubAssociation('');
  const {
    mutateAsync: deleteArticleSubPosition,
    isLoading: isDeletingSubPosition,
  } = useDeleteArticleSubAssociation('');

  const {refetch: refetchCompanyNumber} = useCompanyNextNumber(
    {type: ServiceCompanyNumberType.ARTICLE},
    serviceCompanyId,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });

  const [filePathToDownload, setFilePathToDownload] = useState('');

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [search, setSearch] = useQueryState('mixedPositions');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [localRows, setLocalRows] = useState<MixedPositionRow[]>([]);
  const [subRows, setSubRows] = useState<Record<string, SubPositionRow[]>>({});
  const [deleteEventState, setDeleteEventState] = useState<DeleteEventState>({
    userTypedName: '',
    isOpen: false,
  });
  const [editState, setEditState] = useState<{
    id: string | null;
    field: keyof MixedPositionRow | null;
    values: Partial<MixedPositionFormValues>;
  }>({id: null, field: null, values: {}});
  const [subPositionEditState, setSubPositionEditState] = useState<{
    id: string | null;
    field: string | null;
    values: Partial<SubPositionFormValues>;
  }>({id: null, field: null, values: {}});

  const [inputRefs, setInputRefs] = useState<
    Record<string, React.RefObject<HTMLInputElement>>
  >({});

  const {control: descriptionControl, setValue: setDescription} = useForm();
  const {control: mixedPositionControl, setValue: setMixedPositionValue} =
    useForm<Record<string, Partial<MixedPositionFormValues>>>({
      defaultValues: {},
    });

  const watchDescription = useWatch({
    control: descriptionControl,
    name: 'description',
  });

  const filters: QueryArticleParams = {
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    order: Order.DESC,
    orderByField: ArticleOrderField.CREATED_DATE,
    type: [ArticleType.MIX],
    query: search,
  };

  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isLoading,
    isFetched,
    refetch: refetchArticles,
  } = useArticles(filters, {keepPreviousData: true}, true);

  const resetAndUpdateSubRows = async (parentId: string) => {
    setSubPositionEditState({id: null, field: null, values: {}});
    const subAssociations = await fetchArticleSubAssociations(parentId);
    const transformedSubPositions = subAssociations.map(
      transformToSubPositionRow,
    );
    setSubRows((prev) => ({
      ...prev,
      [parentId]: transformedSubPositions,
    }));
  };

  const handleDelete = async () => {
    const {event} = deleteEventState;

    if (event?.type === 'sub') {
      const parentId = Object.keys(subRows).find((key) =>
        subRows[key]?.some((sub) => {
          if (sub.id === event?.id) {
            return true;
          }
          return false;
        }),
      );

      try {
        await deleteArticleSubPosition({
          articleId: parentId!,
          associationId: event.id,
        });

        resetAndUpdateSubRows(parentId!);
      } catch (error) {
        showError(error);
      } finally {
        refetchArticles();
      }
    } else if (event?.type === 'mixed') {
      try {
        await deleteArticle({articleId: event.id});
      } catch (error) {
        showError(error);
      } finally {
        refetchArticles();
      }
    }

    setDeleteEventState({
      userTypedName: '',
      isOpen: false,
    });
  };

  const handleInputChange = debounce((value) => {
    setDeleteEventState((prevData) => ({
      ...prevData,
      userTypedName: value,
    }));
  }, 50);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(event.target.value);
  };

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const rows = useMemo(() => [...localRows], [localRows]);

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (!!search && articleResource.total === 0) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (!search && articleResource.total === 0) {
      return {emptyTable: true, noMatchingData: true};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [isFetched, articleResource]);

  const handleEditStart = (
    row: MixedPositionRow,
    field: keyof MixedPositionRow,
  ) => {
    const {id, externalId, name} = row.data;
    const unit = row.unit || '';

    setInputRefs((prev) => ({
      ...prev,
      [id]: React.createRef(),
    }));

    setEditState({
      id,
      field,
      values: {
        ...row,
        [field]: row[field],
      },
    });

    setMixedPositionValue(id, {
      externalId: externalId || '',
      name: name || '',
      unit,
    });
  };

  const handleSubPositionEditStart = (
    subPosition: SubPositionRow,
    field: string,
  ) => {
    const purchaseNetAmount =
      subPosition.article.unitPurchaseAmount?.netAmount ?? 0;
    const sellingNetAmount =
      subPosition.article.unitSellingAmount?.netAmount ?? 0;

    const getDisplayValue = () => {
      switch (field) {
        case 'margin':
          return calculateMargin(sellingNetAmount, purchaseNetAmount);
        case 'vatId':
          return subPosition.article?.unitSellingAmount || '';
        case 'quantity':
          return subPosition[field];
        case 'unitPurchaseAmount':
        case 'unitSellingAmount':
          return {
            ...subPosition.article[field],
            netAmount:
              (subPosition.article[field]?.netAmount ?? 0) /
              10 ** currentCurrency.fractionDigits,
          };
        default:
          return subPosition.article[field as keyof ArticleView];
      }
    };

    const displayValue = getDisplayValue();

    if (field === 'margin') {
      const marginNumber = Number(displayValue);
      const updatedSellingNetAmount =
        ((marginNumber / 100) * purchaseNetAmount + purchaseNetAmount) /
        10 ** currentCurrency.fractionDigits;
      setSubPositionEditState({
        id: subPosition.id,
        field,
        values: {
          ...subPosition,
          unitSellingAmount: {
            ...subPosition.article.unitSellingAmount,
            netAmount: updatedSellingNetAmount,
          },
          [field]: marginNumber,
        },
      });
    } else {
      setSubPositionEditState({
        id: subPosition.id,
        field,
        values: {
          ...subPosition,
          [field]: displayValue,
        },
      });
    }

    setInputRefs((prev) => ({
      ...prev,
      [subPosition.id.toString()]: React.createRef(),
    }));
  };

  const handleNewMixedPosition = async () => {
    setSearch('');
    const refetchData = await refetchCompanyNumber();
    const nextCompanyExternalId = refetchData.data?.value || '';

    const newId = `mixed-${Date.now()}`;

    const uncreatedMixedPosition = localRows?.filter((localRow) =>
      localRow.id.includes('mixed'),
    );

    const hasSubId = Object.values(subRows).some((subPositionArray) =>
      subPositionArray?.some((row) => row.id.includes('sub')),
    );

    if (hasSubId) {
      enqueueSnackbar(
        'Complete creation of sub-position before adding a new mixed position.',
        {variant: 'error'},
      );
      return;
    }

    const isDuplicate = localRows.some(
      (row) => row.data.externalId === nextCompanyExternalId,
    );

    if (isDuplicate || uncreatedMixedPosition?.length > 0) {
      enqueueSnackbar(
        'Complete creation of mixed position before adding a new one.',
        {variant: 'error'},
      );
      return;
    }

    const newMixedPosition: MixedPositionRow = {
      id: newId,
      name: '',
      externalId: nextCompanyExternalId,
      type: ArticleType.MIX,
      unit: '',
      unitPurchaseAmount: {
        currency: 'EUR',
        netAmount: 0,
        percentageVat: 0,
      },
      unitAmount: {
        currency: 'EUR',
        netAmount: 0,
        percentageVat: 0,
      },
      quantity: 1,
      data: {
        id: newId,
        externalId: nextCompanyExternalId,
        description: '',
        type: ArticleType.MIX,
        unit: '',
        unitPurchaseAmount: {
          currency: 'EUR',
          netAmount: 0,
          percentageVat: 0,
          grossAmount: 0,
          vats: [{vat: 0, percentageVat: 0}],
        },
        unitSellingAmount: {
          currency: 'EUR',
          netAmount: 0,
          percentageVat: 0,
          grossAmount: 0,
          vats: [{vat: 0, percentageVat: 0}],
        },
        canDelete: false,
        category: '',
        manufacturer: '',
        model: '',
        name: '',
        number: '',
        search: '',
        serviceCompanyId: '',
        storageLocation: '',
        subCategory: '',
        suppliers: [],
        stock: {
          currentStock: 0,
          maxStock: 0,
          minOrderQuantity: 0,
          minStock: 0,
        },
        meta: {
          createdAt: '',
          lastUpdatedAt: '',
          state: State.ACTIVE,
        },
      },
      description: '',
    };

    setLocalRows((prev) => [...prev, newMixedPosition]);

    handleEditStart(newMixedPosition, 'name');
  };

  const handleNewSubPosition = async (parentId: string) => {
    setExpandedRows((prev) => [...prev, parentId]);

    const refetchData = await refetchCompanyNumber();
    const nextCompanyExternalId = refetchData.data?.value || '';

    const newSubPositionId = `sub-${Date.now()}`;

    const isDuplicate = subRows[parentId]?.some(
      (sub) => sub.externalId === nextCompanyExternalId,
    );

    const uncreatedSubPosition = subRows?.[parentId]?.filter((subRow) =>
      subRow.id.includes('sub'),
    );

    const uncreatedMixedPosition = localRows?.filter((localRow) =>
      localRow.id.includes('mixed'),
    );

    if (uncreatedMixedPosition?.length > 0) {
      enqueueSnackbar(
        'Complete creation of mixed position before adding a sub-position.',
        {variant: 'error'},
      );
      return;
    }

    if (isDuplicate || uncreatedSubPosition?.length > 0) {
      enqueueSnackbar(
        'Complete creation of sub-position before adding a new sub-position.',
        {variant: 'error'},
      );
      return;
    }

    const newSubPosition: SubPositionRow = {
      id: newSubPositionId,
      quantity: 1,
      seqNumber: 0,
      unitPurchaseAmount: {
        currency: 'EUR',
        netAmount: 0,
        percentageVat: 0,
      },
      unitAmount: {
        currency: 'EUR',
        netAmount: 0,
        percentageVat: 0,
      },
      article: {
        externalId: nextCompanyExternalId,
        name: '',
        type: ArticleType.MATERIAL,
        unitPurchaseAmount: {
          currency: 'EUR',
          netAmount: 0,
          percentageVat: 0,
          grossAmount: 0,
          vats: [{vat: 0, percentageVat: 0}],
        },
        unitSellingAmount: {
          currency: 'EUR',
          netAmount: 0,
          percentageVat: 0,
          grossAmount: 0,
          vats: [{vat: 0, percentageVat: 0}],
        },
        unit: '',
        canDelete: false,
        category: '',
        description: '',
        id: '',
        manufacturer: '',
        stock: {
          currentStock: 0,
          maxStock: 0,
          minOrderQuantity: 0,
          minStock: 0,
        },
        meta: {
          createdAt: '',
          lastUpdatedAt: '',
          state: State.ACTIVE,
        },
        model: '',
        number: '',
        search: '',
        serviceCompanyId: '',
        storageLocation: '',
        subCategory: '',
        suppliers: [],
      },
      type: ArticleType.LABOR,
      externalId: '',
      name: '',
      description: '',
      unit: '',
    };

    setSubRows((prev) => {
      const updatedSubRows = {
        ...prev,
        [parentId]: [...(prev[parentId] || []), newSubPosition],
      };
      return updatedSubRows;
    });

    handleSubPositionEditStart(newSubPosition, 'name');
  };

  const closeDescriptionDialogAndClear = () => {
    setOpenDescriptionDialog(false);
    setDescription('description', '');
  };

  const handleDescriptionClick = (
    row: MixedPositionRow | SubPositionRow,
    positionType: 'mixed' | 'sub',
  ) => {
    let id: string | number;
    let descriptionValue: string | undefined;

    if (positionType === 'sub') {
      const subRow = row as SubPositionRow;
      id = subRow.id;
      descriptionValue = subRow.article?.description;

      setSubPositionEditState({
        ...subPositionEditState,
        id,
        values: {
          ...subRow,
          description: descriptionValue,
        },
      });
    } else {
      const mixedRow = row as MixedPositionRow;
      id = mixedRow.id;
      descriptionValue = mixedRow.data.description;

      setEditState({
        ...editState,
        id,
        values: {
          ...mixedRow,
          description: descriptionValue,
        },
      });
    }

    setDescription('description', descriptionValue);
    setOpenDescriptionDialog(true);
  };

  const handleSaveDescription = async () => {
    if (subPositionEditState.id) {
      const articleId = subPositionEditState.values.article?.id!;

      const parentId = Object.keys(subRows).find((key) =>
        subRows[key]?.some((sub) => {
          if (sub.id === subPositionEditState.id) {
            return true;
          }
          return false;
        }),
      );

      try {
        await updateArticleSubPosition({
          articleId,
          associationId: subPositionEditState.id,
          article: {description: watchDescription},
        });
        closeDescriptionDialogAndClear();
        resetAndUpdateSubRows(parentId!);
      } catch (error) {
        showError(error);
      }
    } else if (editState.id) {
      try {
        await updateArticle({
          articleId: editState.id!,
          article: {description: watchDescription},
        });
        setEditState({id: null, field: null, values: {}});
        closeDescriptionDialogAndClear();
      } catch (error) {
        showError(error);
      }
    }
  };

  const generateBlobUrl = async (
    mixedPos: MixedPositionRow | null,
    subPos: ArticleSubAssociationView[] | null,
  ) => {
    const blob = await pdf(
      <MixedPositionPdf
        currentCurrency={currentCurrency}
        selectedLng={company?.language}
        translate={translate}
        mixedPosition={mixedPos}
        subPositions={subPos}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
  };

  const handlePreview = async (parentId: string) => {
    const mixedPosition = localRows?.find((row) => row.data.id === parentId);

    if (!mixedPosition) return;

    const subPositions = await fetchArticleSubAssociations(parentId);

    await generateBlobUrl(mixedPosition, subPositions);

    setOpenPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setOpenPreviewDialog(false);
    setFilePathToDownload('');
  };

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  useEffect(() => {
    const fetchedRows = aggregateMixedPositionRow(articleResource?.data);
    setLocalRows(fetchedRows);
  }, [articleResource.data]);

  useEffect(() => {
    if (!createdMixId) return;

    const justCreated = localRows.find((r) => r.data.id === createdMixId);
    if (!justCreated) return;

    const rowEl = document.querySelector(
      `[data-testid="mixed-row-${createdMixId}"]`,
    );
    if (rowEl) {
      rowEl.scrollIntoView({behavior: 'smooth', block: 'center'});
      (rowEl.querySelector('input') as HTMLElement | null)?.focus();
    }

    setCreatedMixId(null);
  }, [localRows, createdMixId]);

  useEffect(() => {
    // Focus on the name input for the mixed position when it's editable
    if (editState.field && inputRefs[editState.id!]) {
      inputRefs[editState.id!].current?.focus();
    }
  }, [editState]);

  useEffect(() => {
    // Focus on the name input for the sub-position when it's editable
    if (subPositionEditState.field && inputRefs[subPositionEditState.id!]) {
      inputRefs[subPositionEditState.id!].current?.focus();
    }
  }, [subPositionEditState]);

  const COLUMNS = useMemo<TableColumnWithRender<MixedPositionRow>[]>(
    () => [
      {
        headerName: 'Article no.',
        key: 'position-cell-number',
        width: '132px',
        showShadows: showRightShadow ? 'right' : undefined,
        isFirst: true,
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Name',
        key: 'position-cell-name',
        width: '376px',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Type',
        key: 'position-cell-type',
        width: '80px',
        align: 'center',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Buying price',
        key: 'position-cell-buying-price',
        width: '112px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Margin',
        key: 'position-cell-margin',
        width: '80px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Unit price',
        key: 'position-cell-unit-price',
        width: '98px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Qty',
        key: 'position-cell-quantity',
        width: '64px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'VAT (%)',
        key: 'position-cell-vat',
        width: '88px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Unit',
        key: 'position-cell-unit',
        align: 'right',
        width: '90px',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Price (Net)',
        key: 'position-cell-net-price',
        width: '108px',
        align: 'right',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Actions',
        key: 'position-cell-actions',
        width: ACTION_CELL_WIDTH,
        isHeaderNameHidden: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        isLast: true,
        noPadding: true,
        align: 'center',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  if (isLoading) {
    return (
      <Box
        sx={{width: '100%', height: '100%'}}
        display="flex"
        justifyContent="center"
        alignItems="center">
        <CircularProgress size={25} />
      </Box>
    );
  }

  if (emptyTable && !localRows.length) {
    return (
      <Box
        gap={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60%',
            mt: 12,
          }}>
          <EmptySection
            label="No mixed positions"
            subLabel="Group several positions and services allowing you to create quotes and invoices quicker with greater clarity."
            illustration="mixedPositions"
            size="tiny"
            containerStyle={{
              height: '100%',
            }}
            btnLabel="New Mixed Position"
            btnAction={() => {
              handleNewMixedPosition();
            }}
            showActionBtn
            labelVariant="h5"
            subLabelProps={{
              color: '#828DA3',
              maxWidth: '420px',
              mt: 1,
              mb: 0.5,
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      gap={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: '24px',
      }}>
      <Grid
        sx={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
        }}>
        <PageHeaderContainer sx={{my: '2em'}}>
          <SearchInput
            refInput={textInput}
            defaultValue={search}
            onChange={(val: string) => {
              setPage({
                ...page,
                pageIndex: 0,
              });
              setSearch(val);
            }}
          />

          <AddButton
            label="New Mixed Position"
            onClick={handleNewMixedPosition}
          />
        </PageHeaderContainer>

        <TableContainer
          showNoMatchWarning={noMatchingData}
          containerRef={containerRef}
          setShowLeftShadow={setShowLeftShadow}
          setShowRightShadow={setShowRightShadow}>
          <TableHeader columns={COLUMNS} />
          <TableBody>
            {rows &&
              rows.map((row) => (
                <Fragment key={row.data.id}>
                  <TableRow
                    testId={`mixed-row-${row.data.id}`}
                    disableHover
                    sx={{
                      pointerEvents:
                        isUpdatingArticle ||
                        isUpdatingSubPosition ||
                        isDeletingSubPosition
                          ? 'none'
                          : 'auto',
                    }}>
                    <MixedPositionRowComponent
                      serviceCompanyId={serviceCompanyId}
                      row={row}
                      editState={editState}
                      setEditState={setEditState}
                      inputRefs={inputRefs}
                      mixedPositionControl={mixedPositionControl}
                      expandedRows={expandedRows}
                      setExpandedRows={setExpandedRows}
                      setSubRows={setSubRows}
                      localRows={localRows}
                      setLocalRows={setLocalRows}
                      handleEditStart={handleEditStart}
                      handleNewSubPosition={handleNewSubPosition}
                      handleDescriptionClick={handleDescriptionClick}
                      handlePreview={handlePreview}
                      setDeleteEventState={setDeleteEventState}
                      showLeftShadow={showLeftShadow}
                      showRightShadow={showRightShadow}
                      onCreated={(newId: string) => setCreatedMixId(newId)}
                    />
                  </TableRow>

                  {expandedRows?.includes(row.data.id) &&
                    subRows[row.data.id]?.map((subPosition, index) => (
                      <SubPositionRowComponent
                        key={subPosition.id}
                        row={row}
                        subPosition={subPosition}
                        index={index}
                        inputRefs={inputRefs}
                        subRows={subRows}
                        setSubRows={setSubRows}
                        subPositionEditState={subPositionEditState}
                        setSubPositionEditState={setSubPositionEditState}
                        handleSubPositionEditStart={handleSubPositionEditStart}
                        handleDescriptionClick={handleDescriptionClick}
                        handlePreview={handlePreview}
                        setDeleteEventState={setDeleteEventState}
                        refetchArticles={refetchArticles}
                        serviceCompanyId={serviceCompanyId}
                        showLeftShadow={showLeftShadow}
                        showRightShadow={showRightShadow}
                      />
                    ))}

                  {expandedRows.includes(row.data.id) && (
                    <TableRow testId={`button-row-${row.data.id}`}>
                      <Button
                        variant="text"
                        style={{
                          color: theme.palette.primary.light,
                          fontSize: '0.8rem',
                        }}
                        buttonProps={{
                          startIcon: <PlaylistAddOutlinedIcon />,
                          onClick: () => handleNewSubPosition(row.data.id),
                        }}>
                        {t('Add sub-position')}
                      </Button>
                    </TableRow>
                  )}
                </Fragment>
              ))}
          </TableBody>
        </TableContainer>

        <Pagination
          currentIndex={articleResource.page.pageIndex}
          numberOfElementsPerPage={articleResource.page.pageSize}
          totalEntries={articleResource.total}
          onChange={handlePageIndexChange}
          onNumberPerPageChange={handleChangeElementsPerPage}
        />

        <ConfirmDelete
          confirmText={t(
            deleteEventState.event?.type === 'sub'
              ? 'Delete Sub-Position'
              : 'Delete Mixed Position',
          )}
          saveLoading={isDeleting}
          title={t(
            deleteEventState.event?.type === 'sub'
              ? 'Delete Sub-Position'
              : 'Delete Mixed Position',
          )}
          body={[
            t(
              deleteEventState.event?.type === 'sub'
                ? 'Warning! You are about to delete "{{articleName}}" sub-position. This action is irreversible'
                : 'Warning! You are about to delete "{{articleName}}" mixed position. This action is irreversible',
              {
                articleName: removeHtmlTags(deleteEventState.event?.name || ''),
              },
            ),
            t(
              deleteEventState.event?.type === 'sub'
                ? 'Enter the sub-position name to confirm deletion.'
                : 'Enter the mixed position name to confirm deletion.',
            ),
          ]}
          dialogContent={
            <TextField
              value={deleteEventState.userTypedName}
              onChange={onChange}
              size="small"
              placeholder={t(
                deleteEventState.event?.type === 'sub'
                  ? 'Sub-position name'
                  : 'Mixed Position name',
              )}
              fullWidth
              sx={{mt: 2, mb: 1}}
            />
          }
          buttonSx={{
            bgcolor: 'error.light',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'primary.contrastText',
            },
          }}
          disableSave={
            removeHtmlTags(deleteEventState.event?.name || '') !==
              deleteEventState.userTypedName || isDeleting
          }
          open={deleteEventState.isOpen ?? false}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleteEventState({
              userTypedName: '',
              isOpen: false,
            });
            setEditState({id: null, field: null, values: {}});
          }}
        />

        <Dialog
          title={t('Description')}
          onCancel={() => {
            closeDescriptionDialogAndClear();
            setEditState({id: null, field: null, values: {}});
            setSubPositionEditState({id: null, field: null, values: {}});
          }}
          onSave={handleSaveDescription}
          dialogProps={{
            open: openDescriptionDialog || false,
            maxWidth: 'md',
          }}
          leftButton={
            <Button
              label="Cancel"
              buttonProps={{
                onClick: () => {
                  closeDescriptionDialogAndClear();
                  setEditState({id: null, field: null, values: {}});
                  setSubPositionEditState({
                    id: null,
                    field: null,
                    values: {},
                  });
                },
                variant: 'outlined',
                size: 'medium',
                sx: {background: 'white'},
              }}
            />
          }
          showCancelButton={false}>
          <RichTextEditor
            required
            label={t('Description')}
            name="description"
            control={descriptionControl}
            html={watchDescription}
            hasSignatureButton={false}
            hasAttachFileButton={false}
          />
        </Dialog>

        <Dialog
          title={t('Mixed position PDF preview')}
          onCancel={handleClosePreview}
          dialogProps={{
            open: openPreviewDialog || false,
          }}
          sx={{
            '& .MuiDialog-paper': {
              width: '750px',
              maxWidth: 'none',
              padding: '0em',
            },
          }}
          leftButton={
            <Button
              label="Cancel"
              buttonProps={{
                onClick: handleClosePreview,
                variant: 'outlined',
                size: 'medium',
                sx: {background: 'white'},
              }}
            />
          }
          showSaveButton={false}
          showCancelButton={false}>
          <PositionPreview filePathToDownload={filePathToDownload} />
        </Dialog>
      </Grid>
    </Box>
  );
};

export default MixedPositions;
