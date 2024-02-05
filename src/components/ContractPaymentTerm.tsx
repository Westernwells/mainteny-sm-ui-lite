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
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging-utils';
import DeleteIcon from '@mui/icons-material/Delete';
import {Order} from 'models/misc';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {ContractOrderField, ContractPaymentTermView} from 'models/contract';
import EditIcon from '@mui/icons-material/Edit';
import {compareArrays} from 'utils/contract-terms';
import {useDeleteContractPaymentTerm} from 'hooks/reactQuery/useContractPaymentTerms';

interface Props {
  open?: boolean;
  onCancel: () => void;
  onClickNewPaymentTerm: () => void;
  onSave: (paymentTermId: string) => void;
  title: string;
  defaultPayment?: string;
  setPaymentToEdit: Dispatch<
    SetStateAction<ContractPaymentTermView | undefined>
  >;
}

const pageSize = 50;

export const ContractPaymentTerm = ({
  open,
  onCancel,
  title,
  onClickNewPaymentTerm,
  onSave,
  defaultPayment,
  setPaymentToEdit,
}: Props) => {
  const {t} = useTranslation();
  const {mutateAsync: deleteContractPaymentTerm} =
    useDeleteContractPaymentTerm();

  const validationSchema = Yup.object().shape({
    otherPaymentTerms: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        term: Yup.string().min(1).required(t('Payment term is required')),
      }),
    ),
  });
  const [isShow, setIsShow] = useState(false);
  const [paymentTermId, setPaymentTermId] = useState('');
  const [toggleItems, setToggleItems] = useState<
    {id: string; term: string; isShow?: boolean}[]
  >([]);

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
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
      paymentTermId: encodeURI(paymentTermId),
    },
    {
      enabled:
        !!paymentTermId &&
        contractPaymentTerms?.data.filter((item) => item.id === paymentTermId)
          .length > 0,
      refetchOnWindowFocus: false,
    },
  );
  const formik = useFormik<{
    paymentTermId: string;
    otherPaymentTerms: {id: string; term: string}[];
  }>({
    initialValues: {
      paymentTermId:
        contractPaymentTerms?.data?.find((p) => p.term === defaultPayment)
          ?.id ?? '',
      otherPaymentTerms: [],
    },
    onSubmit: (values, {resetForm}) => {
      onSave(values.paymentTermId);
      resetForm();
      onCancel();
    },
    validationSchema,
    validateOnMount: false,
  });
  useEffect(() => {
    if (defaultPayment) {
      // try to set using effect sometimes data is not set properly
      formik.setFieldValue(
        'paymentTermId',
        contractPaymentTerms?.data?.find((p) => p.term === defaultPayment)
          ?.id ?? '',
      );
    }
  }, [contractPaymentTerms?.data?.length, defaultPayment]);

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
    }));

    const comparisonResult = compareArrays(
      contractPaymentTerms?.data,
      filteredValues,
    );

    if (comparisonResult.itemsInFirstOnly?.length) {
      comparisonResult.itemsInFirstOnly.forEach((pt) => {
        if (pt.id === formik.values.paymentTermId) {
          formik.setFieldValue('paymentTermId', '');
          onSave('');
        }
        if (pt.id) {
          const deleteMutation = deleteContractPaymentTerm({
            paymentTermId: pt.id,
          });
          deletePromise.push(deleteMutation);
        }
      });
    }
    await Promise.all(deletePromise);

    setIsShow(false);
  };

  const asyncFetchContractResource = async () => {
    if (
      contractPaymentTerms?.data.filter((item) => item.id === paymentTermId)
        .length > 0
    ) {
      const data = await refetchContractResource();
      if (data.data?.total! > 0) {
        handleToggle(paymentTermId);
      } else {
        await removeTerm(paymentTermId);
      }
    } else {
      await removeTerm(paymentTermId);
    }
  };

  useEffect(() => {
    if (paymentTermId) {
      asyncFetchContractResource();
    }
  }, [paymentTermId]);

  useEffect(() => {
    const newItems = formik.values.otherPaymentTerms.map((item) => ({
      ...item,
      isShow: false,
    }));
    setToggleItems(newItems);
  }, [formik.values.otherPaymentTerms]);

  useEffect(() => {
    if (open) {
      if (paymentTermId !== '') {
        setPaymentTermId('');
      }

      if (contractPaymentTerms?.data.length) {
        formik.setFieldValue('otherPaymentTerms', [
          ...contractPaymentTerms.data,
        ]);
      }
    } else {
      formik.setFieldValue('otherPaymentTerms', contractPaymentTerms?.data);
    }
  }, [open]);

  useEffect(() => {
    setIsShow(false);
  }, []);

  useEffect(() => {
    setToggleItems(contractPaymentTerms?.data);
  }, [contractPaymentTerms]);

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
        {isShow ? (
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
        ) : (
          <Alert
            severity="info"
            sx={{mt: '1em', mb: '1em', py: '0.6em', alignItems: 'center'}}>
            <Typography>
              {t(
                'Add your payment terms that would be used later in invoicing',
              )}
              <br />
            </Typography>
          </Alert>
        )}

        <Grid container>
          {toggleItems.map?.((pt) => (
            <Grid
              container
              item
              xs={12}
              key={pt.id}
              sx={{alignItems: 'flex-start', justifyContent: 'space-between'}}>
              <FormControlLabel
                key={pt.id}
                value={pt.term}
                control={<Radio size="small" />}
                label={pt.term}
                onChange={() => formik.setFieldValue('paymentTermId', pt.id)}
                checked={formik.values.paymentTermId === pt.id}
              />
              <Grid container item xs={1} justifyContent="center">
                {pt.isShow ? (
                  <IconButton onClick={() => removeTerm(pt.id)}>
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <Box display="flex">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (pt) {
                          setPaymentToEdit(pt as ContractPaymentTermView);
                          onClickNewPaymentTerm();
                        }
                      }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setPaymentTermId(pt.id);
                        if (paymentTermId === pt.id) {
                          asyncFetchContractResource();
                        }
                      }}>
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
            onClick: onClickNewPaymentTerm,
            startIcon: <Add />,
            sx: {
              bgcolor: 'transparent',
              padding: '3px 6px 4px 6px',
              marginTop: '7px',
            },
          }}>
          <Typography variant="subtitle2">{t('New Payment Term')}</Typography>
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
              (!formik.isValid && !!formik.values.otherPaymentTerms.length) ||
              !formik.values.paymentTermId,
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{t('Confirm')}</Typography>
        </Button>
      </Box>
    </Drawer>
  );
};
