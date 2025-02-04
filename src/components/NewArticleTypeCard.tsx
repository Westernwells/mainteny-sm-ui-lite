import {Typography, FormControl, RadioGroup} from '@mui/material';
import {Box} from '@mui/system';
import {Control, UseFormSetValue, Controller} from 'react-hook-form';
import {theme} from 'theme';
import {Button} from 'components/Button';
import CloseIcon from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import {ArticleType} from 'models/article';
import {useEffect} from 'react';
import {FormRadio} from './form/FormRadio';

const articleTypes = [
  {
    value: 'LABOR',
    label: 'Labor',
  },
  {
    value: 'MATERIAL',
    label: 'Material',
  },
  {
    value: 'OTHER',
    label: 'Other',
  },
];

type Props = {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  onClose: () => void;
  onSave: (newType: ArticleType, subPositionId?: string) => void;
  selectedType: ArticleType;
  subPositionId?: string;
};

const NewArticleTypeCard = ({
  control,
  setValue,
  onClose,
  onSave,
  subPositionId,
  selectedType,
}: Props) => {
  const {t} = useTranslation();

  useEffect(() => {
    if (selectedType) {
      setValue('type', selectedType);
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Typography
          sx={{
            py: 2,
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}>
          {t('Article Type')}
        </Typography>

        <Button
          buttonProps={{
            onClick: onClose,
            sx: {
              mx: 0,
              mr: -2,
              p: 1,
              minWidth: 0,
            },
          }}>
          <CloseIcon />
        </Button>
      </Box>

      <FormControl>
        <RadioGroup name="article-type-group">
          {articleTypes.map((articleType) => (
            <Box key={articleType.value}>
              <Controller
                name="type"
                control={control}
                render={({field}) => (
                  <FormRadio
                    value={articleType.value}
                    checked={field.value === articleType.value}
                    handleChange={(e) =>
                      setValue('type', e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        <Typography
                          variant="h6"
                          component="span"
                          fontSize="1.125rem"
                          fontWeight={400}
                          sx={{ml: 1}}>
                          {t(articleType.label)}
                        </Typography>
                      </Box>
                    }
                    radioProps={{
                      sx: {color: theme.palette.text.secondary},
                    }}
                  />
                )}
              />
            </Box>
          ))}
        </RadioGroup>
      </FormControl>

      <Box
        sx={{
          pt: 3,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Button
          label={t('Cancel')}
          buttonProps={{
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>

        <Button
          label={t('Save')}
          buttonProps={{
            onClick: () => {
              onSave(selectedType, subPositionId);
            },
            autoFocus: true,
            variant: 'contained',
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </Button>
      </Box>
    </>
  );
};

export default NewArticleTypeCard;
