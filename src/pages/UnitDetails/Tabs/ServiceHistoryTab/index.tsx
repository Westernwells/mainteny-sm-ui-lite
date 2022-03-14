import {useState} from 'react';
import Grid from '@mui/material/Grid';
import {ServiceOrderStatus} from 'models/service-order';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {SplitButton} from 'components/SplitButton';
import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {HistoryCard} from './HistoryCard';
import {HistoryReport} from './HistoryReport';
import {HistoryBasicDetails} from './HistoryBasicDetails';
import {HistoryAttachments} from './HistoryAttachments';

export const ServiceHistoryTab = () => {
  const [year, setYear] = useState('2022');
  const [status, setStatus] = useState('ALL');
  const [expanded, setExpanded] = useState<boolean>();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid container spacing={2} sx={{mt: 2}}>
      <Grid item xs={8}>
        <HistoryBasicDetails>
          <HistoryCard
            showTimeCategory
            isDetailCard
            removeBottomLeftRadius
            removeBottomRightRadius
            showAlert
            headerActionIcon={<MoreVertIcon />}
            containerStyles={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              pt: '0.5em',
            }}
          />
        </HistoryBasicDetails>
        <HistoryReport>
          <HistoryCard
            isDetailCard
            removeTopLeftRadius
            removeTopRightRadius
            removeServiceOrderType
            removeServiceOrderStatus
            showMoreReportDetails
            showMoreSection
            containerStyles={{
              pt: '0.5em',
            }}
            handleExpandClick={handleExpandClick}
            expanded={expanded}
            collapsedChildren={<HistoryAttachments />}
            headerTitle="Work Report"
            subtitle="Resolved on 25 Sep 2021"
          />
        </HistoryReport>
      </Grid>
      <Grid item xs={4}>
        <PageCard
          headerLabel="Service History"
          contentPadding="0rem"
          headerContainerOverrideStyles={{
            background: 'none',
            mt: 'default',
            mx: 'default',
            height: 'default',
          }}
          headerActionIcon={<MoreVertIcon />}>
          <Box display="flex" mb="0.8em" px="1rem">
            <Box mr="1em">
              <SplitButton
                variant="outlined"
                size="small"
                disableRipple
                selectionStyle={{background: '#fff', cursor: 'default'}}
                selectedOption={`Year: ${year}`}
                options={['2020', '2021', '2022']} // TODO: Dynamically generate this
                onSelectedOptionChanged={(value) => setYear(value)}
              />
            </Box>
            <SplitButton
              variant="outlined"
              size="small"
              disableRipple
              selectionStyle={{background: '#fff', cursor: 'default'}}
              selectedOption={`Status: ${status.toLowerCase()}`}
              options={Object.keys(ServiceOrderStatus).map((item) =>
                item.split('_').join(' ').toLowerCase(),
              )}
              onSelectedOptionChanged={(value) => setStatus(value)}
            />
          </Box>
          <Box sx={{height: '55vh', overflowY: 'scroll'}}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => (
              <HistoryCard
                containerStyles={{borderRadius: 0}}
                bodyContainerStyle={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              />
            ))}
          </Box>
        </PageCard>
      </Grid>
    </Grid>
  );
};
