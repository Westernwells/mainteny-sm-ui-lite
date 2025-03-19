import {useFormik} from 'formik';
import {Box, IconButton, InputAdornment} from '@mui/material';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {ElevatorView} from 'models/elevator';
import {EmployeesView} from 'models/employee';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {AssignmentDescriptionOrderModel} from 'models/service-order';
import {TimePicker} from 'components/TimePicker';
import {toRestDateTime} from 'utils/datetime';
import {ReactComponent as LiftIcon} from 'assets/icons/Lift-1.svg';
import {ReactComponent as FieldServiceIcon} from 'assets/icons/FieldService.svg';
import {ReactComponent as CalendarInformationIcon} from 'assets/icons/CalendarInformation.svg';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {GridCellParams} from '@mui/x-data-grid';
import TextBlockActions from 'components/text-blocks/TextBlockActions';
import TextBlockSelect from 'components/text-blocks/TextBlockSelect';
import {TextBlockCategory, TextBlockView} from 'models/text-block';
import {Dialog} from 'components/Dialog';
import RichTextField from 'components/RichTextField';
import {cleanHtmlContent} from 'utils/text-block';
import {Summary, SummaryItem} from './Summary';

interface Props {
  getDescriptionValues?: (val: AssignmentDescriptionOrderModel) => void;
  initialValues: AssignmentDescriptionOrderModel;
  getDescription?: (val: string) => void;
  initialDescription?: string;
  selectedUnit: ElevatorView;
  selectedTechnicians?: EmployeesView[];
  selectedDateTimeString?: string;
  setNotes: Dispatch<SetStateAction<string>>;
  notes: string;
}

export const AddDescription = ({
  getDescriptionValues,
  initialValues,
  getDescription,
  setNotes,
  notes,
  initialDescription = '',
  selectedUnit,
  selectedTechnicians = [],
  selectedDateTimeString,
}: Props) => {
  const {t} = useTranslation();
  const [description, setDescription] = useState(initialDescription);

  const formik = useFormik<AssignmentDescriptionOrderModel>({
    initialValues: {
      callTime: initialValues?.callTime || '',
      callerName: initialValues?.callerName || '',
      purchaseOrderNumber: initialValues?.purchaseOrderNumber || '',
    },
    onSubmit: () => {},
  });

  const [openTextBlockDialog, setOpenTextBlockDialog] =
    useState<boolean>(false);
  const [textBlockDialogField, setTextBlockDialogField] = useState<
    'description' | 'note'
  >();
  const [activeSubDialog, setActiveSubDialog] = useState<
    'edit' | 'preview' | 'delete' | 'create' | undefined
  >(undefined);
  const [activeTextBlock, setActiveTextBlock] = useState<
    TextBlockView | undefined
  >(undefined);

  const onCloseSubDialogs = () => {
    setActiveSubDialog(undefined);
    setOpenTextBlockDialog(true);
  };

  const handleCellClick = (rowParams: GridCellParams<any, any, any>) => {
    if (textBlockDialogField === 'description') {
      setDescription(cleanHtmlContent(rowParams.row.text));
    }
    if (textBlockDialogField === 'note') {
      setNotes(cleanHtmlContent(rowParams.row.text));
    }

    setOpenTextBlockDialog(false);
  };

  useEffect(() => {
    if (getDescription) {
      getDescription(description);
    }
  }, [description]);

  useEffect(() => {
    if (getDescriptionValues) {
      getDescriptionValues(formik.values);
    }
  }, [formik]);

  return (
    <Box maxWidth="42rem">
      <Box display="flex" gap={5} pt={3}>
        <Summary
          label="Selected Unit"
          icon={<LiftIcon fontSize="4rem" height="2rem" />}>
          <SummaryItem value={selectedUnit?.propertyOwner?.name || ''} />
          <SummaryItem value={selectedUnit?.address?.fullName || ''} />
          <SummaryItem
            value={selectedUnit?.additionalInfo.buildingLocation || ''}
          />
          <SummaryItem value={selectedUnit?.externalId || ''} />
        </Summary>

        {selectedTechnicians.length ? (
          <Summary
            label="Selected Engineer"
            icon={<FieldServiceIcon fontSize="2rem" />}>
            {selectedTechnicians.map((item) => (
              <SummaryItem
                key={item.id}
                value={`${item.userAccount.firstName} ${item.userAccount.lastName}`}
              />
            ))}
          </Summary>
        ) : null}

        {selectedDateTimeString ? (
          <Summary
            label="Selected Date & Time"
            icon={<CalendarInformationIcon fontSize="2rem" />}>
            <SummaryItem
              value={selectedDateTimeString}
              containerStyle={{display: 'inline-block'}}
            />
          </Summary>
        ) : null}
      </Box>
      <Box pt={5}>
        <Grid container alignItems="center" spacing={2} mb={3}>
          <Grid item md={4.5}>
            <FormInput
              fieldProps={{
                label: 'Purchase order number',
                value: formik.values.purchaseOrderNumber,
                size: 'small',
                type: 'text',
                onChange: (e) => {
                  formik.setFieldValue('purchaseOrderNumber', e.target.value);
                },
              }}
            />
          </Grid>

          <Grid item md={4.5}>
            <FormInput
              fieldProps={{
                label: 'Caller',
                value: formik.values.callerName,
                size: 'small',
                type: 'text',
                onChange: (e) => {
                  formik.setFieldValue('callerName', e.target.value);
                },
              }}
            />
          </Grid>

          <Grid item md={3}>
            <TimePicker
              defaultTime={
                formik.values.callTime ? new Date(formik.values.callTime) : null
              }
              getSelectedTime={(date) => {
                if (date && !Number.isNaN(date.getTime())) {
                  formik.setFieldValue('callTime', toRestDateTime(date));
                }
              }}
              textFieldProps={{
                label: t('Call Time'),
                name: 'callTime',
                helperText:
                  formik.errors.callTime && formik.touched.callTime
                    ? formik.errors.callTime
                    : '',
                error: !!(formik.errors.callTime && formik.touched.callTime),
                onBlur: formik.handleBlur,
              }}
            />
          </Grid>
        </Grid>

        <RichTextField
          label="External description"
          html={description || ''}
          updateHtml={setDescription}
          minRows={4}
          endAdornment={
            <InputAdornment
              component={IconButton}
              disableRipple
              position="end"
              sx={{
                mt: 1,
                mr: -1,
                alignSelf: 'flex-start',
              }}
              onClick={() => {
                setOpenTextBlockDialog(true);
                setTextBlockDialogField('description');
              }}
              size="small">
              <TextSnippetIcon />
            </InputAdornment>
          }
        />
        <Box mt={2}>
          <RichTextField
            label="Note"
            html={notes || ''}
            updateHtml={setNotes}
            minRows={4}
            endAdornment={
              <InputAdornment
                component={IconButton}
                disableRipple
                position="end"
                sx={{
                  mt: 1,
                  mr: -1,
                  alignSelf: 'flex-start',
                }}
                onClick={() => {
                  setOpenTextBlockDialog(true);
                  setTextBlockDialogField('note');
                }}
                size="small">
                <TextSnippetIcon />
              </InputAdornment>
            }
          />
        </Box>
      </Box>

      <Dialog
        title="Click to apply your block"
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => {
          setOpenTextBlockDialog(false);
          setTextBlockDialogField(undefined);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: openTextBlockDialog || false,
        }}
        showCancelButton={false}
        showSaveButton={false}>
        <TextBlockSelect
          textBlockCategories={[
            TextBlockCategory.QUOTATION,
            TextBlockCategory.ARTICLE_ORDER,
            TextBlockCategory.INVOICE,
            TextBlockCategory.SERVICE_ORDER,
            TextBlockCategory.SERVICE_ORDER_REPORT,
            TextBlockCategory.EMAIL,
          ]}
          setOpenTextBlockDialog={setOpenTextBlockDialog}
          setActiveSubDialog={setActiveSubDialog}
          setActiveTextBlock={setActiveTextBlock}
          handleCellClick={handleCellClick}
        />
      </Dialog>

      {activeSubDialog && (
        <TextBlockActions
          textBlockCategory={TextBlockCategory.SERVICE_ORDER}
          activeSubDialog={activeSubDialog}
          setActiveSubDialog={setActiveSubDialog}
          openDialog={
            activeSubDialog === 'edit' || activeSubDialog === 'create'
          }
          openPreviewDialog={activeSubDialog === 'preview'}
          openCancelConfirm={activeSubDialog === 'delete'}
          activeTextBlock={activeTextBlock}
          onCloseSubDialogs={onCloseSubDialogs}
        />
      )}
    </Box>
  );
};
