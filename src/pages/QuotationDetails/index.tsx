import {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Button, InputLabel, OutlinedInput, TextField} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import {BackAction} from 'components/BackAction';
import {A4Layout} from 'components/A4Layout';
import {SelectModal} from 'components/SelectModal';
import {SelectButton} from 'components/SelectButton';
import {SelectCard} from 'components/SelectCard';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {Elevator, ElevatorView} from 'models/elevator';
import {PropertyOwner} from 'models/propertyManager';
import {ClientSimpleView} from 'models/client';
import {ArticleView} from 'models/article';
import {QuotationItem, UpdateQuotation} from 'models/quotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useQuotation, useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {roundCurrency} from 'utils/currency';
import {Label} from './Components/Label';
import {BottomDrawer} from './Components/BottomDrawer';
import {QuotationRow} from './Components/QuotationRow';
import {CustomersDataGrid} from './DataGrid/CustomersDataGrid';
import {UnitsDataGrid} from './DataGrid/UnitsDataGrid';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';

export const QuotationDetails = () => {
  const {id: quotationId} = useParams();

  const {
    data: quotation,
    isIdle,
    isLoading,
    isFetched,
    refetch,
  } = useQuotationDetails(quotationId);

  const {updateQuotation} = useQuotation();

  const [isDrawerOpen] = useState<boolean>(true);

  const {user} = useUserSession();

  const [date, setDate] = useState<Date | null>(new Date());

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwner | ClientSimpleView | null
  >(null);
  const [unit, setUnit] = useState<ElevatorView | Elevator | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);

  const [totalPrice, setTotalPrice] = useState(0);

  const initialValues: UpdateQuotation = {
    description: '',
    elevatorId: '',
    items: [],
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      if (quotationId) {
        updateQuotation(quotationId, values, () =>
          console.log('Quotation Updated'),
        );
      }
    },
  });

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  const handleSelectCustomer = (row: PropertyOwner) => {
    setCustomer(row);
    setIsCustomerModalOpen(false);
  };

  const handleSelectUnit = (row: ElevatorView) => {
    setUnit(row);
    setIsUnitModalOpen(false);
  };

  const handleSelectQuotationItem = (row: ArticleView) => {
    const articleViewToQuotationItem = (
      article: ArticleView,
    ): QuotationItem => ({
      article,
      additionalInfo: {},
      id: article.id,
      quantity: 0,
      quotationId: '',
      unitSellingPrice: article.unitSellingPrice,
    });
    if (
      quotationItems.filter((item) => item.article.id === row.id).length === 0
    ) {
      setQuotationItems([...quotationItems, articleViewToQuotationItem(row)]);
    }
    setIsArticleModalOpen(false);
  };

  const deleteQuotationItem = (item: QuotationItem) => {
    const newItems = quotationItems.filter((i) => i !== item);
    setQuotationItems(newItems);
  };

  useEffect(() => {
    // TODO: Fix refetching issues
    refetch();
  }, []);

  useEffect(() => {
    if (quotationItems.length) {
      const sum = 0;

      setTotalPrice(
        quotationItems
          .map((item) => item.quantity * item.unitSellingPrice.amount)
          .reduce((prevValue, currentValue) => prevValue + currentValue, sum),
      );
    }
    formik.setFieldValue(
      'items',
      quotationItems.map((item) => ({
        articleId: item.article.id,
        quantity: item.quantity,
        sellingVat: item.article.unitSellingPrice.vat,
        unitSellingPrice: {
          amount: item.article.unitSellingPrice.amount,
          currency: item.article.unitSellingPrice.currency,
        },
      })),
      true,
    );
  }, [quotationItems]);

  useEffect(() => {
    if (isFetched && quotation) {
      setUnit(quotation.elevator);
      setCustomer(quotation.elevator.propertyOwner);
      setQuotationItems(quotation.items);
      formik.setFieldValue('description', quotation.description, true);
      formik.setFieldValue('items', quotation.items, true);
    }
  }, [isFetched]);

  useEffect(() => {
    if (unit) {
      setCustomer(unit.propertyOwner);
      formik.setFieldValue('elevatorId', unit.id, true);
    }
  }, [unit]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return !quotation ? (
    <EmptySection label="Quotation not found!" />
  ) : (
    <Box>
      <BackAction label={quotation.number} containerStyle={{my: 'auto'}} />

      <A4Layout>
        <Box display="flex" justifyContent="space-between" mt="1em">
          <Box>
            <Typography variant="subtitle1">
              {user?.userAccount.serviceCompany.name || ''}
            </Typography>
            <Typography component="span" variant="caption">
              {user &&
                'businessAddress' in user.userAccount.serviceCompany &&
                user.userAccount.serviceCompany.businessAddress?.fullName}
            </Typography>
          </Box>
          <Box textAlign="end">
            <Typography component="span" variant="caption">
              Quotation Number
            </Typography>
            <Typography variant="subtitle1">{quotation.number}</Typography>
          </Box>
        </Box>

        <Box display="flex" mt="1em" gap="2em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <Box>
              <Label text="To" />
              {customer ? (
                <SelectCard
                  header={
                    <Typography variant="body2">{customer.name}</Typography>
                  }
                  body={
                    <>
                      <Typography variant="caption">
                        {customer.address.fullName}
                      </Typography>
                      <Typography variant="caption" component="p">
                        {customer.contact.phone}
                      </Typography>
                    </>
                  }
                  onClose={() => {
                    setCustomer(null);
                    setUnit(null);
                  }}
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
                  header={<Typography variant="body2">{unit.model}</Typography>}
                  body={
                    <Typography variant="caption">
                      {unit.address.fullName}
                    </Typography>
                  }
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
            gap="2em"
            mt="1.5em">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                inputFormat="dd.MM.yyyy"
                label="Date Created"
                value={date}
                onChange={handleDateChange}
                maxDate={new Date()}
                renderInput={(params) => (
                  <TextField size="small" fullWidth {...params} />
                )}
              />
            </LocalizationProvider>
            <TextField
              label="Created By"
              size="small"
              defaultValue={`${user?.userAccount.firstName} ${user?.userAccount.lastName}`}
              fullWidth
            />
          </Box>
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Subject" />
          </InputLabel>
          <TextField size="small" minRows={1} multiline fullWidth />
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Description" />
          </InputLabel>
          <OutlinedInput
            size="small"
            id="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            minRows={2}
            maxRows={6}
            multiline
            fullWidth
          />
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
            {quotationItems.map((item, index) => (
              <QuotationRow
                key={item.id}
                quotationItem={item}
                index={index + 1}
                deleteRow={deleteQuotationItem}
                setRow={setQuotationItems}
              />
            ))}
            {quotationItems.length ? (
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
        <Box my="1.5em">
          <InputLabel>
            <Label text="Additional Information" />
          </InputLabel>
          <TextField size="small" minRows={2} multiline fullWidth />
        </Box>
      </A4Layout>

      <SelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        header="Select Customer">
        <CustomersDataGrid setRowItem={handleSelectCustomer} />
      </SelectModal>

      <SelectModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        header="Select Unit">
        <UnitsDataGrid
          setRowItem={handleSelectUnit}
          searchCustomer={customer?.name}
        />
      </SelectModal>

      <SelectModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        header="Select Article">
        <ArticlesDataGrid setRowItem={handleSelectQuotationItem} />
      </SelectModal>
      <BottomDrawer
        isOpen={isDrawerOpen}
        isValid={
          !!(
            formik.values.description &&
            formik.values.elevatorId &&
            formik.values.items.length &&
            unit !== null
          )
        }
        onSubmit={formik.handleSubmit}
      />
    </Box>
  );
};
