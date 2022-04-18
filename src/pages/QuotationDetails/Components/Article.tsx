import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {ArticleView} from '../model';

interface Props {
  article: ArticleView;
  index: number;
  deleteArticle: (article: ArticleView) => void;
}

export const Article = ({article, index, deleteArticle}: Props) => {
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState<string | null>(null);

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

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
            value={article.description}
            size="small"
            fullWidth
            sx={{width: '100%'}}
          />
          {description && (
            <TextField
              multiline
              fullWidth
              value={description}
              maxRows={3}
              onChange={handleDescriptionChange}
              sx={{mt: '.5em'}}
            />
          )}
        </Box>
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
        <TextField defaultValue="pau" size="small" sx={{maxWidth: '10ch'}} />
        <TextField
          value={article.unitPriceNumber}
          size="small"
          sx={{maxWidth: '10ch'}}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
        <TextField
          value={article.unitPriceNumber * quantity}
          size="small"
          disabled
          sx={{maxWidth: '10ch', justifySelf: 'end'}}
        />
      </Box>
      <Box sx={{float: 'right', mt: '1em'}}>
        {!description && (
          <Button
            size="small"
            endIcon={<EditIcon />}
            onClick={() => setDescription(' ')}
            sx={{
              textTransform: 'capitalize',
            }}>
            Add Description
          </Button>
        )}
        <Button
          size="small"
          color="error"
          endIcon={<DeleteIcon />}
          onClick={() => deleteArticle(article)}
          sx={{textTransform: 'capitalize', mx: '.5em'}}>
          Delete Article
        </Button>
      </Box>
    </Box>
  );
};
