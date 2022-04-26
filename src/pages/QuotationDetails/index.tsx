import {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import {Button, InputLabel, OutlinedInput, TextField} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import {BackAction} from 'components/BackAction';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {roundCurrency} from 'utils/currency';
import {SelectButton} from './Components/SelectButton';
import {SelectCard} from './Components/SelectCard';
import {Label} from './Components/Label';
import {QuotationLayout} from './Components/QuotationLayout';
import {BottomDrawer} from './Components/BottomDrawer';
import {QuotationModal} from './Components/QuotationModal';
import {Article} from './Components/Article';
import {CustomerDataGrid} from './DataGrid/CustomerDataGrid';
import {UnitDataGrid} from './DataGrid/UnitDataGrid';
import {ArticleDataGrid} from './DataGrid/ArticleDataGrid';
import {ArticleView, CustomerView, UnitView} from './model';

export const QuotationDetails = () => {
  const [isDrawerOpen] = useState<boolean>(true);

  const {user} = useUserSession();

  const [date, setDate] = useState<Date | null>(new Date());

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [customer, setCustomer] = useState<CustomerView | null>(null);
  const [unit, setUnit] = useState<UnitView | null>(null);
  const [articles, setArticles] = useState<ArticleView[]>([]);

  const [totalPrice, setTotalPrice] = useState(0);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  const handleSelectCustomer = (row: CustomerView) => {
    setCustomer(row);
    setIsCustomerModalOpen(false);
  };

  const handleSelectUnit = (row: UnitView) => {
    setUnit(row);
    setIsUnitModalOpen(false);
  };

  const handleSelectArticle = (row: ArticleView) => {
    if (articles.filter((item) => item === row).length === 0) {
      setArticles([...articles, row]);
    }
    setIsArticleModalOpen(false);
  };

  const deleteArticle = (article: ArticleView) => {
    const newArticles = articles.filter((item) => item !== article);
    setArticles(newArticles);
  };

  useEffect(() => {
    if (articles.length) {
      const sum = 0;

      setTotalPrice(
        articles
          .map((article) => article.quantity * article.unitPriceNumber)
          .reduce((prevValue, currentValue) => prevValue + currentValue, sum),
      );
    }
  }, [articles]);

  return (
    <>
      <Box display="flex" alignItems="center" gap="1em">
        <BackAction label="QT-123456" containerStyle={{my: 'auto'}} />
        <Typography variant="body1" color="textSecondary">
          New Quotation
        </Typography>
        <Chip label="Draft" variant="outlined" color="warning" />
      </Box>

      <QuotationLayout>
        <Typography variant="subtitle1" mt="1em">
          Gradler Fordertechnik
          <Typography component="span" variant="caption">
            &nbsp; GmbH Ahornstrabe 21 14959 Trebbin of Thryow
          </Typography>
        </Typography>

        <Box display="flex" mt="1em" gap="1em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="1em">
            <Box>
              <Label text="To" />
              {customer ? (
                <SelectCard
                  header={customer.name}
                  body={[customer.address, customer.phone]}
                  onClose={() => setCustomer(null)}
                />
              ) : (
                <SelectButton
                  text="Select Customer"
                  onClick={() => setIsCustomerModalOpen(true)}
                />
              )}
            </Box>
            <Box>
              <Label text="  Unit Details" />

              {unit ? (
                <SelectCard
                  header={unit.unitName}
                  body={[unit.address]}
                  onClose={() => setUnit(null)}
                />
              ) : (
                <SelectButton
                  text="Select Unit"
                  onClick={() => setIsUnitModalOpen(true)}
                />
              )}
            </Box>
          </Box>
          <Box
            width="40%"
            display="flex"
            flexDirection="column"
            justifyContent="space-between">
            <Box>
              <InputLabel>
                <Label text="Date Created" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  inputFormat="MM/dd/yyyy"
                  value={date}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  renderInput={(params) => (
                    <TextField size="small" fullWidth {...params} />
                  )}
                />
              </LocalizationProvider>
            </Box>
            <Box>
              <InputLabel>
                <Label text="Quotation Number" />
              </InputLabel>
              <OutlinedInput
                size="small"
                defaultValue="QT-123456"
                disabled
                fullWidth
              />
            </Box>
            <Box>
              <InputLabel>
                <Label text="Created By" />
              </InputLabel>
              <OutlinedInput
                size="small"
                defaultValue={`${user?.userAccount.firstName} ${user?.userAccount.lastName}`}
                fullWidth
              />
            </Box>
          </Box>
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Subject" />
          </InputLabel>
          <OutlinedInput minRows={4} multiline fullWidth />
        </Box>
        <Box
          bgcolor="grey.50"
          border="1px solid"
          borderColor="grey.300"
          mt="1em"
          borderRadius="4px"
          p=".5em">
          <Box
            px=".5em"
            sx={{
              display: 'grid',
              gridTemplateColumns: '3ch 2fr repeat(4, 10ch)',
              placeItems: 'center',
              gap: '.5em',
            }}>
            <Label text="No" />
            <Label text="Description" sx={{justifySelf: 'start'}} />
            <Label text="Quantity" />
            <Label text="Unit" />
            <Label text="Unit Price" />
            <Box sx={{justifySelf: 'end'}}>
              <Label text="Total Price" sx={{display: 'block'}} />
              <Label text="(excl VAT)" />
            </Box>
          </Box>
          <Box
            bgcolor="grey.50"
            borderRadius="4px"
            display="flex"
            flexDirection="column"
            my="1em"
            gap="1em">
            {articles.map((item, index) => (
              <Article
                key={item.articleNumber}
                article={item}
                index={index + 1}
                deleteArticle={deleteArticle}
                setArticles={setArticles}
              />
            ))}
            {articles.length ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  sx={{alignSelf: 'self-start'}}
                  startIcon={<AddIcon />}
                  onClick={() => setIsArticleModalOpen(true)}>
                  Article
                </Button>
                <Box borderTop="1px solid" borderColor="grey.300">
                  <Box
                    p="1em"
                    pl="50%"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      justifyItems: 'end',
                    }}>
                    <Typography>
                      Total Price
                      <Typography
                        variant="caption"
                        component="span"
                        ml="1ch"
                        sx={{color: 'text.secondary'}}>
                        (excl VAT)
                      </Typography>
                    </Typography>

                    <Typography>{`€ ${totalPrice.toFixed(2)}`}</Typography>
                    <Typography
                      variant="caption"
                      sx={{color: 'text.secondary'}}>
                      VAT(10%)
                    </Typography>
                    <Typography>{`€ ${(totalPrice / 10).toFixed(
                      2,
                    )}`}</Typography>
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
                      Total Price
                      <Typography variant="caption" component="span" ml="1ch">
                        (incl VAT)
                      </Typography>
                    </Typography>
                    <Typography sx={{color: 'primary.contrastText'}}>
                      {`€ ${roundCurrency(totalPrice * 1.1, 2).toFixed(2)}`}
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
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Additional Information" />
          </InputLabel>
          <OutlinedInput minRows={2} multiline fullWidth />
        </Box>
      </QuotationLayout>

      <QuotationModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        header="Select Customer">
        <CustomerDataGrid setRowItem={handleSelectCustomer} />
      </QuotationModal>

      <QuotationModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        header="Select Unit">
        <UnitDataGrid setRowItem={handleSelectUnit} />
      </QuotationModal>

      <QuotationModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        header="Select Article">
        <ArticleDataGrid setRowItem={handleSelectArticle} />
      </QuotationModal>
      <BottomDrawer isOpen={isDrawerOpen} />
    </>
  );
};
