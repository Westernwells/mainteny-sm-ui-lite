import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {QuotationItemRecord} from 'models/quotation';
import {Button} from 'components/Button';

interface Props {
  quotationItem: QuotationItemRecord;
  index: number;
  deleteRow: (item: QuotationItemRecord) => void;
  setRow: React.Dispatch<React.SetStateAction<QuotationItemRecord[]>>;
}

export const QuotationRow = ({
  quotationItem,
  index,
  deleteRow,
  setRow,
}: Props) => {
  const [name, setName] = useState(quotationItem.name);
  const [description, setDescription] = useState<string>(
    quotationItem.description,
  );
  const [quantity, setQuantity] = useState(quotationItem.quantity);
  const [price, setPrice] = useState(
    quotationItem.unitAmount.netAmount /
      10 ** quotationItem.unitAmount.fractionDigits!,
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
    quotationItem.quantity = quantity;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === quotationItem.articleId ? quotationItem : item,
      ),
    );
  }, [quantity]);

  useEffect(() => {
    quotationItem.description = description;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === quotationItem.articleId ? quotationItem : item,
      ),
    );
  }, [description]);

  useEffect(() => {
    quotationItem.name = name;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === quotationItem.articleId ? quotationItem : item,
      ),
    );
  }, [name]);

  useEffect(() => {
    quotationItem.unitAmount.netAmount =
      price * 10 ** quotationItem.unitAmount.fractionDigits!;
    quotationItem.unitAmount.vat =
      price *
      (quotationItem.unitAmount.percentageVat / 100) *
      10 ** quotationItem.unitAmount.fractionDigits!;

    setRow((prev) =>
      prev.map((item) =>
        item.articleId === quotationItem.articleId ? quotationItem : item,
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
          defaultValue={quotationItem.articleUnit}
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
            onClick: () => deleteRow(quotationItem),
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
