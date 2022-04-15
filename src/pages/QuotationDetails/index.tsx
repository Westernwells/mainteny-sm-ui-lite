import {useState} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import {BackAction} from 'components/BackAction';
import {InputLabel, OutlinedInput} from '@mui/material';
import {SelectButton} from './SelectButton';
import {Label} from './Label';
import {QuotationLayout} from './QuotationLayout';
import {BottomDrawer} from './BottomDrawer';
import {QuotationModal} from './QuotationModal';

export const QuotationDetails = () => {
  const [isDrawerOpen] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <>
      <Box display="flex" alignItems="center" gap="1em">
        <BackAction label="QT-123456" containerStyle={{my: 'auto'}} />
        <Typography variant="body1" color="textSecondary">
          New Quotation
        </Typography>
        <Chip label="Draft" variant="outlined" color="warning" />
      </Box>

      <QuotationLayout>
        <Typography variant="subtitle1" mt="1em">
          Gradler Fordertechnik
          <Typography component="span" variant="caption">
            &nbsp; GmbH Ahornstrabe 21 14959 Trebbin of Thryow
          </Typography>
        </Typography>

        <Box display="flex" mt="1em">
          <Box flexGrow={2} display="flex" flexDirection="column" gap="1em">
            <Box>
              <Label text="To" />
              <SelectButton text="Select Customer" onClick={handleModalOpen} />
            </Box>
            <Box>
              <Label text="  Unit Details" />
              <SelectButton text="Select Unit" onClick={handleModalOpen} />
            </Box>
          </Box>
          <Box
            flexGrow={1}
            px="1em"
            display="flex"
            flexDirection="column"
            justifyContent="space-between">
            <Box>
              <InputLabel>
                <Label text="Date Created" />
              </InputLabel>
              <OutlinedInput size="small" fullWidth />
            </Box>
            <Box>
              <InputLabel>
                <Label text="Quotation Number" />
              </InputLabel>
              <OutlinedInput size="small" fullWidth />
            </Box>
            <Box>
              <InputLabel>
                <Label text="Created By" />
              </InputLabel>
              <OutlinedInput size="small" fullWidth />
            </Box>
          </Box>
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Subject" />
          </InputLabel>
          <OutlinedInput minRows={4} multiline fullWidth />
        </Box>
        <Box
          bgcolor="grey.50"
          border="1px solid"
          borderColor="grey.300"
          mt="1em"
          borderRadius="4px"
          p=".5em">
          <Box display="flex" alignItems="center" gap="1em" px=".5em">
            <Label text="No" />
            <Label text="Description" sx={{flexGrow: 1}} />
            <Label text="Subject" />
            <Label text="Quantity" />
            <Label text="Unit" />
            <Label text="Unit Price" />
            <Box>
              <Label text="Total Price" sx={{display: 'block'}} />
              <Label text="(excl VAT)" />
            </Box>
          </Box>
          <Box
            bgcolor="grey.50"
            borderRadius="4px"
            display="flex"
            alignItems="center"
            my="1em"
            gap="1em"
            boxShadow="0px 4px 15px 0px #90909033"
            p=".5em">
            <Typography variant="body2">1</Typography>
            <SelectButton
              text="Select Article"
              onClick={handleModalOpen}
              sxContainer={{flexGrow: 1}}
            />
          </Box>
        </Box>
        <Box mt="1em">
          <InputLabel>
            <Label text="Additional Information" />
          </InputLabel>
          <OutlinedInput minRows={2} multiline fullWidth />
        </Box>
      </QuotationLayout>

      <BottomDrawer isOpen={isDrawerOpen} />
      <QuotationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        header="Select Customer">
        TABLE DATA
      </QuotationModal>
    </>
  );
};
