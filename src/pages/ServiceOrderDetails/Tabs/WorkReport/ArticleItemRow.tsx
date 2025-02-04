import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {NumericFormat} from 'react-number-format';
import {ServiceOrderArticleView} from 'models/service-order';
import {Button} from 'components/Button';
import {LanguageContext} from 'context/LanguageProvider';
import DOMPurify from 'dompurify';
import {getDecimalSeparator, getThousandsSeparator} from 'utils/currency';
import RichTextField from '../../../../components/RichTextField';

interface Props<T> {
  articleItem: T;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  disableButton: boolean;
}

export const ArticleItemRow = ({
  articleItem,
  index,
  deleteItem,
  setItems,
  disableButton,
}: Props<ServiceOrderArticleView>) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const [description, setDescription] = useState<string>(
    articleItem.description,
  );
  const [showDescription, setShowDescription] = useState<boolean>(
    !!articleItem.description,
  );
  const [quantity, setQuantity] = useState(articleItem.quantity);

  useEffect(() => {
    const updatedArticleItem = {
      ...articleItem,
      quantity,
      description,
    };

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        item.article.id === updatedArticleItem.article.id && itemIndex === index
          ? updatedArticleItem
          : item,
      ),
    );
  }, [quantity, description]);

  return (
    <Box boxShadow="0px 4px 15px 0px #90909033" bgcolor="grey.50" p="1rem">
      <Box
        px=".5em"
        sx={{
          display: 'grid',
          gridTemplateColumns: '3ch 2fr 0.4fr 0.6fr 0.6fr',
          placeItems: 'start',
          gap: '1.5rem',
          alignItems: 'baseline',
        }}>
        <Typography variant="body2">{index + 1}</Typography>

        <Box
          sx={{
            justifySelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
          }}
          gap={1}>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(articleItem.name),
            }}
          />
          {showDescription && (
            <RichTextField
              placeholder={t('Description')}
              html={description || ''}
              minRows={4}
              updateHtml={(h) => setDescription(h)}
            />
          )}
        </Box>

        <Typography variant="body2" sx={{ml: 'auto'}}>
          {articleItem.article?.externalId || '-'}
        </Typography>
        <NumericFormat
          value={quantity !== 0 ? quantity : ''}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
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
        <Typography variant="body2">
          {articleItem.article?.unit || '-'}
        </Typography>
      </Box>
      <Box sx={{float: 'right', mt: '2rem'}}>
        {!showDescription && (
          <Button
            buttonProps={{
              size: 'small',
              disabled: disableButton,
              endIcon: <EditIcon />,
              onClick: () => setShowDescription(true),
              sx: {
                bgcolor: '#00D1FF14',
                px: '7px',
                py: '6px',
              },
            }}>
            <Typography variant="inputLabel">{t('Add Description')}</Typography>
          </Button>
        )}
        <Button
          buttonProps={{
            size: 'small',
            color: 'error',
            disabled: disableButton,
            endIcon: <DeleteIcon />,
            onClick: () => deleteItem(index),
            sx: {
              bgcolor: '#FF182F14',
              px: '7px',
              py: '6px',
              mx: '0.5rem',
            },
          }}>
          <Typography variant="inputLabel">{t('Delete Article')}</Typography>
        </Button>
      </Box>
    </Box>
  );
};
