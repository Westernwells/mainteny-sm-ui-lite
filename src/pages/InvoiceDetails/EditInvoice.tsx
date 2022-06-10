import {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import {DatePicker} from 'components/DatePicker';
import {A4Layout} from 'components/A4Layout';
import {FormLabel} from 'components/form/FormLabel';
import {SelectCard} from 'components/SelectCard';
import {SelectButton} from 'components/SelectButton';
import {SelectModal} from 'components/SelectModal';
import {Button} from 'components/Button';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DraftsIcon from '@mui/icons-material/Drafts';
import {useUpdateInvoice} from 'hooks/reactQuery/useInvoice';
import {InvoiceItemRecord, InvoiceView, UpdateInvoice} from 'models/invoice';
import {ArticleView} from 'models/article';
import {Amount, WithOptional} from 'models/misc';
import {formatDate} from 'utils/datetime';
import {formatCurrency} from 'utils/currency';
import {ArticlesDataGrid} from 'pages/QuotationDetails/DataGrid/ArticlesDataGrid';
import {BottomDrawer} from 'pages/QuotationDetails/Components/BottomDrawer';
import {InvoiceHeader} from './components/InvoiceHeader';
import {InvoiceRow} from './components/InvoiceRow';

interface Props {
  invoice: InvoiceView;
}

export const EditInvoice = ({invoice}: Props) => {
  const {id: invoiceId} = useParams();

  const {mutate: updateInvoice} = useUpdateInvoice();

  const [isDrawerOpen] = useState(true);

  const [publish, setPublish] = useState(false);

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [dueDate, setDueDate] = useState<Date | null>(
    invoice && new Date(invoice.dueDate),
  );

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemRecord<Amount>[]>(
    [],
  );

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalVat, setTotalVat] = useState(0);

  const initialValues: UpdateInvoice = {
    description: '',
    subject: '',
    dueDate: '',
    issuedDate: '',
    serviceOrderId: '',
    items: [],
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    subject: Yup.string().required('Subject is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (invoiceId) {
        updateInvoice({data: values, invoiceId, publish});
      }
    },
  });

  const handleSelectInvoiceItem = (row: ArticleView) => {
    const articleViewToInvoiceItem = (
      article: ArticleView,
    ): InvoiceItemRecord<Amount> => ({
      articleId: article.id,
      articleUnit: article.unit,
      description: article.description,
      name: article.name,
      quantity: 1,
      unitAmount: article.unitSellingAmount,
    });
    if (invoiceItems.filter((item) => item.articleId === row.id).length === 0) {
      setInvoiceItems([...invoiceItems, articleViewToInvoiceItem(row)]);
    }
    setIsArticleModalOpen(false);
  };

  const deleteInvoiceItem = (item: InvoiceItemRecord<Amount>) => {
    const newItems = invoiceItems.filter((i) => i.articleId !== item.articleId);
    setInvoiceItems(newItems);
  };

  useEffect(() => {
    if (invoiceItems.length) {
      const sum = 0;
      const vat = 0;
      setTotalPrice(
        invoiceItems
          .map(
            (item) =>
              item.quantity *
              (item.unitAmount.netAmount /
                10 ** item.unitAmount.fractionDigits!),
          )
          .reduce((prevValue, currentValue) => prevValue + currentValue, sum),
      );

      setTotalVat(
        invoiceItems
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
      invoiceItems.map(
        (item): WithOptional<InvoiceItemRecord<Amount>, 'articleUnit'> => ({
          articleId: item.articleId,
          description: item.description,
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
        }),
      ),
      true,
    );
  }, [invoiceItems]);

  useEffect(() => {
    if (invoice) {
      setInvoiceItems(
        invoice.items.map(
          (i): InvoiceItemRecord<Amount> => ({
            articleId: i.article.id,
            articleUnit: i.article.unit,
            description: i.description || i.article.description,
            name: i.name || i.article.name,
            quantity: i.quantity,
            unitAmount: i.unitAmount,
          }),
        ),
      );
      formik.setFieldValue('description', invoice.description, true);
      formik.setFieldValue('subject', invoice.subject, true);
      formik.setFieldValue('issuedDate', invoice.issuedDate, true);
      formik.setFieldValue('dueDate', invoice.dueDate, true);
      formik.setFieldValue('serviceOrderId', invoice.serviceOrder.id, true);
      formik.setFieldValue('items', invoice.items, true);
      setDueDate(new Date(invoice.dueDate));
    }
  }, []);

  useEffect(() => {
    if (dueDate)
      formik.setFieldValue(
        'dueDate',
        dueDate.toISOString().split('T')[0],
        true,
      );
  }, [dueDate]);

  return (
    <Box>
      <A4Layout placeholder="Invoice" number={invoice.number}>
        <>
          <Box display="flex" mt="1em" gap="2em">
            <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
              <Box>
                <FormLabel text="Bill From" />

                <SelectCard
                  header={
                    <Typography variant="body2">
                      {invoice.serviceCompany.name}
                    </Typography>
                  }
                  body={
                    <Typography variant="caption">
                      GmbH Ahornstrabe 21 14959 Trebbin of Thryow
                    </Typography>
                  }
                />
              </Box>
              <Box>
                <FormLabel text="Bill To" />

                <SelectCard
                  header={
                    <Typography variant="body2">
                      {invoice.propertyOwner.name}
                    </Typography>
                  }
                  body={
                    <>
                      <Typography variant="caption">
                        {invoice.propertyOwner.address.fullName}
                      </Typography>
                      <Typography variant="caption" component="p">
                        {invoice.propertyOwner.contact.phone}
                      </Typography>
                      <Typography variant="subtitle2" component="p">
                        Customer Number
                      </Typography>
                      {/* TODO: Fix customer number */}
                      <Typography variant="caption" component="p">
                        C789301
                      </Typography>
                    </>
                  }
                />
              </Box>
            </Box>
            <Box
              width="40%"
              display="flex"
              flexDirection="column"
              gap="2em"
              mt="1.5em">
              <Box>
                <FormLabel text="Order Number" />
                <Typography>{invoice.serviceOrder.number}</Typography>
              </Box>
              <Box>
                <FormLabel text="Unit Number" />
                <Typography>{invoice.serviceOrder.elevator.number}</Typography>
              </Box>
              <Box>
                <FormLabel text="Created By" />
                <Typography>{`${invoice.meta.creator?.firstName} ${invoice.meta.creator?.lastName}`}</Typography>
              </Box>
              <Box>
                <FormLabel text="Date Created" />
                <Typography>{formatDate(invoice.issuedDate)}</Typography>
              </Box>
            </Box>
          </Box>

          <Box mt="1em" width="18ch">
            <DatePicker
              defaultDate={dueDate}
              minDate={new Date()}
              getSelectedDate={(newValue) => {
                if (newValue) setDueDate(newValue);
              }}
              textFieldProps={{
                label: 'Due Date',
              }}
            />
          </Box>

          <Box mt="1em">
            <InputLabel>
              <FormLabel text="Subject" required />
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
              maxRows={2}
              multiline
              fullWidth
            />
          </Box>

          <Box mt="1em">
            <InputLabel>
              <FormLabel text="Description" required />
            </InputLabel>
            <TextField
              size="small"
              id="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                !!(formik.touched.description && formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
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
            <InvoiceHeader />
            <Box
              bgcolor="grey.50"
              borderRadius="4px"
              display="flex"
              flexDirection="column"
              my="1em"
              gap="1em">
              {invoiceItems.map((item, index) => (
                <InvoiceRow
                  key={item.articleId}
                  invoiceItem={item}
                  index={index + 1}
                  deleteRow={deleteInvoiceItem}
                  setRow={setInvoiceItems}
                />
              ))}
              {invoiceItems.length ? (
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
                        {formatCurrency(totalPrice + totalVat, {
                          currency: 'EUR',
                        })}
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
        </>
      </A4Layout>

      <SelectModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        header="Select Article">
        <ArticlesDataGrid setRowItem={handleSelectInvoiceItem} />
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
            label: 'Download',
            icon: <FileDownloadIcon />,
            onClick: () => {
              window.open(
                `${process.env.REACT_APP_BASE_URL}/INV000128.pdf`,
                '_blank',
              );
            },
          },
        ]}
        isValid={
          !!(
            formik.values.description &&
            formik.values.subject &&
            formik.values.items.length &&
            dueDate !== null
          )
        }
      />
    </Box>
  );
};
