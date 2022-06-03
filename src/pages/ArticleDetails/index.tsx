import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import {useParams} from 'react-router-dom';
import {useArticleDetails} from '../../hooks/reactQuery/useArticle';
import {Progress} from '../../components/Progress';
import {BackAction} from '../../components/BackAction';
import {Button} from '../../components/Button';
import {PageCard} from '../../components/PageCard';
import {ArticleView} from '../../models/article';
import {InfoCard} from '../../components/InfoCard';

// TODO Continue Article Details
export const ArticleOverView = () => {
  const {id: articleId} = useParams();
  const {data: articleDetail, isLoading} = useArticleDetails(articleId!);

  const editArticle = (article?: ArticleView) => {
    // TODO Edit article
    console.log(article);
  };

  const deleteArticle = (article?: ArticleView) => {
    // TODO Delete article
    console.log(article);
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" mb="0.5em">
        <BackAction label={'Article #'.concat(articleDetail?.number || '')} />
        <Button
          label="Delete"
          buttonProps={{
            onClick: () => deleteArticle(articleDetail),
            variant: 'outlined',
            startIcon: <DeleteIcon sx={{opacity: '1'}} color="primary" />,
          }}
        />
      </Box>
      <Grid
        container
        spacing={2}
        sx={{
          pb: '1em',
        }}>
        <Grid xs={8} item>
          <InfoCard
            containerStyles={{mb: '0.5rem'}}
            headerActionIcon={
              <CreateIcon onClick={() => editArticle(articleDetail)} />
            }
            header={
              <Box
                display="flex"
                justifyContent="space-between"
                bgcolor="grey.200"
                sx={{px: '0.5rem'}}>
                <Typography variant="subtitle1">
                  {articleDetail?.name}
                </Typography>
              </Box>
            }>
            <Box>Properties</Box>
          </InfoCard>
          <PageCard containerStyles={{mb: '0.5rem'}}>Panel 2</PageCard>
          <PageCard containerStyles={{mb: '0.5rem'}}>Panel 3</PageCard>
          <PageCard>Panel 4</PageCard>
        </Grid>
        <Grid xs={4} item>
          <PageCard containerStyles={{mb: '0.5rem'}}>Panel 4</PageCard>
          <PageCard>Panel 5</PageCard>
        </Grid>
      </Grid>
    </>
  );
};
