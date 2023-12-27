import React, {useContext, useEffect, useState} from 'react';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {useTranslation} from 'react-i18next';
import {
  IconButton,
  TableCell,
  TableRow,
  TextField,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {useFormik} from 'formik';
import {DiscountType, InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';
import {MeasurementUnit} from 'models/articleForm';
import {Button} from 'components/Button';
import {LanguageContext} from 'context/LanguageProvider';
import {useCurrentCurrency} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {FormSelect} from './form/FormSelect';

interface Props {
  articleItem: InvoiceItemRecord<Amount>;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItems: React.Dispatch<React.SetStateAction<InvoiceItemRecord<Amount>[]>>;
}

export const ArticleItemRowNEW = ({
  articleItem,
  index,
  deleteItem,
  setItems,
}: Props) => {
  // console.log(
  //   '🚀 ~ file: ArticleItemRowNEW.tsx:30 ~ articleItem:',
  //   articleItem,
  // );
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  // const [name, setName] = useState(articleItem.name);
  // const [description, setDescription] = useState<string>(
  //   articleItem.description,
  // );
  const [showDescription, setShowDescription] = useState<boolean>(
    !!articleItem.description,
  );
  // const [quantity, setQuantity] = useState<number>(articleItem.quantity);
  // const [percentageVat, setPercentageVat] = useState(
  //   // user?.userAccount?.serviceCompany?.settings?.percentageVat ?? 0,
  //   articleItem.unitAmount.percentageVat,
  // );
  // const [price, setPrice] = useState(
  //   articleItem.unitAmount.netAmount /
  //     10 ** articleItem.unitAmount.fractionDigits!,
  // );
  // const [discount, setDiscount] = useState<Discount>(
  //   articleItem.discount ?? {
  //     type: DiscountType.AMOUNT,
  //     amount: {
  //       value: 0,
  //       currency: currentCurrency.code,
  //       fractionDigits: currentCurrency.fractionDigits,
  //     },
  //   },
  // );

  const formik = useFormik<InvoiceItemRecord<Amount>>({
    initialValues: articleItem,
    onSubmit: () => {},
  });

  // const price =
  //   formik.values.discount?.type === DiscountType.AMOUNT
  //     ? formik.values.unitAmount.netAmount -
  //       (formik.values.discount?.amount?.value ?? 0) /
  //         10 ** formik.values.unitAmount.fractionDigits!
  //     : applyDiscount(
  //         formik.values.unitAmount.netAmount,
  //         formik.values.discount?.percentage ?? 0,
  //       ) /
  //       10 ** formik.values.unitAmount.fractionDigits!;
  const price =
    formik.values.unitAmount.netAmount /
    10 ** formik.values.unitAmount.fractionDigits!;
  console.log(
    '🚀 ~ file: ArticleItemRowNEW.tsx:84 ~ price:',
    formik.values.unitAmount.netAmount,
    price,
  );

  // const totalPriceExclVat = price * formik.values.quantity;
  const totalPriceExclVat = applyDiscount({
    actualValue: price * formik.values.quantity,
    ...(formik.values.discount?.type === DiscountType.AMOUNT
      ? {amount: formik.values.discount?.amount?.value ?? 0}
      : {percentage: formik.values.discount?.percentage ?? 0}),
  });

  useEffect(() => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...formik.values,
        unitAmount: {
          ...formik.values.unitAmount,
          netAmount: fixRounding(
            price * 10 ** formik.values.unitAmount.fractionDigits,
            2,
          ),
        },
      };
      return newItems;
    });
  }, [formik.values]);

  const {language: selectedLng} = useContext(LanguageContext);

  const handleDiscountTypeChange = () => {
    formik.setFieldValue('discount', {
      ...formik.values.discount,
      type:
        formik.values?.discount?.type === DiscountType.AMOUNT
          ? DiscountType.PERCENTAGE
          : DiscountType.AMOUNT,
      amount: {
        value: 0,
        currency: currentCurrency.code,
        fractionDigits: currentCurrency.fractionDigits,
      },
      percentage: 0,
    });
  };

  const handleDiscountValueChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (formik.values.discount?.type === DiscountType.AMOUNT) {
      formik.setFieldValue('discount', {
        ...formik.values.discount,
        amount: {
          value: floatValue || 0,
          currency: currentCurrency.code,
        },
      });
    } else {
      formik.setFieldValue('discount', {
        ...formik.values.discount,
        percentage: floatValue || 0,
      });
    }
  };

  return (
    <>
      <TableRow>
        {/* <Box
        px=".5em"
        sx={{
          display: 'grid',
          gridTemplateColumns: isPartial
            ? '3ch minmax(24ch, 2fr) repeat(4, minmax(10ch, 16ch))'
            : isCreditNote
            ? '3ch minmax(24ch, 2fr) minmax(16ch, 0.5fr)'
            : '3ch minmax(24ch, 2fr) minmax(10ch, 16ch) repeat(2, minmax(6ch, 10ch)) minmax(12ch, 18ch)',
          placeItems: 'start',
          gap: '.5em',
        }}> */}
        {/* <Box sx={{marginTop: '0.5rem'}} alignSelf="flex-start">
        {index + 1}
      </Box> */}
        <TableCell>{index + 1}</TableCell>
        {/* <Box sx={{justifySelf: 'stretch'}}> */}
        {/* colSpan={3} */}
        <TableCell>
          <TextField
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            size="small"
            fullWidth
            sx={{width: '100%'}}
          />
        </TableCell>
        {/* </Box> */}

        <TableCell>
          <NumericFormat
            value={price !== 0 ? price : ''}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {currentCurrency.symbol}
                </InputAdornment>
              ),
            }}
            onValueChange={(values) => {
              const {floatValue} = values;
              if (floatValue) {
                console.log(
                  '🚀 ~ file: ArticleItemRowNEW.tsx:203 ~ floatValue:',
                  floatValue,
                );
                // setPrice(floatValue);
                formik.setFieldValue(
                  'unitAmount.netAmount',
                  floatValue * 10 ** formik.values.unitAmount.fractionDigits,
                );
              } else {
                // setPrice(0);
                formik.setFieldValue('unitAmount.netAmount', 0);
              }
            }}
          />
        </TableCell>

        <TableCell>
          <NumericFormat
            value={formik.values.quantity !== 0 ? formik.values.quantity : ''}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              min: 0,
              max: Infinity,
              step: '0.05',
            }}
            size="small"
            onValueChange={(values) => {
              const {floatValue} = values;
              if (floatValue) {
                // setQuantity(floatValue);
                formik.setFieldValue('quantity', floatValue);
              } else {
                // setQuantity(0);
                formik.setFieldValue('quantity', 0);
              }
            }}
          />
        </TableCell>

        <TableCell>
          <NumericFormat
            value={
              formik.values.unitAmount.percentageVat !== 0
                ? formik.values.unitAmount.percentageVat
                : ''
            }
            customInput={TextField}
            suffix="%"
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              min: 0,
              max: Infinity,
              step: '0.05',
              label: 'VAT',
            }}
            sx={
              {
                // width: '120px',
                // letterSpacing: '0.02em',
                // maxWidth: '150px',
              }
            }
            size="small"
            onValueChange={(values) => {
              const {floatValue} = values;
              if (floatValue) {
                // setPercentageVat(floatValue);
                formik.setFieldValue('unitAmount.percentageVat', floatValue);
              } else {
                // setPercentageVat(0);
                formik.setFieldValue('unitAmount.percentageVat', 0);
              }
            }}
          />
        </TableCell>

        <TableCell>
          {/* <TextField
            defaultValue={t(articleItem.article?.unit ?? '')}
            size="small"
            disabled
          /> */}
          <FormSelect
            // containerStyles={{...containerStyles}}
            labelId="select-unit-label"
            label=""
            options={Object.keys(MeasurementUnit).map((item) => ({
              label: item,
              value: item,
            }))}
            selectProps={{
              id: 'select-unit',
              value: formik.values.article?.unit,
              onChange: formik.handleChange,
              // error: !!(formik.touched.unit && formik.errors.unit),
              placeholder: t('Select Unit'),
              name: 'article.unit',
            }}
            // required
          />
        </TableCell>

        {/* DISCOUNT */}
        <TableCell>
          <NumericFormat
            value={
              formik.values.discount?.type === DiscountType.AMOUNT
                ? formik.values.discount?.amount?.value
                : formik.values.discount?.percentage
            }
            max={
              formik.values.discount?.type === DiscountType.AMOUNT
                ? formik.values.discount?.amount?.value
                : 100
            }
            min={0}
            isAllowed={(values) => {
              const {floatValue} = values;
              if (!floatValue) {
                return true;
              }

              return (
                formik.values.discount?.type === DiscountType.AMOUNT ||
                floatValue <= 100
              );
            }}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
            sx={{
              // pr: 0,
              '& .MuiInputBase-root': {
                pr: 0,
              },
              // "& .MuiInputAdornment-root": {
              //   height: "100%",
              //   maxHeight: "100%",
              // },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  component={IconButton}
                  position="end"
                  sx={{
                    // padding: '27.5px 14px',
                    // py: '27.5px',
                    // px: "14px",
                    py: 2,
                    height: '100%',
                    bgcolor: 'action.hover',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={handleDiscountTypeChange}
                  size="small">
                  {/* <IconButton
                    onClick={handleDiscountTypeChange}
                    size="small"
                    sx={{bgcolor: 'action.hover'}}> */}
                  {formik.values.discount?.type === DiscountType.AMOUNT
                    ? currentCurrency.symbol
                    : '%'}
                  {/* </IconButton> */}
                </InputAdornment>
              ),
            }}
            onValueChange={handleDiscountValueChange}
          />
        </TableCell>

        <TableCell>
          <NumericFormat
            value={totalPriceExclVat}
            customInput={TextField}
            decimalScale={2}
            fixedDecimalScale
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
            disabled
          />
        </TableCell>

        <TableCell>
          <IconButton onClick={() => deleteItem(index)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {showDescription ? (
        <>
          <TableRow>
            <TableCell />
            <TableCell
              colSpan={7}
              // sx={{
              //   [`& .${tableCellClasses.body}`]: {
              //     p: 0,
              //   },
              // }}
            >
              <TextField
                name="description"
                size="small"
                placeholder={t('Description')}
                multiline
                fullWidth
                value={formik.values.description}
                minRows={4}
                maxRows={4}
                onChange={formik.handleChange}
                sx={{mt: 0.5}}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell
              colSpan={7}
              // sx={{
              //   [`& .${tableCellClasses.root}`]: {
              //     p: 0,
              //   },
              // }}
            >
              <Button
                label="Remove Description"
                buttonProps={{
                  variant: 'text',
                  size: 'small',
                  onClick: () => {
                    // setDescription('');
                    formik.setFieldValue('description', '');
                    setShowDescription(false);
                  },
                  sx: {
                    // bgcolor: '#00D1FF14',
                    color: 'error.main',
                    fontWeight: 300,
                    px: 0,
                  },
                }}
              />
            </TableCell>
          </TableRow>
        </>
      ) : (
        <TableRow>
          <TableCell />
          <TableCell colSpan={7}>
            <Button
              label="Add Description"
              buttonProps={{
                variant: 'text',
                size: 'small',
                onClick: () => setShowDescription(true),
                sx: {
                  // bgcolor: '#00D1FF14',
                  color: 'text.secondary',
                  fontWeight: 300,
                  px: 0,
                },
              }}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
