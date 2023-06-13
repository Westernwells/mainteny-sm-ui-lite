/* eslint-disable array-callback-return */
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import {NumericFormat} from 'react-number-format';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';
import {Button} from 'components/Button';
import {useCurrentCurrency} from 'utils/currency';
import {LanguageContext} from 'context/LanguageProvider';

interface Props<T> {
  articleItem: T;
  index: number;
  deleteItem: (item: T) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  totalPrice: number;
  setTotalPrice: Dispatch<SetStateAction<number>>;
  isPartial?: boolean;
  isCreditNote?: boolean;
  currencySymbol?: string;
  partialPrice: number;
  setPartialPrice: Dispatch<SetStateAction<number>>;
  newPartialTotal: number;
  setNewPartialTotal: Dispatch<SetStateAction<number>>;
}

export const ArticleItemRow = ({
  articleItem,
  index,
  deleteItem,
  setItems,
  totalPrice,
  setTotalPrice,
  isPartial,
  isCreditNote,
  currencySymbol,
  partialPrice,
  setPartialPrice,
  newPartialTotal,
  setNewPartialTotal,
}: Props<QuotationItemRecord | InvoiceItemRecord<Amount>>) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [name, setName] = useState(articleItem.name);
  const [description, setDescription] = useState<string>(
    articleItem.description,
  );
  const [quantity, setQuantity] = useState<number>(articleItem.quantity);
  const [price, setPrice] = useState(
    articleItem.unitAmount.netAmount /
      10 ** articleItem.unitAmount.fractionDigits!,
  );

  const {language: selectedLng} = useContext(LanguageContext);

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  useEffect(() => {
    articleItem.quantity = quantity;

    setItems((prev) =>
      prev.map((item) => {
        if (item.articleId === articleItem.articleId) {
          return {
            ...item,
            quantity: articleItem.quantity,
          };
        }
        return item;
      }),
    );
  }, [quantity]);

  useEffect(() => {
    articleItem.name = name;

    setItems((prev) =>
      prev.map((item) => {
        if (item.articleId === articleItem.articleId) {
          return {
            ...item,
            name: articleItem.name,
          };
        }
        return item;
      }),
    );
  }, [name]);

  useEffect(() => {
    articleItem.description = description;

    setItems((prev) =>
      prev.map((item) => {
        if (item.articleId === articleItem.articleId) {
          return {
            ...item,
            description: articleItem.description,
          };
        }
        return item;
      }),
    );
  }, [description]);

  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.articleId === articleItem.articleId) {
          return {
            ...item,
            unitAmount: {
              ...item.unitAmount,
              netAmount: isPartial
                ? partialPrice * 10 ** item.unitAmount.fractionDigits!
                : price * 10 ** item.unitAmount.fractionDigits!,
            },
          };
        }
        return item;
      }),
    );
  }, [price, partialPrice]);

  useEffect(() => {
    if (description.trim()) {
      setDescription(`${t('Description')}`);
    }
  }, [selectedLng]);

  return (
    <Box boxShadow="0px 4px 15px 0px #90909033" py="1em">
      <Box
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
        }}>
        <Box alignSelf="center">{index}</Box>
        <Box sx={{justifySelf: 'stretch'}}>
          <TextField
            value={name}
            onChange={handleNameChange}
            size="small"
            fullWidth
            sx={{width: '100%'}}
          />
          {description.trim() && (
            <TextField
              size="small"
              multiline
              fullWidth
              value={description}
              minRows={4}
              maxRows={6}
              onChange={handleDescriptionChange}
              sx={{mt: '.5em'}}
            />
          )}
        </Box>

        {isPartial && (
          <>
            <NumericFormat
              value={
                (isPartial ? newPartialTotal : totalPrice) *
                (1 + articleItem.unitAmount.percentageVat / 100)
              }
              disabled
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currentCurrency.symbol}
                  </InputAdornment>
                ),
              }}
            />

            <NumericFormat
              value={isPartial ? newPartialTotal : totalPrice}
              customInput={TextField}
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
                  if (isPartial) {
                    setNewPartialTotal(floatValue);
                  } else {
                    setTotalPrice(floatValue);
                  }
                } else {
                  setTotalPrice(0);
                  setNewPartialTotal(0);
                }
              }}
            />

            <NumericFormat
              value={isPartial ? newPartialTotal - partialPrice : totalPrice}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currentCurrency.symbol}
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}

        <NumericFormat
          value={isPartial ? partialPrice : price}
          customInput={TextField}
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
                {currencySymbol || currentCurrency.symbol}
              </InputAdornment>
            ),
          }}
          onValueChange={(values) => {
            const {floatValue} = values;
            if (floatValue) {
              if (isPartial) {
                setPartialPrice(floatValue);
              } else {
                setPrice(floatValue);
              }
            } else {
              setPrice(0);
              setPartialPrice(0);
            }
          }}
        />

        {!isPartial && !isCreditNote && (
          <>
            <NumericFormat
              value={quantity}
              customInput={TextField}
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
                  setQuantity(floatValue);
                } else {
                  setQuantity(0);
                }
              }}
            />

            <TextField
              defaultValue={t(articleItem.articleUnit)}
              size="small"
              disabled
            />

            <NumericFormat
              value={price * quantity}
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
          </>
        )}
      </Box>
      <Box sx={{float: 'right', mt: '1em'}}>
        {!description.trim() && !isCreditNote && (
          <Button
            label="Add Description"
            buttonProps={{
              size: 'small',
              endIcon: <EditIcon />,
              onClick: () => setDescription(`${t('Description')}`),
              sx: {
                bgcolor: '#00D1FF14',
              },
            }}
          />
        )}
        {!isPartial && !isCreditNote && (
          <Button
            label="Delete Article"
            buttonProps={{
              color: 'error',
              endIcon: <DeleteIcon />,
              onClick: () => deleteItem(articleItem),
              sx: {
                bgcolor: '#FF182F14',
                mx: '.5em',
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};
