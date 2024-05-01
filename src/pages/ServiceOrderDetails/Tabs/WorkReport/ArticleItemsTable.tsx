import {Dispatch, SetStateAction, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import {ArticleView} from 'models/article';
import {ServiceOrderArticleView} from 'models/service-order';
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
  isEdit: boolean;
}

export const ArticleItemsTable = ({
  items,
  setItems,
  isEdit,
}: Props<ServiceOrderArticleView>) => {
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const articleViewToItem = (article: ArticleView) => ({
    article,
    description: article.description,
    id: article.id,
    name: article.name,
    quantity: 1,
    serviceOrderId: '',
    unitAmount: article.unitSellingAmount,
  });

  const deleteItem = (indexPos: number) => {
    const newItems = items.filter((_, index) => indexPos !== index);
    setItems(newItems);
  };

  const handleSelectItem = (row: ArticleView) => {
    setItems([...items, articleViewToItem(row)]);
    setIsArticleModalOpen(false);
  };

  return (
    <Box mt="1rem">
      <FormLabel text="Articles & Spare parts" />
      <Box
        bgcolor="grey.50"
        display="flex"
        flexDirection="column"
        border="1px solid"
        borderColor="grey.300"
        borderRadius="4px"
        p="1rem"
        gap="1em">
        <Box
          bgcolor="grey.50"
          px="1.5rem"
          sx={{
            display: 'grid',
            gridTemplateColumns: '5ch 2fr 2fr 1fr 1fr',
            placeItems: 'center start',
            gap: '.5em',
          }}>
          <FormLabel text="No." textTranslationContext="number" />
          <FormLabel text="Description" sx={{justifySelf: 'start'}} />
          <FormLabel text="Article Number" sx={{ml: 'auto', mr: '18px'}} />
          <FormLabel text="Quantity" />
          <FormLabel text="Unit" />
        </Box>
        <Box bgcolor="grey.50" display="flex" flexDirection="column" gap="1em">
          {items.map((item, index) => (
            <ArticleItemRow
              key={index + item.article.id + item.id}
              articleItem={item}
              index={index}
              deleteItem={deleteItem}
              setItems={setItems}
              disableButton={!isEdit}
            />
          ))}
          {items.length ? (
            <Button
              label="Article"
              buttonProps={{
                variant: 'contained',
                sx: {
                  alignSelf: 'self-start',
                },
                startIcon: <AddIcon />,
                disabled: !isEdit,
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
                buttonProps={{disabled: !isEdit}}
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
    </Box>
  );
};
