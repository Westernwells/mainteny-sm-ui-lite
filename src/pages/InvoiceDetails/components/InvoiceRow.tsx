import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';
import {Button} from 'components/Button';

interface Props {
  invoiceItem: InvoiceItemRecord<Amount>;
  index: number;
  deleteRow: (item: InvoiceItemRecord<Amount>) => void;
  setRow: React.Dispatch<React.SetStateAction<InvoiceItemRecord<Amount>[]>>;
}

export const InvoiceRow = ({invoiceItem, index, deleteRow, setRow}: Props) => {
  const [name, setName] = useState(invoiceItem.name);
  const [description, setDescription] = useState<string>(
    invoiceItem.description,
  );
  const [quantity, setQuantity] = useState(invoiceItem.quantity);
  const [price, setPrice] = useState(
    invoiceItem.unitAmount.netAmount /
      10 ** invoiceItem.unitAmount.fractionDigits!,
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

  useEffect(() => {
    invoiceItem.quantity = quantity;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === invoiceItem.articleId ? invoiceItem : item,
      ),
    );
  }, [quantity]);

  useEffect(() => {
    invoiceItem.description = description;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === invoiceItem.articleId ? invoiceItem : item,
      ),
    );
  }, [description]);

  useEffect(() => {
    invoiceItem.name = name;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === invoiceItem.articleId ? invoiceItem : item,
      ),
    );
  }, [name]);

  useEffect(() => {
    invoiceItem.unitAmount.netAmount =
      price * 10 ** invoiceItem.unitAmount.fractionDigits!;
    invoiceItem.unitAmount.vat =
      price *
      (invoiceItem.unitAmount.percentageVat / 100) *
      10 ** invoiceItem.unitAmount.fractionDigits!;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === invoiceItem.articleId ? invoiceItem : item,
      ),
    );
  }, [price]);

  return (
    <Box boxShadow="0px 4px 15px 0px #90909033" py="1em">
      <Box
        px=".5em"
        sx={{
          display: 'grid',
          gridTemplateColumns: '3ch 2fr repeat(4, 10ch)',
          placeItems: 'start center',
          gap: '.5em',
        }}>
        <Box>{index}</Box>
        <Box sx={{justifySelf: 'stretch'}}>
          <TextField
            value={name}
            onChange={handleNameChange}
            size="small"
            fullWidth
            sx={{width: '100%'}}
          />
          {description && (
            <TextField
              size="small"
              multiline
              fullWidth
              value={description}
              minRows={2}
              maxRows={4}
              onChange={handleDescriptionChange}
              sx={{mt: '.5em'}}
            />
          )}
        </Box>
        <TextField
          value={price}
          onChange={handlePriceChange}
          size="small"
          sx={{maxWidth: '10ch'}}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
        <TextField
          value={quantity}
          onChange={(e) =>
            parseInt(e.target.value, 10) >= 0 &&
            setQuantity(parseInt(e.target.value, 10))
          }
          type="number"
          inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
          size="small"
          sx={{maxWidth: '10ch'}}
        />
        <TextField
          defaultValue={invoiceItem.articleUnit}
          size="small"
          sx={{maxWidth: '10ch'}}
          disabled
        />
        <TextField
          value={price * quantity}
          size="small"
          disabled
          sx={{maxWidth: '10ch', justifySelf: 'end'}}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
      </Box>
      <Box sx={{float: 'right', mt: '1em'}}>
        {!description && (
          <Button
            label="Add Description"
            buttonProps={{
              size: 'small',
              endIcon: <EditIcon />,
              onClick: () => setDescription(' '),
              sx: {
                bgcolor: '#00D1FF14',
              },
            }}
          />
        )}
        <Button
          label=" Delete Article"
          buttonProps={{
            color: 'error',
            endIcon: <DeleteIcon />,
            onClick: () => deleteRow(invoiceItem),
            sx: {
              bgcolor: '#FF182F14',
              mx: '.5em',
            },
          }}
        />
      </Box>
    </Box>
  );
};
