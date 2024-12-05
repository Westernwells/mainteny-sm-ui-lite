import {Alert, Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {Button} from 'components/Button';
import AddIcon from '@mui/icons-material/Add';
import {ChangeEvent, Dispatch, SetStateAction, useRef} from 'react';
import {
  ElevatorDataSchemaItem,
  ElevatorDataSchemaItemWithState,
} from 'models/elevator';
import {CategoryInput} from './components/CategoryInput';
import {AddFieldInput} from './components/AddFieldInput';
import TechFieldEditDelete from './components/TechFieldEditDelete';

interface Props {
  items: ElevatorDataSchemaItemWithState[];
  categoryName: string;
  setCategoryName: Dispatch<SetStateAction<string>>;
  setItems: Dispatch<SetStateAction<ElevatorDataSchemaItemWithState[]>>;
  mode: 'create' | 'edit';
}
export const AddTechnicalData = ({
  items,
  setCategoryName,
  setItems,
  categoryName,
  mode = 'create',
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const boxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: 'smooth', // Enables smooth scrolling
      });
    }
  };

  const handleCategoryTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const addCustomField = () => {
    setItems([...items, {unit: '', name: '', type: '', isEditing: true}]);

    // Wait for elements to render before scrolling
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleFieldAddConfirm = (
    values: ElevatorDataSchemaItem,
    index: number,
  ) => {
    const itemsCopy = [...items];
    const item = {...itemsCopy[index]};
    itemsCopy[index] = {...item, ...values, isEditing: false};

    if (
      item.fromDatabase &&
      values.name.toLowerCase() !== item.name.toLowerCase()
    ) {
      const originalName = item.dataMigrationItem?.fromName ?? item.name;
      itemsCopy[index].dataMigrationItem = {
        fromName: originalName,
        toName: values.name,
      };
    }

    setItems(itemsCopy);
  };

  const handleFieldAddCancel = (index: number) => {
    const itemsCopy = [...items];
    const currentName = itemsCopy[index].name;

    if (currentName) {
      itemsCopy[index] = {...itemsCopy[index], isEditing: false};
    } else {
      itemsCopy.splice(index, 1);
    }

    setItems(itemsCopy);
  };

  const handleFieldEditStart = (index: number) => {
    const itemsCopy = [...items];
    const item = itemsCopy[index];
    itemsCopy[index] = {...item, isEditing: true};

    setItems(itemsCopy);
  };

  const handleFieldEditDelete = (index: number) => {
    const itemsCopy = [...items];

    itemsCopy.splice(index, 1);

    setItems(itemsCopy);
  };

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <Box flex={1} display="flex" flexDirection="column">
        {mode === 'create' && (
          <Alert severity="info">
            <Typography fontWeight="bold" variant="body1">
              {t('Create your own Technical Data fields')}
            </Typography>
            <Typography variant="body2" color={theme.palette.info.infoAlert}>
              {t(
                'Add and customize data input fields that best fit your needs.',
              )}
            </Typography>
          </Alert>
        )}
        {mode === 'edit' && (
          <Alert severity="warning">
            <Typography fontWeight="bold" variant="body1">
              {t('Changes will update the existing data fields.')}
            </Typography>
            <Typography variant="body2" color={theme.palette.info.infoAlert}>
              {t('Number of affected data fields {{count}}', {
                count: items.length,
              })}
            </Typography>
          </Alert>
        )}

        <Box sx={{display: 'flex', flexDirection: 'column', flex: 1}}>
          <Box mt={mode === 'create' || mode === 'edit' ? 3 : 0} mb={3}>
            <CategoryInput
              value={categoryName}
              onChange={handleCategoryTextChange}
            />
          </Box>
          <Box
            ref={boxRef}
            sx={{overflowY: 'auto', maxHeight: '45vh', pt: 0.5}}>
            {items.map((item, index) => (
              <Box key={index} mb={3}>
                {item.isEditing ? (
                  <AddFieldInput
                    initialValues={item}
                    onCancel={() => handleFieldAddCancel(index)}
                    onConfirm={(values) => handleFieldAddConfirm(values, index)}
                  />
                ) : (
                  <TechFieldEditDelete
                    onEdit={() => handleFieldEditStart(index)}
                    onDelete={() => handleFieldEditDelete(index)}
                    data={item}
                  />
                )}
              </Box>
            ))}
          </Box>
          <Box mt={1.5}>
            <Button
              buttonProps={{startIcon: <AddIcon />, onClick: addCustomField}}
              label="Custom Field"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
