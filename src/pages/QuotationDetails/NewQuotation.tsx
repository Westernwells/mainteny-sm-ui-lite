import {useEffect, useState} from 'react';
// import {useNavigate} from 'react-router';
import {useSearchParams} from 'react-router-dom';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Button, InputLabel, TextField} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DraftsIcon from '@mui/icons-material/Drafts';
import {BackAction} from 'components/BackAction';
import {Progress} from 'components/Progress';
import {A4Layout} from 'components/A4Layout';
import {SelectModal} from 'components/SelectModal';
import {SelectButton} from 'components/SelectButton';
import {SelectCard} from 'components/SelectCard';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateQuotation,
  useQuotationDetails,
} from 'hooks/reactQuery/useQuotation';
import {formatCurrency} from 'utils/currency';
import {CreateQuotation, QuotationItemRecord} from 'models/quotation';
import {ElevatorView} from 'models/elevator';
import {PropertyOwner} from 'models/propertyManager';
import {ClientSimpleView} from 'models/client';
import {ArticleView} from 'models/article';
import {WithOptional} from 'models/misc';
import {formatDate} from 'utils/datetime';
import {Label} from './Components/Label';
import {BottomDrawer} from './Components/BottomDrawer';
import {QuotationRow} from './Components/QuotationRow';
import {CustomersDataGrid} from './DataGrid/CustomersDataGrid';
import {UnitsDataGrid} from './DataGrid/UnitsDataGrid';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {QuotationHeader} from './Components/QuotationHeader';

const DEFAULT_DESCRIPTION = `Dear, Customer.

We thank you for the inquiry and would like to offer you our best services for the maintenance of above mentioned unit.`;

export const NewQuotation = () => {
  const [queryParams] = useSearchParams();
  const [quotationId] = useState(queryParams.get('id'));
  const {
    data: quotation,
    isFetched,
    isIdle,
    isLoading,
  } = useQuotationDetails(quotationId !== null ? quotationId : '');

  const {user} = useUserSession();

  const {mutate: createNewQuotation} = useCreateQuotation();

  const [isDrawerOpen] = useState<boolean>(true);

  const [publish, setPublish] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwner | ClientSimpleView | null
  >(null);
  const [unit, setUnit] = useState<ElevatorView | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItemRecord[]>(
    [],
  );

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalVat, setTotalVat] = useState(0);

  const initialValues: CreateQuotation = {
    subject: '',
    description: DEFAULT_DESCRIPTION,
    elevatorId: '',
    moreInfo: '',
    items: [],
    serviceCompanyId: '',
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      createNewQuotation({data: values, publish});
    },
  });

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
    ): QuotationItemRecord => ({
      articleId: article.id,
      articleUnit: article.unit,
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: article.unitSellingAmount,
    });
    if (
      quotationItems.filter((item) => item.articleId === row.id).length === 0
    ) {
      setQuotationItems([...quotationItems, articleViewToQuotationItem(row)]);
    }
    setIsArticleModalOpen(false);
  };

  const deleteQuotationItem = (item: QuotationItemRecord) => {
    const newItems = quotationItems.filter((i) => i !== item);
    setQuotationItems(newItems);
  };

  useEffect(() => {
    if (user && user.userAccount) {
      formik.setFieldValue(
        'serviceCompanyId',
        user.userAccount.serviceCompany.id,
        true,
      );
    }
  }, [user]);

  useEffect(() => {
    if (isFetched && quotation) {
      setQuotationItems(
        quotation.items.map(
          (i): QuotationItemRecord => ({
            articleId: i.article.id,
            description: i.description || i.article.description,
            name: i.name || i.article.name,
            articleUnit: i.article.unit,
            quantity: i.quantity,
            unitAmount: i.unitAmount,
          }),
        ),
      );
      formik.setFieldValue('subject', quotation.subject, true);
      formik.setFieldValue('description', quotation.description, true);
      formik.setFieldValue('moreInfo', quotation.moreInfo, true);
      formik.setFieldValue('items', quotation.items, true);
    }
  }, [isFetched]);

  useEffect(() => {
    if (unit) {
      setCustomer(unit.propertyOwner);
      formik.setFieldValue('elevatorId', unit.id, true);
    }
  }, [unit]);

  useEffect(() => {
    if (quotationItems.length) {
      const sum = 0;
      const vat = 0;

      setTotalPrice(
        quotationItems
          .map(
            (item) =>
              item.quantity *
              (item.unitAmount.netAmount /
                10 ** item.unitAmount.fractionDigits!),
          )
          .reduce((prevValue, currentValue) => prevValue + currentValue, sum),
      );

      setTotalVat(
        quotationItems
          .map(
            (item) =>
              item.quantity *
              (item.unitAmount.vat / 10 ** item.unitAmount.fractionDigits!),
          )
          .reduce((prevValue, currentValue) => prevValue + currentValue, vat),
      );
    }
    formik.setFieldValue(
      'items',
      quotationItems.map(
        (item): WithOptional<QuotationItemRecord, 'articleUnit'> => ({
          articleId: item.articleId,
          description: item.description,
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
        }),
      ),
      true,
    );
  }, [quotationItems]);

  if (quotationId && (isIdle || isLoading)) {
    return <Progress />;
  }

  return (
    <Box>
      <BackAction
        label="New Quotation"
        containerStyle={{my: 'auto'}}
        path="/quotations?pageIndex=1&pageSize=25"
      />

      <A4Layout>
        <Box mt="1em">
          <Typography variant="subtitle1">
            {user?.userAccount.serviceCompany.name || ''}
          </Typography>
          <Typography component="span" variant="caption">
            {user &&
              'businessAddress' in user.userAccount.serviceCompany &&
              user.userAccount.serviceCompany.businessAddress?.fullName}
          </Typography>
        </Box>

        <Box display="flex" mt="1em" gap="2em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <Box>
              <Label text="Customer Details" />
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
              <Label text="Unit Details" />

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
            <Box>
              <Label text="Date Created" />
              <Typography>{formatDate(new Date())}</Typography>
            </Box>
            <Box>
              <Label text="Created By" />
              <Typography>{`${user?.userAccount.firstName} ${user?.userAccount.lastName}`}</Typography>
            </Box>
          </Box>
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Subject" />
          </InputLabel>
          <TextField
            size="small"
            id="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            minRows={1}
            maxRows={3}
            multiline
            fullWidth
          />
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Description" />
          </InputLabel>
          <TextField
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
          <QuotationHeader />
          <Box
            bgcolor="grey.50"
            borderRadius="4px"
            display="flex"
            flexDirection="column"
            my="1em"
            gap="1em">
            {quotationItems.map((item, index) => (
              <QuotationRow
                key={item.articleId}
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

                    <Typography>
                      {formatCurrency(totalPrice, {currency: 'EUR'})}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{color: 'text.secondary', alignSelf: 'end'}}>
                      VAT
                    </Typography>
                    <Typography>
                      {formatCurrency(totalVat, {currency: 'EUR'})}
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
                      Total Price
                      <Typography variant="caption" component="span" ml="1ch">
                        (incl VAT)
                      </Typography>
                    </Typography>
                    <Typography sx={{color: 'primary.contrastText'}}>
                      {formatCurrency(totalPrice + totalVat, {currency: 'EUR'})}
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
          <TextField
            size="small"
            id="moreInfo"
            value={formik.values.moreInfo}
            onChange={formik.handleChange}
            minRows={2}
            maxRows={4}
            multiline
            fullWidth
          />
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
        primaryButtonLabel="save"
        primaryButtonAction={() => {
          setPublish(false);
          formik.handleSubmit();
        }}
        listItems={[
          {
            label: 'Save & Send',
            icon: <DraftsIcon />,
            onClick: () => {
              setPublish(true);
              formik.handleSubmit();
            },
          },
        ]}
        isValid={
          !!(
            formik.values.description &&
            formik.values.subject &&
            formik.values.moreInfo &&
            formik.values.elevatorId &&
            formik.values.items.length &&
            unit !== null
          )
        }
      />
    </Box>
  );
};
