import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {FormInput} from 'components/form/FormInput';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {CheckList} from 'models/checklist';
import {getQuestionsGroupedByCategory, getOptions} from 'utils/checklist';

interface Props {
  checklist: Partial<CheckList>;
}

export const ChecklistPreview = ({checklist}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const categories = getQuestionsGroupedByCategory(checklist?.questions ?? []);
  const options = getOptions(checklist?.questions ?? []);

  return (
    <PageCard
      headerLabel="Basic Information"
      containerStyles={{
        mb: '5rem',
        mt: '1.5rem',
        width: '100%',
        maxWidth: '57rem',
        alignSelf: 'center',
      }}
      headerStyles={{mt: '1rem'}}>
      <Grid container pb={6}>
        <Grid item xs={12} md={6}>
          <FormInput
            props={{
              label: t('Checklist name'),
              variant: 'outlined',
              value: checklist.name,
              disabled: true,
              sx: {
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: theme.palette.text.primary,
                },
              },
              InputLabelProps: {
                style: {color: theme.palette.text.secondary},
              },
            }}
          />
        </Grid>
      </Grid>

      {categories.map((category) => (
        <Box
          key={category.name}
          p={4}
          mb={2}
          bgcolor={theme.palette.inputBackground.main}>
          <Typography variant="h6">{category.name}</Typography>
          <Box pt={1.8}>
            {category.questions.map((item, questionIndex) => (
              <Typography key={item.id} variant="body1" py={0.5}>
                {questionIndex + 1}. {item.question}
              </Typography>
            ))}
          </Box>
        </Box>
      ))}

      {/* OPTIONS */}
      <Typography variant="h6" pt={2}>
        {t('Option per task')}
      </Typography>
      <Grid container pt={2}>
        {options.map((option) => (
          <Grid item xs={12} key={option.id}>
            <FormCheckbox checked={false} label={option.text} />
          </Grid>
        ))}
      </Grid>
    </PageCard>
  );
};

export default ChecklistPreview;
