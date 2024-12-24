import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {useEffect, useRef, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {
  ServiceOrderArticleOwnerType,
  ServiceOrderArticleView,
  ServiceOrderView,
} from 'models/service-order';
import {EmptySection} from 'components/EmptySection';
import Box from '@mui/material/Box';
import {SelectModal} from 'components/SelectModal';
import {ArticlesModalDataGrid} from 'components/ArticleModalDataGrid';
import {
  ArticleSectionTableRow,
  ArticleView,
  ServiceOrderArticleRecord,
} from 'models/article';
import {Progress} from 'components/Progress';
import {
  useCreateServiceOrderArticle,
  useNewUpdateServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
import {calculateOrderArticlesTotal} from 'utils/calculate-total';
import {InfoCardTotalSumFooter} from 'components/InfoCardTotalSumFooter';
import {useCurrentCurrency} from 'utils/currency';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {theme} from 'theme';
import {IconButton, Tooltip} from '@mui/material';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import Cell from 'components/Table/TableCell';
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
import {makeRows} from './ArticleDataGridProps';
import {Actions} from './Actions';

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

  const COLUMNS = useRef<TableColumnWithRender<ArticleSectionTableRow>[]>([
    {
      headerName: 'Name',
      key: 'articles-cell-name',
      justifyContent: 'justify-content',
      isFirst: true,
      renderCell: (article, cellProps) => {
        const valueToShow = hasMultipleParagraphs(article.name)
          ? returnFirstParagraph(article.name)
          : article.name;
        return (
          <Cell {...cellProps}>
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
              article.ownerType === ServiceOrderArticleOwnerType.TRAVEL_WORK ? (
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
          </Cell>
        );
      },
    },
    {
      headerName: 'Number',
      key: 'articles-cell-number',
      align: 'right',
      renderCell: (article, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText capitalize>{article.number}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Price',
      key: 'articles-cell-price',
      align: 'right',
      renderCell: (article, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{article.unitPrice}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Quantity',
      key: 'articles-cell-quantity',
      align: 'right',
      renderCell: (article, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{article.quantity}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Unit',
      key: 'articles-cell-unit',
      align: 'right',
      renderCell: (article, cellProps) => (
        <Cell
          {...cellProps}
          isFirst
          onClick={cellProps.onClick}
          align="right"
          justifyContent="right">
          <TableCellText>{t(article.unit)}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: '%',
      key: 'articles-cell-percent',
      align: 'right',
      renderCell: (article, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText>{article.percent}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Total',
      key: 'articles-cell-total',
      align: 'right',
      renderCell: (article, cellProps) => (
        <Cell {...cellProps}>
          <TableCellText capitalize>{article.total}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'action',
      key: 'articles-cell-action',
      isHeaderNameHidden: true,
      width: ACTION_CELL_WIDTH,
      isLast: true,
      renderCell: (article, cellProps) => (
        <Cell {...cellProps} onClick={undefined}>
          <Actions
            serviceOrderId={serviceOrder.id}
            serviceOrderArticleId={article.id}
          />
        </Cell>
      ),
    },
  ]);

  const {mutateAsync: createServiceOrderArticle} =
    useCreateServiceOrderArticle();

  const {isLoading} = useNewUpdateServiceOrderArticles();

  useEffect(() => {
    setRows(makeRows(serviceOrderArticles || []));
  }, [serviceOrderArticles]);

  const handleSelectArticle = async (article: ArticleView) => {
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

  const handleArticleClick = (navigateUrl: string) => () => {
    navigate(navigateUrl);
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
        header={
          <Typography variant="subtitle1">
            {t('Articles & Spare parts')}
          </Typography>
        }
        showHeaderBackground={false}
        handleAction={() => setOpenSelectModal(true)}
        headerActionIcon={
          <AddOutlinedIcon sx={{color: theme.palette.text.primary}} />
        }>
        {!serviceOrderArticles?.length ? (
          renderNoRowsSection()
        ) : (
          <TableContainer>
            <TableHeader columns={COLUMNS.current} />

            <TableBody>
              {rows?.map((entry, idx) => (
                <TableRow
                  data-rowindex={idx}
                  key={`article-row-${entry.id}`}
                  testId="article-row-container">
                  {COLUMNS.current.map(({renderCell, ...rest}) =>
                    renderCell(entry, {
                      onClick: handleArticleClick(entry.navigateTo),
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
        onSave={() => {
          navigate(activeArticle?.navigateTo!);
        }}
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
    </>
  );
};
