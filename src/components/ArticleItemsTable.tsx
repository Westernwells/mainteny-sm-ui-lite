import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import {QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';
import {ArticleView} from 'models/article';
import {
  useArticles,
  useCreatePartialArticle,
} from 'hooks/reactQuery/useArticle';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {formatCurrency} from 'utils/currency';
import {createEmptyResource} from 'utils/paging-utils';
import {ArticleItemRow} from './ArticleItemRow';
import {Button} from './Button';
import {FormLabel} from './form/FormLabel';
import {SelectModal} from './SelectModal';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {SelectButton} from './SelectButton';

interface Props<T> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  isPartial?: boolean;
}

export const ArticleItemsTable = ({
  items,
  setItems,
  isPartial,
}: Props<QuotationItemRecord | InvoiceItemRecord<Amount>>) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {
    data: partialArticleResource = createEmptyResource<ArticleView>(1),
    isFetched,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 1,
      query: 'PARTIAL',
    },
    {},
    true,
  );
  const {mutate: createPartial} = useCreatePartialArticle();

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);

  const [total, setTotal] = useState(0);

  const articleViewToItem = (
    article: ArticleView,
  ): QuotationItemRecord | InvoiceItemRecord<Amount> => ({
    articleId: article.id,
    articleUnit: article.unit,
    description: article.description,
    name: article.name,
    quantity: 1,
    unitAmount: article.unitSellingAmount,
  });

  const deleteItem = (
    item: QuotationItemRecord | InvoiceItemRecord<Amount>,
  ) => {
    const newItems = items.filter((i) => i !== item);
    setItems(newItems);
  };

  const handleSelectItem = (row: ArticleView) => {
    if (items.filter((item) => item.articleId === row.id).length === 0) {
      setItems([...items, articleViewToItem(row)]);
    }

    setIsArticleModalOpen(false);
  };

  useEffect(() => {
    if (isPartial && isFetched && !partialArticleResource.data.length)
      createPartial();
    if (isPartial && isFetched && partialArticleResource.data.length) {
      const temp = partialArticleResource.data[0];
      if (items.length && temp.id !== items[0].articleId)
        setItems([articleViewToItem(temp)]);
      else setItems([articleViewToItem(temp)]);
    }
  }, [isPartial]);

  const renderHeader = () => (
    <Box
      px=".5em"
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '3ch minmax(24ch, 2fr) minmax(10ch, 16ch) repeat(2, minmax(6ch, 10ch)) minmax(12ch, 18ch)',
        placeItems: 'center start',
        gap: '.5em',
      }}>
      <FormLabel text="No" />
      <FormLabel text="Description" sx={{justifySelf: 'start'}} />
      <FormLabel text="Unit Price" />
      <FormLabel text="Quantity" />
      <FormLabel text="Unit" />
      <Box>
        <FormLabel text="Total Price" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
    </Box>
  );
  const renderPartialHeader = () => (
    <Box
      px=".5em"
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '3ch minmax(24ch, 2fr) repeat(4, minmax(10ch, 16ch))',
        placeItems: 'center start',
        gap: '.5em',
      }}>
      <FormLabel text="No" />
      <FormLabel text="Description" sx={{justifySelf: 'start'}} />
      <Box>
        <FormLabel text="Total Payable" sx={{display: 'block'}} />
        <FormLabel text="(incl VAT)" />
      </Box>
      <Box>
        <FormLabel text="Total Payable" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
      <Box>
        <FormLabel text="Pending" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
      <Box>
        <FormLabel text="Invoice Amount" sx={{display: 'block'}} />
        <FormLabel text="(excl VAT)" />
      </Box>
    </Box>
  );

  useEffect(() => {
    if (items.length) {
      const sum = 0;

      setTotalPrice(
        items
          .map(
            (item) =>
              item.quantity *
              (item.unitAmount.netAmount /
                10 ** item.unitAmount.fractionDigits!),
          )
          .reduce((prevValue, currentValue) => prevValue + currentValue, sum),
      );
    }
  }, [items]);

  useEffect(() => {
    if (total === 0) setTotal(totalPrice);
  }, [totalPrice]);

  return (
    <Box mt="1em">
      <FormLabel text="Articles" />
      <Box
        bgcolor="grey.50"
        border="1px solid"
        borderColor="grey.300"
        borderRadius="4px"
        p=".5em">
        {isPartial ? renderPartialHeader() : renderHeader()}
        <Box
          bgcolor="grey.50"
          borderRadius="4px"
          display="flex"
          flexDirection="column"
          my="1em"
          gap="1em">
          {items.map((item, index) => (
            <ArticleItemRow
              key={item.articleId}
              articleItem={item}
              index={index + 1}
              deleteItem={deleteItem}
              setItems={setItems}
              isPartial={isPartial}
              total={total}
              setTotal={setTotal}
            />
          ))}
          {items.length ? (
            <>
              {!isPartial && (
                <Button
                  label="Article"
                  buttonProps={{
                    variant: 'contained',
                    sx: {alignSelf: 'self-start'},
                    startIcon: <AddIcon />,
                    onClick: () => setIsArticleModalOpen(true),
                  }}
                />
              )}
              <Box borderTop="1px solid" borderColor="grey.300">
                <Box
                  p="1em"
                  pl="50%"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    justifyItems: 'end',
                  }}>
                  {isPartial && (
                    <>
                      <Typography mb=".5em">
                        {t('Total Amount')}
                        <Typography
                          variant="caption"
                          component="span"
                          ml="1ch"
                          sx={{color: 'text.secondary'}}>
                          {t('(excl VAT)')}
                        </Typography>
                      </Typography>

                      <Typography>
                        {formatCurrency(total, {currency: 'EUR'})}
                      </Typography>
                    </>
                  )}

                  <Typography>
                    {isPartial ? t('Partial Payment') : t('Total Price')}
                    <Typography
                      variant="caption"
                      component="span"
                      ml="1ch"
                      sx={{color: 'text.secondary'}}>
                      {t('(excl VAT)')}
                    </Typography>
                  </Typography>

                  <Typography>
                    {formatCurrency(totalPrice, {currency: 'EUR'})}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{color: 'text.secondary', alignSelf: 'end'}}>
                    {t('VAT')}
                    {totalPrice
                      ? ` ${
                          user!.userAccount.serviceCompany.settings
                            .percentageVat
                        }%`
                      : null}
                  </Typography>
                  <Typography>
                    {formatCurrency(
                      totalPrice *
                        (user!.userAccount.serviceCompany.settings
                          .percentageVat /
                          100),
                      {currency: 'EUR'},
                    )}
                  </Typography>
                </Box>
                <Box
                  bgcolor="grey.700"
                  borderRadius="4px"
                  p="1em"
                  pl="50%"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    justifyItems: 'end',
                  }}>
                  <Typography sx={{color: 'primary.contrastText'}}>
                    {isPartial ? t('Invoice Amount') : t('Total Price')}
                    <Typography variant="caption" component="span" ml="1ch">
                      {t('(incl VAT)')}
                    </Typography>
                  </Typography>
                  <Typography sx={{color: 'primary.contrastText'}}>
                    {formatCurrency(
                      totalPrice *
                        (1 +
                          user!.userAccount.serviceCompany.settings
                            .percentageVat /
                            100),
                      {currency: 'EUR'},
                    )}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box display="flex" alignItems="center" my="1em" gap="1em">
              <Typography variant="body2">1</Typography>
              <SelectButton
                text="Select Article"
                onClick={() => setIsArticleModalOpen(true)}
                sxContainer={{flexGrow: 1}}
              />
            </Box>
          )}
        </Box>
        <SelectModal
          isOpen={isArticleModalOpen}
          onClose={() => setIsArticleModalOpen(false)}
          header="Select Article">
          <ArticlesDataGrid setRowItem={handleSelectItem} />
        </SelectModal>
      </Box>
    </Box>
  );
};
