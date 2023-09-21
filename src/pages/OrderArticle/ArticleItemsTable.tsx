import {Dispatch, SetStateAction, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import {ArticleOrderItemRecord, ArticleView} from 'models/article';
import {Button} from 'components/Button';
import {FormLabel} from 'components/form/FormLabel';
import {SelectModal} from 'components/SelectModal';
import {ArticlesDataGrid} from 'components/DataGrid/ArticlesDataGrid';
import {SelectButton} from 'components/SelectButton';
import {SearchInput} from 'components/SearchInput';
import {ArticleItemRow} from './ArticleItemRow';

interface Props<T> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
}

export const ArticleItemsTable = ({
  items,
  setItems,
}: Props<ArticleOrderItemRecord>) => {
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const articleViewToItem = (article: ArticleView): ArticleOrderItemRecord => {
    const record: ArticleOrderItemRecord = {
      articleId: article.id,
      articleName: article.name,
      supplierArticleNumber: article.externalId,
      quantity: 1,
      unit: article.unit,
      description: article.description,
    };
    return record;
  };

  const deleteItem = (item: ArticleOrderItemRecord) => {
    const newItems = items.filter((i) => i !== item);
    setItems(newItems);
  };

  const handleSelectItem = (row: ArticleView) => {
    if (items.filter((item) => item.articleId === row.id).length === 0) {
      setItems([...items, articleViewToItem(row)]);
    }

    setIsArticleModalOpen(false);
  };

  return (
    <Box mt="1rem">
      <Box
        bgcolor="grey.50"
        borderRadius="4px"
        py="0.5rem"
        px="1.5rem"
        sx={{
          display: 'grid',
          gridTemplateColumns: '5ch 2fr 2fr 1fr 1fr',
          placeItems: 'center start',
          gap: '.5em',
        }}>
        <FormLabel text="No." textTranslationContext="number" />
        <FormLabel text="Article" sx={{justifySelf: 'start'}} />
        <FormLabel text="Supplier Article Number" />
        <FormLabel text="Quantity" />
        <FormLabel text="Unit" />
      </Box>
      <Box
        bgcolor="grey.50"
        borderRadius="4px"
        display="flex"
        flexDirection="column"
        my="1em"
        p="1rem"
        gap="1em">
        {items.map((item, index) => (
          <ArticleItemRow
            key={item.articleId}
            articleItem={item}
            index={index + 1}
            deleteItem={deleteItem}
            setItems={setItems}
          />
        ))}
        {items.length ? (
          <Button
            label="Article"
            buttonProps={{
              variant: 'outlined',
              sx: {
                alignSelf: 'self-start',
                color: 'primary.main',
                background: 'transparent',
              },
              startIcon: <AddIcon />,
              onClick: () => setIsArticleModalOpen(true),
            }}
          />
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
      <SelectModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        header="Select Article">
        <Box sx={{py: 2}}>
          <SearchInput
            variant="outlined"
            label="Search"
            onValueChanged={(value) => setSearch(value)}
          />
        </Box>
        <ArticlesDataGrid setRowItem={handleSelectItem} search={search} />
      </SelectModal>
    </Box>
  );
};
