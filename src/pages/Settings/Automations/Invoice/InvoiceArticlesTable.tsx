import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {
  useCreateTravelWork,
  useDeleteTravelWork,
  useQueryTravelWorks,
  useUpdateTravelWork,
} from 'hooks/reactQuery/useTravelWork';
import {
  TravelWorkCalculationType,
  TravelWorkCalculationTypeLabels,
  TravelWorkView,
} from 'models/service-company';
import {ServiceOrderType} from 'models/service-order';
import {useEffect, useMemo, useState} from 'react';
import {Progress} from 'components/Progress';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {formatCurrency} from 'utils/currency';
import {theme} from 'theme';
import {useTranslation} from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import {SelectModal} from 'components/SelectModal';
import {ArticlesModalDataGrid} from 'components/ArticleModalDataGrid';
import {ArticleView} from 'models/article';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {StringValue} from 'models/misc';
import {scrollTableToBottom} from 'utils/utils';

interface Props {
  serviceOrderType: ServiceOrderType;
}

export const makeRows = (invoiceArticles: TravelWorkView[]): GridRowsProp =>
  invoiceArticles
    ? invoiceArticles.map((item: TravelWorkView, index: number) => ({
        id: index,
        name: item.article?.name,
        articleNumber: item.article.externalId,
        unit: item.article.unit,
        automate: item,
        sellingPrice: formatCurrency(
          (item.article.unitSellingAmount.netAmount ?? 0) /
            (10 ** item.article.unitSellingAmount.fractionDigits ?? 0),
          {
            currency: item.article.unitSellingAmount.currency,
          },
        ),
        actions: item.id,
      }))
    : [];

const InvoiceArticlesTable = ({serviceOrderType}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [newlyAddedArticle, setNewlyAddedArticle] = useState<{id: string}>();
  const isAutoHeightTable = rows.length <= 5;

  const handleSuccessResponse = (response: StringValue) => {
    setNewlyAddedArticle({id: response.value});
  };

  const {mutate: createTravelWork} = useCreateTravelWork(
    t('Article added successfully'),
    handleSuccessResponse,
  );
  const {mutate: updateTravelWork} = useUpdateTravelWork(
    t('Article updated successfully'),
  );
  const {mutate: deleteTravelWork} = useDeleteTravelWork(
    t('Article removed successfully'),
  );
  const {
    data: articles,
    isLoading,
    isFetched,
  } = useQueryTravelWorks({serviceOrderType});

  useEffect(() => {
    setRows(makeRows(articles?.length ? articles : []));
    if (isFetched && !!newlyAddedArticle) {
      setTimeout(() => scrollTableToBottom(), 300);
    }
  }, [articles, isFetched]);

  const handleCalculationTypeChange = async (data: {
    articleId: string;
    calculationType: TravelWorkCalculationType;
    id: string;
  }) => {
    await updateTravelWork({
      id: data.id,
      articleId: data.articleId,
      calculationType: data.calculationType,
      serviceOrderType,
    });
    if (data.id === newlyAddedArticle?.id) {
      setNewlyAddedArticle(undefined);
    }
  };
  const handleAddArticle = async (article: ArticleView) => {
    await createTravelWork({
      articleId: article.id,
      calculationType: TravelWorkCalculationType.FIXED_FEE,
      serviceOrderType,
      serviceCompanyId: user!.userAccount.serviceCompany.id,
    });
    setIsArticleModalOpen(false);
  };
  const handleDeleteArticle = async (id: string) => {
    await deleteTravelWork(id);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      getColumnProps({
        field: 'name',
        headerName: 'Name',
        variant: 'uppercase',
        flex: 1,
        renderCell: (params) => {
          const {value} = params;
          return <Box>{value}</Box>;
        },
      }),
      getColumnProps({
        field: 'articleNumber',
        headerName: 'Article #',
        variant: 'uppercase',
        flex: 0.7,
      }),
      getColumnProps({
        field: 'unit',
        headerName: 'Unit',
        variant: 'uppercase',
        flex: 1,
      }),
      getColumnProps({
        field: 'automate',
        headerName: 'Automate',
        variant: 'uppercase',
        flex: 2.5,
        renderCell: (params: GridRenderCellParams<TravelWorkView>) => {
          const {value} = params;
          return (
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              position="relative">
              <Select
                size="small"
                sx={{background: 'white', width: '100%'}}
                onChange={(event) =>
                  handleCalculationTypeChange({
                    calculationType: event.target
                      .value as TravelWorkCalculationType,
                    articleId: value.article.id,
                    id: value.id,
                  })
                }
                inputProps={{
                  name: 'calculationType',
                  sx: {width: '100%'},
                  value: value.calculationType,
                }}>
                {Object.values(TravelWorkCalculationType).map(
                  (calculationType, index) => (
                    <MenuItem
                      key={index}
                      value={TravelWorkCalculationType[calculationType]}>
                      {t(
                        TravelWorkCalculationTypeLabels[
                          TravelWorkCalculationType[calculationType]
                        ],
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
              {newlyAddedArticle?.id === value.id && (
                <Typography variant="caption">
                  {t('Select article automation type')}
                </Typography>
              )}
            </Box>
          );
        },
      }),
      getColumnProps({
        field: 'sellingPrice',
        headerName: 'SELLING PRICE (EXCL. VAT)',
        flex: 1.5,
        align: 'right',
        headerAlign: 'center',
      }),
      getColumnProps({
        field: 'actions',
        headerName: '',
        align: 'right',
        flex: 0.5,
        renderCell: (params) => (
          <IconButton onClick={() => handleDeleteArticle(params.value)}>
            <DeleteOutlinedIcon style={{color: theme.palette.text.secondary}} />
          </IconButton>
        ),
      }),
    ],
    [articles?.length, newlyAddedArticle],
  );

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between">
      {isLoading ? (
        <Progress height="100%" />
      ) : (
        <Box height="100%">
          <DataGridLayout
            isWidget
            fullHeight={false}
            height={!isAutoHeightTable ? '90%' : 'auto'}
            autoHeight={isAutoHeightTable}
            columns={columns}
            rows={rows}
            getRowHeight={(row) =>
              row?.model?.automate?.id === newlyAddedArticle?.id ? 80 : 52
            }
            containerStyle={{
              width: '100%',
              height: 'fit-content',
              '& .MuiDataGrid-row, & .MuiDataGrid-columnHeaders': {
                background: 'none',
              },
              '& .MuiDataGrid-virtualScrollerContent': {
                ...(rows.length === 0 && {height: '0 !important'}),
              },
            }}
            noRowsEmptySection={
              <EmptySection
                showActionBtn
                illustration="clipboard"
                size="tiny"
                label="No articles"
                subLabel="They will appear here once the article is added"
                btnAction={() => setIsArticleModalOpen(true)}
                btnLabel="Add Article"
                containerStyle={{
                  height: '100%',
                  marginTop: '10%',
                }}
              />
            }
          />
          {articles?.length ? (
            <Button
              buttonProps={{
                startIcon: <AddIcon />,
                onClick: () => setIsArticleModalOpen(true),
                sx: {color: theme.palette.primary.light},
              }}>
              {t('Add Article')}
            </Button>
          ) : null}

          <SelectModal
            isOpen={isArticleModalOpen}
            onClose={() => setIsArticleModalOpen(false)}
            header="Select Article">
            {isLoading ? (
              <Progress label="Adding article" />
            ) : (
              <ArticlesModalDataGrid setRowItem={handleAddArticle} />
            )}
          </SelectModal>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceArticlesTable;
