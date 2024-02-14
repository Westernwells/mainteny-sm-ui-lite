import React, {useMemo} from 'react';
import {t} from 'i18next';
import {theme} from 'theme';
import {
  Box,
  Checkbox,
  Dialog,
  Divider,
  LinearProgress,
  linearProgressClasses,
  Radio,
  TextField,
  Typography,
} from '@mui/material';
import {KeyboardArrowDown} from '@mui/icons-material';
import {
  CheckListComponentType,
  ExtendedCheckListComponentRecord,
  ExtendedCreateCheckListRecord,
  ExtendedUpdateCheckListRecord,
} from 'models/checklist';
import MobileHeader1 from 'assets/images/mobile-header-1.png';
import MobileHeader2 from 'assets/images/mobile-header-2.png';
import {Button} from 'components/Button';
import {Controller, UseFormReturn} from 'react-hook-form';
import {VariableSizeList} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {styles} from './style';
import {T} from 'utils/i18n-utils';

interface Props {
  isPreviewing: boolean;
  onClosePreview: () => void;
  form: UseFormReturn<
    ExtendedCreateCheckListRecord | ExtendedUpdateCheckListRecord
  >;
}

export const ChecklistPreview = ({
  isPreviewing,
  onClosePreview,
  form,
}: Props) => {
  const handleClose = () => {
    onClosePreview();
  };

  const values = useMemo(() => form.getValues(), [form.getValues()]);

  const getSize = (index: number) => {
    const type = values.components[index]?.type;
    const moreInfo = values.components[index]?.moreInfoInNote ? 1 : 0;
    const length = (values.components[index]?.options.length ?? 0) + moreInfo;
    const PADDING_VERTICAL = 15;
    const MARGIN_BOTTOM = 16;
    const calculateHeightOfSingleCheck =
      (PADDING_VERTICAL + MARGIN_BOTTOM) * (length - 1);
    // PADDING_VERTICAL and MARGIN_BOTTOM we are getting from block items. Any change there, we should change here
    const subject = values.components[index]?.subject;
    const lines = (Math.ceil((7 * subject?.length) / 250) - 1) * 21;
    switch (type) {
      case CheckListComponentType.YES_NO:
        return 40 + PADDING_VERTICAL + MARGIN_BOTTOM + lines;
      case CheckListComponentType.HEAD:
        return 30 + PADDING_VERTICAL + MARGIN_BOTTOM + lines;
      case CheckListComponentType.SINGLE_CHECK:
        return 90 + calculateHeightOfSingleCheck + lines + (length - 1) * 5;
      case CheckListComponentType.TEXT:
        return 150 + PADDING_VERTICAL + MARGIN_BOTTOM + lines;
      default:
        return 65 + PADDING_VERTICAL + MARGIN_BOTTOM;
    }
  };

  const handleCheckOption = (componentIndex: number, id: string) => {
    const newData = {...values};
    newData.components[componentIndex].options = newData.components[
      componentIndex
    ].options.map((o) => ({
      ...o,
      isDefault: o.id === id,
    }));
    form.reset(newData);
  };

  const handleCheckCheckbox = (
    componentIndex: number,
    component: ExtendedCheckListComponentRecord,
  ) => {
    const newData = {...values};
    newData.components[componentIndex] = {
      ...newData.components[componentIndex],
      checked: !component.checked,
    };
    form.reset(newData);
  };

  const checklistSummary = useMemo(() => {
    const componentsWithoutHead = values.components.filter(
      (c) => c.type !== CheckListComponentType.HEAD,
    );
    const doneList = componentsWithoutHead.filter((item) => {
      if (item.type === CheckListComponentType.TEXT) {
        return !!item.subject;
      }

      if (item.moreInfoInNote && !!item.subject) {
        return true;
      }

      if (item.type === CheckListComponentType.YES_NO) {
        return item.checked;
      }

      return item.options.filter((o) => o.isDefault).length > 0;
    });

    return {all: componentsWithoutHead.length, done: doneList.length};
  }, [values.components]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done / checklistSummary.all) * 100,
  );

  const renderContent = (
    component: ExtendedCheckListComponentRecord,
    index: number,
  ) => {
    if (component.type === CheckListComponentType.SINGLE_CHECK) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          p={1.5}
          boxShadow="0px 4px 10px 0px #E6EEFB"
          borderRadius={2.5}
          border="1px solid #E4E9F2">
          <Typography variant="subtitle2" fontSize="13px">
            {component.subject}
          </Typography>
          <Box display="flex" flexDirection="column" gap={1} pt={1}>
            {component.options.map((option, optionIndex) => (
              <Box
                display="flex"
                alignItems="center"
                sx={{cursor: 'pointer'}}
                onClick={() => handleCheckOption(index, option.id)}
                key={option.id}>
                <Radio
                  checked={!!option.isDefault}
                  size="small"
                  name={`components.${index}.options.${optionIndex}.isDefault`}
                  onChange={() => handleCheckOption(index, option.id)}
                  sx={{
                    ml: -0.5,
                    '&.MuiRadio-root': {
                      padding: 0.5,
                    },
                    '&.Mui-checked': {
                      color: '#4CAF50',
                    },
                  }}
                />
                <Typography variant="body2">{option.text}</Typography>
              </Box>
            ))}
            {component.moreInfoInNote ? (
              <Box display="flex" alignItems="center">
                <Radio
                  checked={false}
                  size="small"
                  sx={{
                    ml: -0.5,
                    '&.MuiRadio-root': {
                      padding: 0.5,
                    },
                    '&.Mui-checked': {
                      color: '#4CAF50',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {T('Enter Your Choice')}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>
      );
    }

    if (component.type === CheckListComponentType.YES_NO) {
      return (
        <Box
          display="flex"
          alignItems="center"
          px={1.5}
          py={1.1}
          boxShadow="0px 4px 10px 0px #E6EEFB"
          borderRadius={2.5}
          border="1px solid #E4E9F2"
          sx={{cursor: 'pointer'}}
          onClick={() => handleCheckCheckbox(index, component)}>
          <Checkbox
            name={`components.${index}.checked`}
            checked={!!component.checked}
            onChange={() => handleCheckCheckbox(index, component)}
            size="medium"
            sx={{
              ml: -1,
              '&.Mui-checked': {
                color: '#4CAF50',
              },
            }}
          />

          <Typography
            variant="body2"
            color={component.checked ? 'text.secondary' : 'text.primary'}
            sx={component.checked ? {textDecoration: 'line-through'} : {}}>
            {component.subject}
          </Typography>
        </Box>
      );
    }

    if (component.type === CheckListComponentType.TEXT) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          p={1.5}
          boxShadow="0px 4px 10px 0px #E6EEFB"
          borderRadius={2.5}
          border="1px solid #E4E9F2">
          <Typography variant="subtitle2" fontSize="13px">
            {component.subject}
          </Typography>
          <Controller
            control={form.control}
            defaultValue={component.note ?? undefined}
            name={`components.${index}.note`}
            render={({field: {onChange, value, onBlur}}) => (
              <TextField
                name={`components.${index}.note`}
                variant="outlined"
                size="small"
                placeholder={t('Enter your text here...')}
                multiline
                fullWidth
                minRows={5}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                sx={{
                  bgcolor: theme.palette.inputBackground.main,
                  mt: 1.5,
                  '& .MuiOutlinedInput-root': {
                    p: 1,
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    lineHeight: 1.43,
                    letterSpacing: '0.15px',
                    fieldset: {
                      border: '1px solid #E4E9F2',
                    },
                  },
                }}
              />
            )}
          />
        </Box>
      );
    }

    if (component.type === CheckListComponentType.HEAD) {
      return (
        <Typography variant="subtitle2" py={0.5}>
          {component.subject}
        </Typography>
      );
    }
  };

  const rowRenderer = ({
    style,
    index,
    data,
  }: {
    style: any;
    index: number;
    data: {
      components: ExtendedCheckListComponentRecord[];
    };
  }) => (
    <Box style={{...style, padding: '0px 14px 0px 14px'}}>
      {renderContent(data.components[index], index)}
    </Box>
  );

  return (
    <Dialog
      onClose={handleClose}
      open={isPreviewing}
      sx={styles.scrollBar}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.default,
          ...styles.scrollBar,
        },
      }}>
      <img
        src={MobileHeader1}
        alt="mobile header 1"
        width="100%"
        style={{
          maxWidth: '23.5rem',
        }}
      />

      <Box
        display="flex"
        flexDirection="column"
        boxShadow="0px 4px 10px 0px #E6EEFB"
        maxWidth="21.5rem"
        bgcolor="white"
        mt={2}
        mx="auto"
        mb={2.5}
        borderRadius={1.25}>
        <img
          src={MobileHeader2}
          alt="mobile header 2"
          width="100%"
          style={{
            marginTop: '-4px',
            transform: 'scale(1.03)',
          }}
        />

        <Box sx={{px: 2, py: 3}}>
          <Typography variant="caption" color="text.secondary">
            {T('Select Checklist')}
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={1.25}
            py={1}
            mt={1}
            mb={2}
            bgcolor={theme.palette.inputBackground.main}
            borderRadius={1}
            border="1px solid #E4E9F2">
            <Typography variant="subtitle2">{values.name}</Typography>
            <KeyboardArrowDown />
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption">
              {checklistSummary.done}/{checklistSummary.all} {T('options')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {percentComplete}% {T('complete')}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentComplete}
            sx={{
              backgroundColor: `${theme.palette.text.secondary}66`,
              [`& .${linearProgressClasses.bar}`]: {
                backgroundColor: '#4CAF50',
              },
            }}
          />
        </Box>

        <Divider />

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          pt={3}
          style={{height: '70vh'}}
          pb={2.5}>
          <AutoSizer style={{width: '100%'}}>
            {({height, width}) => (
              <Box>
                <VariableSizeList
                  height={height}
                  width={width}
                  itemCount={values.components.length}
                  itemData={{
                    components: values.components,
                  }}
                  itemSize={getSize}>
                  {rowRenderer}
                </VariableSizeList>
                <Box>
                  <Box
                    mt="1.5rem"
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    pb={3}>
                    <Typography
                      component="div"
                      variant="caption"
                      color="text.secondary"
                      mt={1.5}
                      pb={1}>
                      {T("Engineer's Signature")}
                      <Typography variant="caption" sx={{color: '#DB2C66'}}>
                        *
                      </Typography>
                    </Typography>
                    <Box
                      minHeight="7.5rem"
                      bgcolor={theme.palette.inputBackground.main}
                      borderRadius={1}
                      border="1px solid #E4E9F2"
                    />
                    <Button
                      buttonProps={{
                        variant: 'contained',
                        sx: {
                          marginTop: '7px',
                        },
                        fullWidth: true,
                        size: 'large',
                        onClick: handleClose,
                      }}>
                      {T('Complete')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </AutoSizer>
        </Box>
      </Box>
    </Dialog>
  );
};
