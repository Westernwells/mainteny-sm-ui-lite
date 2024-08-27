import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import {Alert, Box, Drawer, FormControlLabel, Radio} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import {Button} from 'components/Button';
import {useContractTerms} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging';
import DeleteIcon from '@mui/icons-material/Delete';
import {Order} from 'models/misc';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {
  ContractOrderField,
  ContractTermView,
  PaymentTermData,
} from 'models/contract';
import {ServiceCompanyType} from 'models/service-company';
import EditIcon from '@mui/icons-material/Edit';
import {compareArrays} from 'utils/contract-terms';
import {useDeleteContractTerm} from 'hooks/reactQuery/useContractPaymentTerms';
import {convertToText} from 'utils/utils';

interface Props {
  open?: boolean;
  serviceCompanyType?: ServiceCompanyType;
  onCancel: () => void;
  onClick: () => void;
  onSave: (paymentTermId: string) => void;
  title: string;
  alertText?: string;
  defaultValue?: string | ContractTermView;
  setEdit: Dispatch<SetStateAction<ContractTermView | undefined>>;
}

const pageSize = 50;
const text = 'Add your payment terms that would be used later in invoicing';

export const ContractTerm = ({
  open,
  onCancel,
  title,
  onClick,
  onSave,
  serviceCompanyType = ServiceCompanyType.PROPERTY_OWNER_PAYMENT_TERM,
  defaultValue = '',
  setEdit,
  alertText = text,
}: Props) => {
  const {t} = useTranslation();

  const isContract = serviceCompanyType === ServiceCompanyType.CONTRACT_NAME;
  const {mutateAsync: deleteContractTerm} = useDeleteContractTerm();

  const validationSchema = Yup.object().shape({
    otherTerms: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        term: Yup.string().min(1).required(t('Term is required')),
      }),
    ),
  });
  const [isShow, setIsShow] = useState(false);
  const [termId, setTermId] = useState('');
  const [toggleItems, setToggleItems] = useState<
    {
      id: string;
      term: string;
      data?: PaymentTermData;
      isShow?: boolean;
    }[]
  >([]);

  const {data: contractTerms = createEmptyResource(pageSize)} =
    useContractTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
      type: serviceCompanyType,
    });

  const {refetch: refetchContractResource} = useQueryContract(
    {
      order: Order.DESC,
      orderBy: ContractOrderField.CREATED_TIME,
      pageIndex: 0,
      pageSize: 25,
      query: '',
      priceStart: -9999999,
      priceEnd: 9999999,
      paymentTermId: encodeURI(termId),
    },
    {
      enabled:
        !!termId &&
        contractTerms?.data.filter((item) => item.id === termId).length > 0,
      refetchOnWindowFocus: false,
    },
  );
  const formik = useFormik<{
    termId: string;
    otherTerms: {id: string; term: string; paymentTermData?: PaymentTermData}[];
  }>({
    initialValues: {
      termId:
        contractTerms?.data?.find((p) => p.term === defaultValue)?.id ?? '',
      otherTerms: [],
    },
    onSubmit: (values, {resetForm}) => {
      onSave(values.termId);
      resetForm();
      onCancel();
    },
    validationSchema,
    validateOnMount: false,
  });
  useEffect(() => {
    if (defaultValue) {
      formik.setFieldValue('termId', defaultValue);
    }
  }, [defaultValue, open]);

  const handleToggle = (id: string) => {
    const modifiedItems = toggleItems?.map((item) => {
      if (item.id === id) {
        setIsShow(!item.isShow);
        return {...item, isShow: true};
      }
      return item;
    });
    setToggleItems(modifiedItems);
  };

  const removeTerm = async (id: string) => {
    const filteredData = toggleItems.filter((pt) => pt.id !== id);
    const deletePromise: Promise<any>[] = [];
    const filteredValues = filteredData.map((item) => ({
      id: item.id,
      term: item.term,
      paymentTermData: item.data,
    }));

    const comparisonResult = compareArrays(contractTerms?.data, filteredValues);

    if (comparisonResult.itemsInFirstOnly?.length) {
      comparisonResult.itemsInFirstOnly.forEach((pt) => {
        if (pt.id === formik.values.termId) {
          formik.setFieldValue('termId', '');
          onSave('');
        }
        if (pt.id) {
          const deleteMutation = deleteContractTerm({
            termId: pt.id,
          });
          deletePromise.push(deleteMutation);
        }
      });
    }
    await Promise.all(deletePromise);

    setIsShow(false);
  };

  const asyncFetchContractResource = async () => {
    if (contractTerms?.data.filter((item) => item.id === termId).length > 0) {
      const data = await refetchContractResource();
      if (data.data?.total! > 0) {
        handleToggle(termId);
      } else {
        await removeTerm(termId);
      }
    } else {
      await removeTerm(termId);
    }
  };

  useEffect(() => {
    if (termId) {
      asyncFetchContractResource();
    }
  }, [termId]);

  useEffect(() => {
    const newItems = formik.values.otherTerms.map((item) => ({
      ...item,
      isShow: false,
    }));
    setToggleItems(newItems);
  }, [formik.values.otherTerms]);

  useEffect(() => {
    if (open) {
      if (termId !== '') {
        setTermId('');
      }

      if (contractTerms?.data.length) {
        formik.setFieldValue('otherTerms', [...contractTerms.data]);
      }
    } else {
      formik.setFieldValue('otherTerms', contractTerms?.data);
    }
  }, [open]);

  useEffect(() => {
    setIsShow(false);
  }, []);

  useEffect(() => {
    if (contractTerms?.data) {
      setToggleItems(contractTerms.data);
    }
  }, [contractTerms.data]);

  const renderContent = () => {
    if (!isContract && isShow) {
      return (
        <Alert
          severity="warning"
          sx={{mt: '1em', mb: '1em', py: '1em', alignItems: 'center'}}>
          <Typography
            sx={{
              fontWeight: '600',
              marginTop: '-0.3em',
              marginBottom: '0.3em',
            }}>
            {t('Payment terms used')} <br />
          </Typography>

          <Typography
            sx={{
              lineHeight: '1.4',
              fontSize: '1em',
              letterSpacing: '0.02em',
            }}>
            {t(
              `Deleting this payment term will also remove it from any contracts it’s associated with.`,
            )}
          </Typography>
        </Alert>
      );
    }

    if (!isContract && !isShow) {
      return (
        <Alert
          severity="info"
          sx={{mt: '1em', mb: '1em', py: '0.6em', alignItems: 'center'}}>
          <Typography>
            {t(alertText)}
            <br />
          </Typography>
        </Alert>
      );
    }
  };

  return (
    <Drawer
      open={open ?? false}
      anchor="right"
      onClose={() => {
        onCancel();
        setIsShow(false);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      ModalProps={{
        style: {zIndex: 1350},
      }}
      PaperProps={{
        sx: {
          width: '32em',
          color: 'text.primary',
          background: 'white',
        },
      }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 400,
          padding: '8px 12px 0px 26px',
          fontSize: '20px',
        }}>
        {title}{' '}
        <IconButton onClick={onCancel}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{pb: 1}}>
        {renderContent()}
        <Grid container>
          {toggleItems.map?.((pt) => (
            <Grid
              container
              item
              xs={12}
              key={pt.id}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.5,
              }}>
              <FormControlLabel
                key={pt.id}
                value={pt.term}
                control={<Radio size="small" />}
                label={
                  isContract ? (
                    pt.term
                  ) : (
                    <Box>
                      <Typography
                        variant={
                          formik.values.termId === pt.id ? 'subtitle2' : 'body2'
                        }>
                        {pt.term}
                      </Typography>
                      {pt.data?.discountOptions
                        ? pt.data?.discountOptions
                            .filter(
                              (d) =>
                                d.discountDays !== 0 && d.discountPercent !== 0,
                            )
                            .map((d, idx) => (
                              <Typography
                                key={idx}
                                variant="caption"
                                component="p"
                                color="text.secondary">
                                {`${d.discountDays} ${t('days')}; ${
                                  d.discountPercent
                                }% ${t('discount')}; ${t(
                                  convertToText(d.articleType),
                                )}`}
                              </Typography>
                            ))
                        : null}
                    </Box>
                  )
                }
                onChange={() => formik.setFieldValue('termId', pt.id)}
                checked={formik.values.termId === pt.id}
              />
              <Grid container item xs={1} justifyContent="center">
                {pt.isShow ? (
                  <IconButton
                    onClick={() => removeTerm(pt.id)}
                    sx={{color: 'text.disabled'}}>
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <Box display="flex">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (pt) {
                          setEdit(pt as ContractTermView);
                          onClick();
                        }
                      }}
                      sx={{color: 'text.disabled'}}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setTermId(pt.id);
                        if (termId === pt.id) {
                          asyncFetchContractResource();
                        }
                      }}
                      sx={{color: 'text.disabled'}}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Button
          buttonProps={{
            size: 'medium',
            variant: 'outlined',
            onClick,
            startIcon: <Add />,
            sx: {
              bgcolor: 'transparent',
              padding: '3px 6px 4px 6px',
              marginTop: '7px',
            },
          }}>
          <Typography variant="subtitle2">
            {isContract ? t('New Contract name') : t('New Payment Term')}
          </Typography>
        </Button>
      </DialogContent>

      <Box sx={{p: 3}} display="flex" justifyContent="space-between">
        <Button
          buttonProps={{
            size: 'medium',
            onClick: () => {
              formik.resetForm();
              onCancel();
            },
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>
        <Button
          buttonProps={{
            variant: 'contained',
            size: 'medium',
            disabled:
              (!formik.isValid && !!formik.values.otherTerms.length) ||
              !formik.values.termId,
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{t('Confirm')}</Typography>
        </Button>
      </Box>
    </Drawer>
  );
};
