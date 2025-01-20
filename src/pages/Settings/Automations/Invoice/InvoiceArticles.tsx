import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import React, {useState} from 'react';
import {ServiceOrderType} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useTranslation} from 'react-i18next';
import {IconButton, Tooltip, Typography} from '@mui/material';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {CreateEditViewMode} from 'models/misc';
import {EditOutlined} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {
  TravelWorkCalculationType,
  TravelWorkView,
} from 'models/service-company';
import {useFieldArray, useForm} from 'react-hook-form';
import {ArticleView} from 'models/article';
import {useDeleteTravelWork} from 'hooks/reactQuery/useTravelWork';
import useTheme from '@mui/material/styles/useTheme';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import InvoiceArticlesTable from './InvoiceArticlesTable';
import {FormState} from './DataList';

export interface ArticleForm {
  articleList: {
    id: string;
    article: ArticleView;
    serviceOrderType: ServiceOrderType;
    calculationType: TravelWorkCalculationType;
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{flexGrow: 1}}
      {...other}>
      {value === index && (
        <Box sx={{width: '100%', height: '100%', flexGrow: 1}}>{children}</Box>
      )}
    </div>
  );
};

const InvoiceArticles = () => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dataListMode, setDataListMode] = useState<CreateEditViewMode>('view');
  const [form, setForm] = useState<FormState>({
    name: '',
    articleNumber: '',
    unit: '',
    automate: '',
    sellingPrice: 0,
  });
  const [editingEvent, setEditingEvent] = useState<{
    event?: TravelWorkView;
    index?: number;
  }>({});
  const {mutate: deleteTravelWork} = useDeleteTravelWork(
    t('Article removed successfully'),
  );

  const {control, reset} = useForm<ArticleForm>({
    defaultValues: {
      articleList: [],
    },
  });

  const {fields} = useFieldArray({
    control,
    name: 'articleList',
  });

  const {data: jobTypes, isLoading: loading} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const handleDeleteArticle = async (id: string) => {
    deleteTravelWork(id);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onAddNewType = () => {
    setOpenDialog(true);
  };

  const resetState = () => {
    setEditingEvent({});
    setForm({
      name: '',
      articleNumber: '',
      unit: '',
      automate: '',
      sellingPrice: 0,
    });
    setDataListMode('view');
  };

  const handleDeleteStart = (event: any) => {
    const id = event.realId;
    handleDeleteArticle(id);
  };

  if (loading || !jobTypes) return null;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1.5em',
        }}>
        <Typography
          variant="h6"
          color="textSecondary"
          textTransform="uppercase"
          textAlign="left"
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse',
          }}>
          <Tooltip
            title={t(
              'Certain job types require specific invoice articles. Here you can add articles for each job type, which should be included in the invoices after a job is completed. This does not effect invoices created from contracts.',
            )}
            placement="top"
            arrow>
            <Box sx={{ml: 1, mb: 0.5, cursor: 'pointer'}}>
              <AlertInfoIcon width="16px" height="16px" />
            </Box>
          </Tooltip>
          {t('Articles included in invoices')}
        </Typography>
        <IconButton onClick={onAddNewType}>
          <EditOutlined />
        </IconButton>
      </Box>

      <Box
        sx={{
          bgcolor: '#FFFFFF',
          height: '100%',
          display: 'flex',
          gap: 4,
          borderRadius: '4px',
          padding: '1rem',
        }}>
        <Tabs
          orientation="vertical"
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            border: `1px solid ${theme.state.hover}`,
            '& [role="tablist"]': {
              position: 'relative',
              zIndex: 2,
            },
            '& button[aria-selected="true"] .label': {
              fontWeight: 'bold',
            },
          }}
          TabIndicatorProps={{
            sx: {
              background: theme.palette.inputBackground.main,
              zIndex: 1,
              width: '100%',
              borderRadius: '4px',
              border: `1px solid ${theme.state.hover}`,
            },
          }}>
          {jobTypes?.map((jobType, index) => (
            <Tab
              key={index}
              sx={{
                textTransform: 'none',
                border: `1px solid ${theme.state.hover}`,
              }}
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  width="100%"
                  color={theme.palette.primary.main}>
                  <ServiceOrderIcons serviceOrderType={jobType.name} />
                  <span className="label">
                    {serviceOrderTypeToString(jobType.givenName!) === '-'
                      ? jobType.givenName
                      : t(serviceOrderTypeToString(jobType.givenName!))}
                  </span>
                </Box>
              }
            />
          ))}
        </Tabs>

        {jobTypes.map((jobType, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <InvoiceArticlesTable
              serviceOrderTypeName={jobType.name}
              dataListMode={dataListMode}
              setDataListMode={(newValue: CreateEditViewMode) => {
                setDataListMode(newValue);
              }}
              isUpdating={false}
              onDeleteStart={handleDeleteStart}
              editingEvent={editingEvent}
              setEditingEvent={setEditingEvent}
              form={form}
              setForm={setForm}
              fields={fields}
              reset={reset}
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
              isListingView
            />
          </TabPanel>
        ))}
      </Box>

      <Dialog
        title="Articles"
        onCancel={(forceClose?: boolean) => {
          if (forceClose || dataListMode !== 'edit') {
            setOpenDialog(false);
          }

          resetState();
        }}
        onSave={() => {
          setOpenDialog(false);
        }}
        saveButtonText="Close"
        cancelButtonText="Cancel"
        dialogProps={{
          maxWidth: 'xl',
          open: openDialog || false,
        }}
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: 'none',
          },
          '& .MuiDialogContent-root': {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dialogContentTextStyles={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        saveButtonContainerStyles={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
        dialogActionsStyles={{
          padding: '1em 24px 1em 1.5em',
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
          pb: 0,
          pt: 3,
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.5em',
            paddingLeft: '1.1em',
          }}>
          <Typography
            variant="h6"
            color="textSecondary"
            textTransform="uppercase"
            textAlign="left"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row-reverse',
            }}>
            <Tooltip
              title={t(
                'Certain job types require specific invoice articles. Here you can add articles for each job type, which should be included in the invoices after a job is completed. This does not effect invoices created from contracts.',
              )}
              placement="top"
              arrow>
              <Box sx={{ml: 1, mb: 0.5, cursor: 'pointer'}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Box>
            </Tooltip>
            {t('Articles included in invoices')}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: theme.palette.primary.contrastText,
            height: '100%',
            display: 'flex',
            gap: 4,
            borderRadius: '4px',
            padding: '1rem',
          }}>
          <Tabs
            orientation="vertical"
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& [role="tablist"]': {
                position: 'relative',
                zIndex: 2,
              },
              '& button[aria-selected="true"] .label': {
                fontWeight: 'bold',
              },
            }}
            TabIndicatorProps={{
              sx: {
                background: theme.palette.inputBackground.main,
                zIndex: 1,
                width: '100%',
                borderRadius: '4px',
                border: `1px solid ${theme.state.hover}`,
              },
            }}>
            {jobTypes.map((jobType, index) => (
              <Tab
                key={index}
                sx={{
                  textTransform: 'none',
                  border: `1px solid ${theme.state.hover}`,
                }}
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    width="100%"
                    color={theme.palette.primary.main}>
                    <ServiceOrderIcons serviceOrderType={jobType.name} />
                    <span className="label">
                      {' '}
                      {serviceOrderTypeToString(jobType.givenName!) === '-'
                        ? jobType.givenName
                        : t(serviceOrderTypeToString(jobType.givenName!))}
                    </span>
                  </Box>
                }
              />
            ))}
          </Tabs>

          {jobTypes.map((jobType, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              <InvoiceArticlesTable
                serviceOrderTypeName={jobType.name}
                dataListMode={dataListMode}
                setDataListMode={(newValue: CreateEditViewMode) => {
                  setDataListMode(newValue);
                }}
                isUpdating={false}
                onDeleteStart={handleDeleteStart}
                editingEvent={editingEvent}
                setEditingEvent={setEditingEvent}
                form={form}
                setForm={setForm}
                fields={fields}
                reset={reset}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                isListingView={false}
              />
            </TabPanel>
          ))}
        </Box>
      </Dialog>
    </Box>
  );
};

export default InvoiceArticles;
