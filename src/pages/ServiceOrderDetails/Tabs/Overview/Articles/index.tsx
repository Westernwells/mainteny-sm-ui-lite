import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {useEffect, useMemo, useRef, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {
  ServiceOrderArticleOwnerType,
  ServiceOrderArticleRecord,
  ServiceOrderArticleView,
  ServiceOrderSubArticleRecord,
  ServiceOrderView,
} from 'models/service-order';
import {EmptySection} from 'components/EmptySection';
import Box from '@mui/material/Box';
import {SelectModal} from 'components/SelectModal';
import {ArticlesModalDataGrid} from 'components/ArticleModalDataGrid';
import {ArticleSectionTableRow, ArticleView} from 'models/article';
import {Progress} from 'components/Progress';
import {
  useCreateServiceOrderArticle,
  useNewUpdateServiceOrderArticles,
  useServiceOrderSubItems,
} from 'hooks/reactQuery/useServiceOrder';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
import {calculateOrderArticlesTotal} from 'utils/calculate-total';
import {InfoCardTotalSumFooter} from 'components/InfoCardTotalSumFooter';
import {useCurrentCurrency} from 'utils/currency';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {theme} from 'theme';
import {IconButton, Tooltip} from '@mui/material';
import {TableColumnWithRender} from 'models/table';
import TableCellText from 'components/Table/TableCellText';
import TableHeader from 'components/Table/TableHeader';
import TableRow from 'components/Table/TableRow';
import {useNavigate} from 'react-router-dom';
import {
  hasMultipleParagraphs,
  returnFirstParagraph,
} from 'utils/rich-text-field';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TruncatedTooltip from 'components/TruncatedTooltip';
import {Dialog} from 'components/Dialog';
import DOMPurify from 'dompurify';
import {stripHtmlTags} from 'models/text-block';
import HdrAutoOutlinedIcon from '@mui/icons-material/HdrAutoOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import TableBody from 'components/Table/TableBody';
import TableContainer from 'components/Table/TableContainer';
import UpdateConfirmationModal from 'pages/ServiceOrderDetails/UpdateConfirmationModal';
import TableCell from 'components/Table/TableCell';
import {getIconByType} from 'pages/Articles/Tabs/MixedPositions';
import {serviceOrderItemToServiceOrderItemRecord} from 'utils/service-order-utils';
import {makeRows} from './ArticleDataGridProps';

interface Props {
  serviceOrderArticles: ServiceOrderArticleView[] | undefined;
  serviceOrder: ServiceOrderView;
  customerId?: string;
}

export const Articles = ({
  serviceOrderArticles,
  serviceOrder,
  customerId,
}: Props) => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const {user} = useUserSession();
  const {data: customer} = useGetCustomer(
    serviceOrder.elevator.propertyOwner.id,
  );
  const [rows, setRows] = useState<ArticleSectionTableRow[]>([]);
  const [openSelectModal, setOpenSelectModal] = useState<boolean>(false);
  const [isOpenDialog, setIsDialogOpen] = useState<boolean>(false);
  const [activeArticle, setActiveArticle] = useState<ArticleSectionTableRow>();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [articleSelected, setArticleSelected] = useState<
    ArticleView | undefined
  >();

  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const COLUMNS = useMemo<TableColumnWithRender<ArticleSectionTableRow>[]>(
    () => [
      {
        headerName: '',
        key: 'position-cell-seq-number',
        renderCell: (cellProps) => <TableCell {...cellProps} />,
      },
      {
        headerName: 'Name',
        key: 'position-cell-name',
        showShadows: showRightShadow ? 'right' : undefined,
        isFirst: true,
        isSticky: true,
        renderCell: (article, cellProps) => {
          const valueToShow = hasMultipleParagraphs(article.name)
            ? returnFirstParagraph(article.name)
            : article.name;
          return (
            <TableCell {...cellProps}>
              <TableCellText tableCellTextStyles={{width: '95%'}}>
                {article?.description ? (
                  <TruncatedTooltip
                    textContent={article.description}
                    valueToShow={valueToShow}
                    onButtonClick={() => {
                      setActiveArticle(article);
                      setIsDialogOpen(true);
                    }}
                  />
                ) : (
                  <Typography
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(valueToShow),
                    }}
                  />
                )}
              </TableCellText>
              <IconButton sx={{py: 0}}>
                {article.ownerType === ServiceOrderArticleOwnerType.USER ||
                article.ownerType === ServiceOrderArticleOwnerType.CONTRACT ||
                article.ownerType ===
                  ServiceOrderArticleOwnerType.TRAVEL_WORK ? (
                  <Tooltip
                    title={
                      article.ownerType === ServiceOrderArticleOwnerType.USER &&
                      article.ownerName.trim()
                        ? `${t('Added by')} ${article.ownerName}`
                        : article.ownerType ===
                            ServiceOrderArticleOwnerType.CONTRACT &&
                          article.ownerName.trim()
                        ? `${t('Added by contract')} ${article.ownerName}`
                        : `${t('Added by Automation')}`
                    }
                    arrow
                    placement="top">
                    {article.ownerType === ServiceOrderArticleOwnerType.USER ? (
                      <PersonOutlinedIcon />
                    ) : article.ownerType ===
                      ServiceOrderArticleOwnerType.CONTRACT ? (
                      <TextSnippetOutlinedIcon />
                    ) : (
                      <HdrAutoOutlinedIcon />
                    )}
                  </Tooltip>
                ) : null}
              </IconButton>
            </TableCell>
          );
        },
      },
      {
        headerName: 'Type',
        key: 'position-cell-type',
        align: 'center',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>{getIconByType(article.type!)}</TableCell>
        ),
      },
      {
        headerName: 'Buying price',
        key: 'position-cell-buying-price',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>buying price</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'Margin',
        key: 'position-cell-margin',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>margin</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'Unit price',
        key: 'position-cell-unit-price',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>unit price</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'Qty',
        key: 'position-cell-quantity',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>quantity</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'VAT (%)',
        key: 'position-cell-vat',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>vatId</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'Unit',
        key: 'position-cell-unit',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>unit</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'Discount',
        key: 'position-cell-net-price',
        width: '108px',
        align: 'right',
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>discount</TableCellText>
          </TableCell>
        ),
      },
      {
        headerName: 'Total Price',
        key: 'position-cell-net-price',
        width: '108px',
        align: 'right',
        showShadows: showLeftShadow ? 'left' : undefined,
        isLast: true,
        noPadding: true,
        renderCell: (article, cellProps) => (
          <TableCell {...cellProps}>
            <TableCellText>totalPrice</TableCellText>
          </TableCell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  const {mutateAsync: createServiceOrderArticle} =
    useCreateServiceOrderArticle();

  const {isLoading} = useNewUpdateServiceOrderArticles();

  const {data: serviceOrderSubItems} = useServiceOrderSubItems(serviceOrder.id);

  const subItemsMap: Record<string, ServiceOrderSubArticleRecord[]> =
    Object.entries(serviceOrderSubItems ?? {}).reduce(
      (acc, [parentId, subItems]) => {
        acc[parentId] = subItems.map((subItem) => ({
          ...subItem,
          parentId,
        }));
        return acc;
      },
      {} as Record<string, ServiceOrderSubArticleRecord[]>,
    );

  useEffect(() => {
    setRows(
      makeRows(
        serviceOrderArticles?.map((item) =>
          serviceOrderItemToServiceOrderItemRecord(item, subItemsMap),
        ) || [],
      ),
    );
  }, [serviceOrderArticles]);

  const handleSaveArticle = async (article: ArticleView) => {
    const customerVat = customer?.additionalInfo?.vat;
    const companyVatPercentage =
      user?.userAccount?.serviceCompany?.settings?.percentageVat;
    const percentageVat =
      customerVat && typeof customerVat.percentage === 'number'
        ? customerVat.percentage
        : typeof companyVatPercentage === 'number'
        ? companyVatPercentage
        : article.unitSellingAmount.percentageVat;
    const body: ServiceOrderArticleRecord = {
      articleId: article.id,
      article: {
        id: article.id,
        name: article.name,
        externalId: article.externalId,
        type: article.type,
        unit: article.unit,
        costPackage: article.costPackage!,
        unitSellingAmount: article.unitSellingAmount,
      },
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: {
        currency: article.unitSellingAmount.currency,
        netAmount: article.unitSellingAmount.netAmount,
        percentageVat,
      },
    };

    await createServiceOrderArticle({
      serviceOrder: serviceOrder.id,
      body,
    });
    setOpenSelectModal(false);
  };

  const handleSelectArticle = (article: ArticleView) => {
    setArticleSelected(article);
    setOpenConfirmDialog(true);
  };

  const handleConfirmClose = () => {
    setArticleSelected(undefined);
    setOpenConfirmDialog(false);
  };

  const handleConfirmAccept = () => {
    if (articleSelected) {
      handleSaveArticle(articleSelected);
      handleConfirmClose();
    }
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/articles/details/${id}`);
  };

  const renderNoRowsSection = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <EmptySection
        illustration="articles"
        size="tiny"
        containerStyle={{m: 'auto', width: '60%'}}
        showActionBtn
        btnLabel="Add Articles"
        btnAction={() => setOpenSelectModal(true)}
        label="Start adding your articles and spare parts"
      />
    </Box>
  );

  return (
    <>
      <InfoCard
        footer={
          serviceOrderArticles &&
          serviceOrderArticles?.length !== 0 && (
            <InfoCardTotalSumFooter
              label={t('Total Sum (excl. VAT)')}
              amount={
                serviceOrderArticles &&
                calculateOrderArticlesTotal(serviceOrderArticles)
              }
              currency={currentCurrency.code}
            />
          )
        }
        header={<Typography variant="subtitle1">{t('Positions')}</Typography>}
        showHeaderBackground={false}
        handleAction={() => setOpenSelectModal(true)}
        headerActionIcon={
          <EditOutlinedIcon sx={{color: theme.palette.text.primary}} />
        }>
        {!serviceOrderArticles?.length ? (
          renderNoRowsSection()
        ) : (
          <TableContainer
            containerRef={containerRef}
            setShowLeftShadow={setShowLeftShadow}
            setShowRightShadow={setShowRightShadow}>
            <TableHeader columns={COLUMNS} />

            <TableBody>
              {rows?.map((entry, idx) => (
                <TableRow
                  data-rowindex={idx}
                  key={`article-row-${entry.id}`}
                  testId="article-row-container">
                  {COLUMNS.map(({renderCell, ...rest}) =>
                    renderCell(entry, {
                      onClick: handleRowClick(
                        entry.article?.id || entry.article?.id || entry.id,
                      ),
                      ...rest,
                    }),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        )}
      </InfoCard>

      <SelectModal
        isOpen={openSelectModal}
        onClose={() => setOpenSelectModal(false)}
        header="Select Article">
        {isLoading ? (
          <Progress label="Adding article" />
        ) : (
          <ArticlesModalDataGrid
            setRowItem={handleSelectArticle}
            customerId={customerId}
          />
        )}
      </SelectModal>

      <Dialog
        title={stripHtmlTags(activeArticle?.name || '')}
        onCancel={() => setIsDialogOpen(false)}
        // onSave={() => {
        //   navigate(activeArticle?.navigateTo!);
        // }}
        dialogProps={{
          maxWidth: 'sm',
          open: isOpenDialog || false,
        }}
        saveButtonText="Go to article"
        saveButtonContainerStyles={{
          justifyContent: 'space-between',
          display: 'flex',
          width: '100%',
        }}
        cancelButtonVariant="outlined"
        cancelButtonStyles={{border: '1px solid #000034', color: ' #000034'}}
        cancelButtonTextColor="text.primary">
        <Typography
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(activeArticle?.description || ''),
          }}
        />
      </Dialog>

      {openConfirmDialog && (
        <UpdateConfirmationModal
          open={openConfirmDialog}
          order={serviceOrder}
          onConfirm={handleConfirmAccept}
          onCancel={handleConfirmClose}
        />
      )}
    </>
  );
};
