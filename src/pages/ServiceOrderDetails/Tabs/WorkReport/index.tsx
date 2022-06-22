/* eslint-disable */
import {A4Layout, Label} from 'components/A4Layout';
import {EmptySection} from 'components/EmptySection';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useServiceOrderReport} from 'hooks/reactQuery/useServiceOrder';
import React from 'react';
import {SelectButton} from 'components/SelectButton';
import {FlexContainer} from 'components/FlexContainer';
import {SelectCard} from 'components/SelectCard';
import Divider from '@mui/material/Divider';
import {ArticleHeader} from './ArticleHeader';
import {ArticleRow} from './ArticleRow';
import {TimeReportRow} from './TimeReportRow';
import {TimeReportHeader} from './TimeReportHeader';

interface Props {
  serviceOrderId?: string;
}

export const WorkReport = ({serviceOrderId}: Props) => {
  const {data: serviceOrderReport} = useServiceOrderReport({
    serviceOrderId: serviceOrderId ? [serviceOrderId] : [],
  });
  console.log(serviceOrderReport, ':::::::::::=====>>>>>');

  return (
    <FlexContainer containerStyle={{height: 0, overflowY: 'scroll'}}>
      <A4Layout containerStyle={{width: 'min(calc(900px + 1.25em), 100%)'}}>
        <Box display="flex" mt="1em" gap="2em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <Box>
              <Label text="Customer Details" required />
              <SelectCard
                header={<Typography variant="body2">customer name</Typography>}
                body={
                  <>
                    <Typography variant="caption">customer address</Typography>
                    <Typography variant="caption" component="p">
                      +4330392929
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      123444
                    </Typography>
                    <Typography variant="caption" component="p">
                      C-7893001
                    </Typography>
                  </>
                }
                onClose={() => {}}
              />
            </Box>

            <Box>
              <Label text="Customer Details" required />
              <SelectCard
                header={<Typography variant="body2">customer name</Typography>}
                body={
                  <>
                    <Typography variant="caption">customer address</Typography>
                    <Typography variant="caption" component="p">
                      +4330392929
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      123444
                    </Typography>
                    <Typography variant="caption" component="p">
                      C-7893001
                    </Typography>
                  </>
                }
                onClose={() => {}}
              />
            </Box>
          </Box>

          <Box
            width="40%"
            display="flex"
            flexDirection="column"
            gap="2em"
            mt="1.5em">
            <Box>
              <Label text="Report ID" />
              <Typography>OD-0001025</Typography>
            </Box>

            <Box>
              <Label text="Order ID" />
              <Typography>MT-0000458</Typography>
            </Box>

            <Box>
              <Label text="Technician" />
              <Typography>Nico Eggart</Typography>
            </Box>

            <Box>
              <Label text="Status" />
              <Typography>Running</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{mt: '3em'}}>
          <Typography component="p" variant="caption">
            Maintenance
          </Typography>
          <Box
            sx={{p: 1, borderRadius: 1, border: '1px solid #E0E0E0'}}
            bgcolor="grey.50">
            <TimeReportHeader />
            <Box
              sx={{
                boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
                mt: '2em',
              }}>
              <TimeReportRow />
              <TimeReportRow />
            </Box>
          </Box>
        </Box>

        <Box sx={{mt: '3em'}}>
          <Typography component="p" variant="caption">
            Articles
          </Typography>
          <Box
            sx={{p: 1, borderRadius: 1, border: '1px solid #E0E0E0'}}
            bgcolor="grey.50">
            <ArticleHeader />

            <ArticleRow />
            <ArticleRow />

            <Divider light sx={{mt: '1em', mb: '1em'}} />

            <Box
              sx={{display: 'flex', justifyContent: 'flex-end', pr: '0.5em'}}>
              <Typography component="div" variant="body1">
                Total Price
                <Typography variant="caption" color="text.secondary">
                  {' (excl VAT)'}
                </Typography>
              </Typography>

              <Typography variant="body2" ml="3em">
                €34,600
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: '0.5em',
                pr: '0.5em',
              }}>
              <Typography component="div" variant="body1">
                VAT
              </Typography>
              <Typography variant="body2" ml="3em">
                €6,800
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: '0.5em',
                py: '0.5em',
                pr: '0.5em',
              }}
              bgcolor="grey.700">
              <Typography component="div" variant="body1" color="white">
                Total Price
                <Typography variant="caption">{' (incl VAT)'}</Typography>
              </Typography>

              <Typography variant="body2" ml="3em" color="white">
                €34,600
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{mt: '2em'}}>
          <Typography component="div" variant="caption" color="text.secondary">
            Description Of Service
          </Typography>
          <Typography variant="body2" mt="0.3em">
            During the last fault calls to the above-mentioned elevator system,
            non-definable and reproducible errors occurred repeatedly. However,
            since these two positions are very expensive, it may be necessary to
            renew the entire elevator control system.
          </Typography>
        </Box>
      </A4Layout>
    </FlexContainer>
  );

  // return (
  //   <EmptySection
  //     label="No work report yet. It will appear here once the order is completed!"
  //     illustration="clipboard"
  //     size="small"
  //     containerStyle={{
  //       height: '100%',
  //       mb: '10em',
  //     }}
  //   />
  // );
};
