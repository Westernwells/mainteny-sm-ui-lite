import React, {useState} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import MoreIcon from '@mui/icons-material/MoreVert';
import {BackAction} from 'components/BackAction';
import {IconButton, InputLabel, Modal, OutlinedInput} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';

export const QuotationDetails = () => {
  const [isDrawerOpen] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  console.log('Details');
  return (
    <>
      <Box display="flex" alignItems="center" gap="1em">
        <BackAction label="QT-123456" containerStyle={{my: 'auto'}} />
        <Typography variant="body1" color="textSecondary">
          New Quotation
        </Typography>
        <Chip label="Draft" variant="outlined" color="warning" />
      </Box>
      {/* The width is set to 1240 px because the A4 sheet is (1240 x 1754) at 150 ppi */}
      {/* https://www.papersizes.org/a-sizes-in-pixels.htm  */}
      <Box
        width="min(calc(1240px + 1.5em), 100%)"
        mx="auto"
        mb="8em"
        p="1.5em"
        bgcolor="grey.300"
        border="2px solid"
        borderColor="text.disabled"
        borderRadius=".5em"
        mt="2.5em">
        <Box bgcolor="white" p=".75em">
          <Alert severity="info">
            <AlertTitle>Note</AlertTitle>
            Header can be edited in the configured template for your service
            company. Please reach out to &nbsp;
            <Typography
              component="a"
              color="info.main"
              sx={{cursor: 'pointer'}}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                window.open('mailto:support@mainteny.com', '_blank');
              }}>
              support@mainteny.com
            </Typography>
            &nbsp;if you want to modify it.
          </Alert>
          <Typography variant="subtitle1" mt="1em">
            Gradler Fordertechnik
            <Typography component="span" variant="caption">
              &nbsp; GmbH Ahornstrabe 21 14959 Trebbin of Thryow
            </Typography>
          </Typography>

          <Box display="flex" mt="1em">
            <Box flexGrow={2} display="flex" flexDirection="column" gap="1em">
              <Box>
                <Typography variant="caption" color="grey.700">
                  To
                </Typography>
                <Box
                  bgcolor="inputBackground.main"
                  py="1.5em"
                  display="flex"
                  justifyContent="center"
                  border="1px dashed"
                  borderColor="text.disabled">
                  <Button variant="outlined" onClick={handleModalOpen}>
                    Select Customer
                  </Button>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="grey.700">
                  Unit Details
                </Typography>
                <Box
                  bgcolor="inputBackground.main"
                  py="1.5em"
                  display="flex"
                  justifyContent="center"
                  border="1px dashed"
                  borderColor="text.disabled">
                  <Button variant="outlined">Select Unit</Button>
                </Box>
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
                  <Typography variant="caption" color="grey.700">
                    Date Created
                  </Typography>
                </InputLabel>
                <OutlinedInput size="small" fullWidth />
              </Box>
              <Box>
                <InputLabel>
                  <Typography variant="caption" color="grey.700">
                    Quotation Number
                  </Typography>
                </InputLabel>
                <OutlinedInput size="small" fullWidth />
              </Box>
              <Box>
                <InputLabel>
                  <Typography variant="caption" color="grey.700">
                    Created By
                  </Typography>
                </InputLabel>
                <OutlinedInput size="small" fullWidth />
              </Box>
            </Box>
          </Box>
          <Box mt="1em">
            <InputLabel>
              <Typography variant="caption" color="grey.700">
                Subject
              </Typography>
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
              <Typography variant="caption" color="grey.700">
                No
              </Typography>
              <Typography variant="caption" color="grey.700" flexGrow={1}>
                Description
              </Typography>
              <Typography variant="caption" color="grey.700">
                Subject
              </Typography>
              <Typography variant="caption" color="grey.700">
                Quantity
              </Typography>
              <Typography variant="caption" color="grey.700">
                Unit
              </Typography>
              <Typography variant="caption" color="grey.700">
                Unit Price
              </Typography>
              <Box>
                <Typography display="block" variant="caption" color="grey.700">
                  Total Price
                </Typography>
                <Typography variant="caption" color="grey.700">
                  (excl VAT)
                </Typography>
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
              <Box
                bgcolor="inputBackground.main"
                py="1em"
                display="flex"
                justifyContent="center"
                border="1px dashed"
                borderColor="text.disabled"
                flexGrow={1}>
                <Button variant="outlined">Select Article</Button>
              </Box>
            </Box>
          </Box>

          <Box mt="1em">
            <InputLabel>
              <Typography variant="caption" color="grey.700">
                Additional Information
              </Typography>
            </InputLabel>
            <OutlinedInput minRows={2} multiline fullWidth />
          </Box>

          <Typography
            variant="subtitle2"
            color="info.main"
            my="2em"
            textAlign="center"
            sx={{cursor: 'pointer'}}>
            Terms & Conditions
          </Typography>

          <Alert severity="info">
            <AlertTitle>Note</AlertTitle>
            Footer can be edited in the configured template for your service
            company. Please reach out to &nbsp;
            <Typography
              component="a"
              color="info.main"
              sx={{cursor: 'pointer'}}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                window.open('mailto:support@mainteny.com', '_blank');
              }}>
              support@mainteny.com
            </Typography>
            &nbsp;if you want to modify it.
          </Alert>
        </Box>
      </Box>

      <Drawer
        PaperProps={{
          sx: {
            background: 'white',
            color: 'primary.main',
            // height: '3.75rem',
            py: '1em',
            zIndex: 'mobileStepper',
          },
        }}
        variant="persistent"
        anchor="bottom"
        open={isDrawerOpen}>
        <Box
          display="flex"
          justifyContent="flex-end"
          gap={2}
          sx={{my: 'auto', px: '4em'}}>
          <Button
            variant="outlined"
            // onClick={handleReset}
            startIcon={<PreviewIcon />}
            type="reset">
            Preview
          </Button>
          {/* <Box display="flex"> */}
          <ButtonGroup variant="contained" aria-label="button group">
            <Button>Save</Button>
            <IconButton
              sx={{
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                borderRadius: '0 4px 4px 0',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}>
              <MoreIcon />
            </IconButton>
          </ButtonGroup>
        </Box>
        {/* </Box> */}

        <Modal open={isModalOpen} onClose={handleModalClose} disablePortal>
          <Box
            sx={{
              position: 'absolute',
              color: 'text.primary',
              bgcolor: 'inputBackground.main',
              borderRadius: '20px',
              // p: '1em',
              width: 'min(1024px , 80%)',
              ml: '1.7em',
              minHeight: '30%',
              maxHeight: '56%',
              top: '50%',
              left: '50%',
              overflow: 'hidden',
              transform: 'translate(-50%, -50%)',
              '&:focus-visible': {
                outline: 'none',
              },
            }}>
            <Box
              pt="1.25em"
              pb=".75em"
              px="1em"
              bgcolor="white"
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography variant="h5">Select Customer</Typography>
              <IconButton onClick={handleModalClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Modal>
      </Drawer>
    </>
  );
};
