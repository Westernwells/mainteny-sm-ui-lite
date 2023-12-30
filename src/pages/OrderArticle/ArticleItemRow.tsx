import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {ArticleOrderItemRecord} from 'models/article';
import {Button} from 'components/Button';
import {useTranslation} from 'react-i18next';

interface Props<T> {
  articleItem: T;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export const ArticleItemRow = ({
  articleItem,
  index,
  deleteItem,
  setItems,
}: Props<ArticleOrderItemRecord>) => {
  const {t} = useTranslation();
  const [name, setName] = useState(articleItem.articleName);
  const [supplierArticleNumber, setSupplierArticleNumber] = useState(
    articleItem.supplierArticleNumber,
  );
  const [description, setDescription] = useState<string>(
    articleItem.description,
  );
  const [quantity, setQuantity] = useState(articleItem.quantity);
  const [unit, setUnit] = useState(articleItem.unit);

  useEffect(() => {
    articleItem.articleName = name;
    articleItem.supplierArticleNumber = supplierArticleNumber;
    articleItem.quantity = quantity;
    articleItem.unit = unit;
    if (description) articleItem.description = description;
    else articleItem.description = ' ';

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        item.articleId === articleItem.articleId && itemIndex === index
          ? articleItem
          : item,
      ),
    );
  }, [name, supplierArticleNumber, quantity, unit, description]);

  return (
    <Box boxShadow="0px 4px 15px 0px #90909033" bgcolor="grey.50" p="1rem">
      <Box
        px=".5em"
        sx={{
          display: 'grid',
          gridTemplateColumns: '3ch 2fr 2fr 1fr 1fr',
          placeItems: 'start',
          gap: '.5em',
        }}>
        <Box alignSelf="center">{index + 1}</Box>
        <Box sx={{justifySelf: 'stretch'}}>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
            sx={{width: '100%'}}
            required
          />
          {description.trim() && (
            <TextField
              size="small"
              multiline
              fullWidth
              value={description}
              minRows={4}
              maxRows={6}
              onChange={(e) => setDescription(e.target.value)}
              sx={{mt: '.5em'}}
            />
          )}
        </Box>
        <TextField
          value={supplierArticleNumber}
          onChange={(e) => setSupplierArticleNumber(e.target.value)}
          size="small"
          fullWidth
          sx={{width: '100%'}}
          required
        />
        <TextField
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          type="number"
          inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
          size="small"
          required
        />
        <TextField
          value={t(unit)}
          onChange={(e) => setUnit(e.target.value)}
          size="small"
          required
        />
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
        <Button
          label="Delete Article"
          buttonProps={{
            color: 'error',
            endIcon: <DeleteIcon />,
            onClick: () => deleteItem(index),
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
