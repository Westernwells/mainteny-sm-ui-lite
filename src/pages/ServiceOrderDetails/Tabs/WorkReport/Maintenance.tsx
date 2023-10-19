import useTheme from '@mui/material/styles/useTheme';
import {Divider, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {ServiceOrderView} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import {convertDigitalMinsToHM} from 'utils/datetime';
import {Construction, DirectionsCar} from '@mui/icons-material';
import {FormLabel} from 'components/form/FormLabel';
import {DatePicker} from 'components/DatePicker';
import {TimePicker} from 'components/TimePicker';

interface Props {
  serviceOrder: ServiceOrderView;
}
export const Maintenance = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const schedule = serviceOrder.schedules?.[serviceOrder.schedules.length - 1];
  const {t} = useTranslation();
  return (
    <Box mt="1em">
      <FormLabel text="Maintenance" />
      {schedule && (
        <Box
          bgcolor="grey.50"
          border="1px solid"
          borderColor="grey.300"
          borderRadius="4px"
          p=".5em">
          {!serviceOrder?.report?.additionalInfo.onlyShowTotalTime && (
            <>
              <Box px="1rem" pt=".5rem" pb="1.5rem" display="flex">
                <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                  <DirectionsCar sx={{color: 'action.active'}} />
                  <Typography variant="caption">{t('Travel')}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                  <Construction sx={{color: 'action.active'}} />
                  <Typography variant="caption">{t('Work')}</Typography>
                </Box>
              </Box>
              <Box
                bgcolor="grey.50"
                boxShadow="0px 4px 15px 0px #90909033"
                p="1rem"
                display="flex">
                <Box display="flex" flexWrap="wrap" gap={1.2} flex={1}>
                  <Box display="flex" gap={1.2}>
                    <DatePicker
                      defaultDate={
                        serviceOrder.travelStartTime
                          ? new Date(serviceOrder.travelStartTime)
                          : null
                      }
                      containerStyles={{maxWidth: '11rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                        },
                        disabled: true,
                      }}
                    />

                    <TimePicker
                      defaultTime={
                        serviceOrder.travelStartTime
                          ? new Date(serviceOrder.travelStartTime)
                          : null
                      }
                      containerStyles={{maxWidth: '8rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                          width: '100%',
                        },
                        disabled: true,
                      }}
                    />
                  </Box>

                  <Box display="flex" gap={1.2}>
                    <DatePicker
                      defaultDate={
                        serviceOrder.travelEndTime
                          ? new Date(serviceOrder.travelEndTime)
                          : null
                      }
                      containerStyles={{maxWidth: '11rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                        },
                        disabled: true,
                      }}
                    />

                    <TimePicker
                      defaultTime={
                        serviceOrder.travelEndTime
                          ? new Date(serviceOrder.travelEndTime)
                          : null
                      }
                      containerStyles={{maxWidth: '8rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                        },
                        disabled: true,
                      }}
                    />
                  </Box>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1.2} flex={1}>
                  <Box display="flex" gap={1.2}>
                    <DatePicker
                      defaultDate={
                        serviceOrder.actualStartTime
                          ? new Date(serviceOrder.actualStartTime)
                          : null
                      }
                      containerStyles={{maxWidth: '11rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                        },
                        disabled: true,
                      }}
                    />

                    <TimePicker
                      defaultTime={
                        serviceOrder.actualStartTime
                          ? new Date(serviceOrder.actualStartTime)
                          : null
                      }
                      containerStyles={{maxWidth: '8rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                          width: '100%',
                        },
                        disabled: true,
                      }}
                    />
                  </Box>

                  <Box display="flex" gap={1.2}>
                    <DatePicker
                      defaultDate={
                        serviceOrder.actualEndTime
                          ? new Date(serviceOrder.actualEndTime)
                          : null
                      }
                      containerStyles={{maxWidth: '11rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                        },
                        disabled: true,
                      }}
                    />

                    <TimePicker
                      defaultTime={
                        serviceOrder.actualEndTime
                          ? new Date(serviceOrder.actualEndTime)
                          : null
                      }
                      containerStyles={{maxWidth: '8rem'}}
                      disabled
                      textFieldProps={{
                        sx: {
                          svg: {color: theme.palette.action.active},
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: theme.palette.text.primary,
                          },
                        },
                        disabled: true,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Divider
                sx={{
                  my: '1rem',
                  border: `1px solid ${theme.palette.action.disabledBackground}`,
                }}
              />
            </>
          )}

          <Box
            bgcolor="grey.700"
            borderRadius="4px"
            p="1em"
            mb=".5em"
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 8ch 4fr',
            }}>
            <Typography sx={{color: 'primary.contrastText'}}>
              {t('Total time')}
            </Typography>
            <Box />
            <Typography sx={{color: 'primary.contrastText'}}>
              {convertDigitalMinsToHM(
                serviceOrder.report?.actualServiceTime ?? 0,
              )}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
