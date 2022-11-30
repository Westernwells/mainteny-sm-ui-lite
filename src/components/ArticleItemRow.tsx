import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
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

interface Props<T> {
  articleItem: T;
  index: number;
  deleteItem: (item: T) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  total: number;
  setTotal: Dispatch<SetStateAction<number>>;
  isPartial?: boolean;
}

export const ArticleItemRow = ({
  articleItem,
  index,
  deleteItem,
  setItems,
  total,
  setTotal,
  isPartial,
}: Props<QuotationItemRecord | InvoiceItemRecord<Amount>>) => {
  const currentCurrency = useCurrentCurrency();
  const [name, setName] = useState(articleItem.name);
  const [description, setDescription] = useState<string>(
    articleItem.description,
  );
  const [quantity, setQuantity] = useState(articleItem.quantity);
  const [price, setPrice] = useState(
    articleItem.unitAmount.netAmount /
      10 ** articleItem.unitAmount.fractionDigits!,
  );

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  const handlePriceChange = (e: any) => {
    setPrice(e.target.value);
  };

  const handleTotalChange = (e: any) => {
    setTotal(e.target.value);
  };

  useEffect(() => {
    articleItem.quantity = quantity;

    setItems((prev) =>
      prev.map((item) =>
        item.articleId === articleItem.articleId ? articleItem : item,
      ),
    );
  }, [quantity]);

  useEffect(() => {
    if (description) articleItem.description = description;
    else articleItem.description = ' ';

    setItems((prev) =>
      prev.map((item) =>
        item.articleId === articleItem.articleId ? articleItem : item,
      ),
    );
  }, [description]);

  useEffect(() => {
    articleItem.name = name;

    setItems((prev) =>
      prev.map((item) =>
        item.articleId === articleItem.articleId ? articleItem : item,
      ),
    );
  }, [name]);

  useEffect(() => {
    articleItem.unitAmount.netAmount =
      price * 10 ** articleItem.unitAmount.fractionDigits!;
    articleItem.unitAmount.vat =
      price *
      (articleItem.unitAmount.percentageVat / 100) *
      10 ** articleItem.unitAmount.fractionDigits!;

    setItems((prev) =>
      prev.map((item) =>
        item.articleId === articleItem.articleId ? articleItem : item,
      ),
    );
  }, [price]);

  return (
    <Box boxShadow="0px 4px 15px 0px #90909033" py="1em">
      <Box
        px=".5em"
        sx={{
          display: 'grid',
          gridTemplateColumns: isPartial
            ? '3ch minmax(24ch, 2fr) repeat(4, minmax(10ch, 16ch))'
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
            <TextField
              value={total * 1.19}
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
            <TextField
              value={total}
              onChange={handleTotalChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currentCurrency.symbol}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              value={total - price}
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
        <TextField
          value={price}
          onChange={handlePriceChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {currentCurrency.symbol}
              </InputAdornment>
            ),
          }}
        />
        {!isPartial && (
          <>
            <TextField
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              type="number"
              inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
              size="small"
            />
            <TextField
              defaultValue={articleItem.articleUnit}
              size="small"
              disabled
            />
            <TextField
              value={price * quantity}
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
      </Box>
      <Box sx={{float: 'right', mt: '1em'}}>
        {!description.trim() && (
          <Button
            label="Add Description"
            buttonProps={{
              size: 'small',
              endIcon: <EditIcon />,
              onClick: () => setDescription('Description:\n'),
              sx: {
                bgcolor: '#00D1FF14',
              },
            }}
          />
        )}
        {!isPartial && (
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
