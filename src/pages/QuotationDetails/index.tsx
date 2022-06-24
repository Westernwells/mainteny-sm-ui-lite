import {useEffect, useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {InputLabel, TextField} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {A4Layout} from 'components/A4Layout';
import {SelectModal} from 'components/SelectModal';
import {SelectButton} from 'components/SelectButton';
import {SelectCard} from 'components/SelectCard';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {StatusChip} from 'components/StatusChip';
import {Button} from 'components/Button';
import DraftsIcon from '@mui/icons-material/Drafts';
import CopyAllIcon from '@mui/icons-material/CopyAll';

import {Elevator, ElevatorSimpleView, ElevatorView} from 'models/elevator';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {ArticleView} from 'models/article';
import {
  QuotationItemRecord,
  QuotationStatus,
  UpdateQuotation,
} from 'models/quotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  useQuotationDetails,
  useUpdateQuotation,
} from 'hooks/reactQuery/useQuotation';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ArticlesModalDataGrid} from 'components/ArticleModalDataGrid';
import {PdfGenerationStatus, WithOptional} from 'models/misc';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {Label} from './Components/Label';
import {BottomDrawer} from './Components/BottomDrawer';
import {QuotationRow} from './Components/QuotationRow';
import {CustomersDataGrid} from './DataGrid/CustomersDataGrid';
import {UnitsDataGrid} from './DataGrid/UnitsDataGrid';
import {QuotationHeader} from './Components/QuotationHeader';
import {Quotation} from './Quotation';

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

  const {data: downloadUrl} = useDownloadUrl(
    isFetched &&
      quotation!.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE
      ? ([quotation!.additionalInfo.pdfPath] as string[])
      : [],
  );

  const {mutate: updateQuotation} = useUpdateQuotation();

  const [isDrawerOpen] = useState(true);

  const [publish, setPublish] = useState(false);

  const {user} = useUserSession();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwnerView | PropertyOwnerSimpleView | null
  >(null);
  const [unit, setUnit] = useState<ElevatorSimpleView | Elevator | null>(null);
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

  const handleSelectCustomer = (row: PropertyOwnerView) => {
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
      setCustomer(unit.propertyOwner as PropertyOwnerSimpleView);
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
      <Quotation
        downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
        quotation={quotation}
      />
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
      <A4Layout placeholder="Quotation" number={quotation.number}>
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
                        {customer.postalAddress.fullName}
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
        <ArticlesModalDataGrid setRowItem={handleSelectQuotationItem} />
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
