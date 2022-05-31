import {useEffect, useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Grid, InputLabel, TextField} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {A4Layout} from 'components/A4Layout';
import {SelectModal} from 'components/SelectModal';
import {SelectButton} from 'components/SelectButton';
import {SelectCard} from 'components/SelectCard';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {Button} from 'components/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DraftsIcon from '@mui/icons-material/Drafts';
import CopyAllIcon from '@mui/icons-material/CopyAll';

import {Elevator, ElevatorView} from 'models/elevator';
import {PropertyOwner} from 'models/propertyManager';
import {ClientSimpleView} from 'models/client';
import {ArticleView} from 'models/article';
import {
  QuotationItemRecord,
  QuotationStatus,
  UpdateQuotation,
} from 'models/quotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useQuotationDetails,
  useUpdateQuotation,
} from 'hooks/reactQuery/useQuotation';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {WithOptional} from 'models/misc';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {Label} from './Components/Label';
import {BottomDrawer} from './Components/BottomDrawer';
import {QuotationRow} from './Components/QuotationRow';
import {CustomersDataGrid} from './DataGrid/CustomersDataGrid';
import {UnitsDataGrid} from './DataGrid/UnitsDataGrid';
import {ArticlesDataGrid} from './DataGrid/ArticlesDataGrid';
import {QuotationHeader} from './Components/QuotationHeader';
import {PDFContainer} from './Components/PDFContainer';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const QuotationDetails = ({getCurrentPageTitle}: Props) => {
  const {id: quotationId} = useParams();

  const navigate = useNavigate();

  const {
    data: quotation,
    isIdle,
    isLoading,
    isFetched,
  } = useQuotationDetails(quotationId);

  const {mutate: updateQuotation} = useUpdateQuotation();

  const [isDrawerOpen] = useState(true);

  const [publish, setPublish] = useState(false);

  const {user} = useUserSession();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwner | ClientSimpleView | null
  >(null);
  const [unit, setUnit] = useState<ElevatorView | Elevator | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItemRecord[]>(
    [],
  );

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalVat, setTotalVat] = useState(0);

  const initialValues: UpdateQuotation = {
    subject: '',
    description: '',
    elevatorId: '',
    moreInfo: '',
    items: [],
  };

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
    description: Yup.string().required('Description is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (quotationId) {
        updateQuotation({data: values, quotationId, publish});
      }
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

  useLayoutEffect(() => {
    if (getCurrentPageTitle && quotation) {
      getCurrentPageTitle(quotation.number);
    }
  }, [quotation]);

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

  useEffect(() => {
    if (isFetched && quotation) {
      setUnit(quotation.elevator);
      setCustomer(quotation.elevator.propertyOwner);
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

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (
    isFetched &&
    quotation &&
    quotation.status === QuotationStatus.SENT_TO_CLIENT
  ) {
    return (
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap="1em">
          <Box ml="auto">
            <StatusChip
              label={getQuotationStatusStyles(quotation.status).label}
              color={getQuotationStatusStyles(quotation.status).color}
              size="small"
              variant="filled"
            />
          </Box>
          <Button
            label="Download Quotation"
            buttonProps={{
              variant: 'outlined',
              onClick: () =>
                window.open(
                  `${process.env.REACT_APP_BASE_URL}/QuotationPDF.pdf`,
                  '_blank',
                ),

              startIcon: <FileDownloadIcon color="primary" />,
            }}
          />
        </Box>
        <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
          <Grid item xs={8}>
            <PDFContainer />
          </Grid>
          <Grid item xs sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <PageCard
              headerLabel="Service Order"
              contentContainerStyles={{
                display: 'flex',
                gap: '1em',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
              <Typography variant="subtitle2" textAlign="center">
                You haven’t created Service Order for this Quotation
              </Typography>
              <Button
                label="Create Service Order"
                buttonProps={{
                  size: 'small',
                }}
              />
            </PageCard>
            <PageCard
              headerLabel="Quotation Details"
              contentContainerStyles={{
                display: 'flex',
                justifyContent: 'space-between',
              }}>
              <Box>
                <Label text="Quotation Number" sx={{color: 'text.main'}} />
                <Typography variant="subtitle1" color="primary.main">
                  {quotation.number}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created on {formatDate(quotation.meta.createdAt)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="p">
                  By
                  {` ${user?.userAccount.firstName} ${user?.userAccount.lastName}`}
                </Typography>
                <Label
                  text="Total Amount (incl VAT)"
                  sx={{color: 'text.main'}}
                />
                <Typography variant="subtitle1" color="primary.main">
                  {formatCurrency(
                    quotation.totalAmount.grossAmount /
                      10 ** quotation.totalAmount.fractionDigits!,
                    {currency: quotation.totalAmount.currency},
                  )}
                </Typography>
              </Box>
              <StatusChip
                label={getQuotationStatusStyles(quotation.status).label}
                color={getQuotationStatusStyles(quotation.status).color}
                size="small"
                variant="filled"
              />
            </PageCard>
          </Grid>
        </Grid>
        <BottomDrawer
          isOpen={isDrawerOpen}
          primaryButtonLabel="Duplicate"
          primaryButtonAction={() => {
            if (quotationId) navigate(`/quotations/new?id=${quotationId}`);
          }}
          listItems={[]}
          isValid
        />
      </Box>
    );
  }

  return !quotation ? (
    <EmptySection label="Quotation not found!" />
  ) : (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <StatusChip
          label={getQuotationStatusStyles(quotation.status).label}
          color={getQuotationStatusStyles(quotation.status).color}
          size="small"
          variant="filled"
        />
      </Box>
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
              <Label text="Customer Details" required />
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
                      <Typography variant="subtitle2" component="p">
                        Customer Number
                      </Typography>
                      {/* TODO: Show customer number */}
                      <Typography variant="caption" component="p">
                        C-7893001
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
              <Label text="Unit Details" required />

              {unit ? (
                <SelectCard
                  header={<Typography variant="body2">{unit.model}</Typography>}
                  body={
                    <>
                      <Typography variant="caption">
                        {unit.address.fullName}
                      </Typography>
                      <Typography variant="subtitle2" component="p">
                        Unit Number
                      </Typography>
                      <Typography variant="caption" component="p">
                        {unit.number}
                      </Typography>
                    </>
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
              <Typography>{formatDate(quotation.meta.createdAt)}</Typography>
            </Box>
            <Box>
              <Label text="Created By" />
              <Typography>{`${user?.userAccount.firstName} ${user?.userAccount.lastName}`}</Typography>
            </Box>
          </Box>
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Subject" required />
          </InputLabel>
          <TextField
            size="small"
            id="subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.subject && formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
            minRows={1}
            maxRows={3}
            multiline
            fullWidth
          />
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Description" required />
          </InputLabel>
          <TextField
            size="small"
            id="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.description && formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
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
                  label="Article"
                  buttonProps={{
                    variant: 'contained',
                    sx: {alignSelf: 'self-start'},
                    startIcon: <AddIcon />,
                    onClick: () => setIsArticleModalOpen(true),
                  }}
                />
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
        primaryButtonLabel="Send"
        primaryButtonAction={() => {
          setPublish(true);
          formik.handleSubmit();
        }}
        listItems={[
          {
            label: 'Save Draft',
            icon: <DraftsIcon />,
            onClick: () => {
              setPublish(false);
              formik.handleSubmit();
            },
            showBorder: true,
          },
          {
            label: 'Duplicate',
            icon: <CopyAllIcon />,
            onClick: () => {
              navigate(`/quotations/new?id=${quotationId}`);
            },
          },
          {
            label: 'Download',
            icon: <FileDownloadIcon />,
            onClick: () => {
              window.open(
                `${process.env.REACT_APP_BASE_URL}/QuotationPDF.pdf`,
                '_blank',
              );
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
