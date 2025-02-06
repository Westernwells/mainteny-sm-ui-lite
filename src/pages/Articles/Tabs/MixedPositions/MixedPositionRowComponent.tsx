import React, {useContext} from 'react';
import {Typography, IconButton, Box, Tooltip} from '@mui/material';
import {Control, Controller} from 'react-hook-form';
import NewArticleAutoComplete from 'components/NewArticleAutocomplete';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NoteAltOutlined from '@mui/icons-material/NoteAltOutlined';
import NoteAlt from '@mui/icons-material/NoteAlt';
import DOMPurify from 'dompurify';
import {MeasurementUnit, createMeasurementOptions} from 'models/articleForm';
import {
  MixedPositionRow,
  MixedPositionFormValues,
  CreateArticleRecord,
  UpdateArticleRecord,
  SubPositionRow,
  ArticleType,
} from 'models/article';
import {FormInput} from 'components/form/FormInput';
import TableCell from 'components/Table/TableCell';
import {FormSelect} from 'components/form/FormSelect';
import {
  fetchArticleSubAssociations,
  useCreateArticleMix,
  useUpdateArticle,
} from 'hooks/reactQuery/useArticle';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {LanguageContext} from 'context/LanguageProvider';
import {t} from 'i18next';
import {transformToSubPositionRow} from 'utils/article-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {removeHtmlTags} from 'utils/rich-field-string';
import {ACTION_CELL_WIDTH} from 'models/table';
import {Actions} from './Actions';
import {DeleteEventState, getIconByType} from '.';

const sanitizedTextStyles = {
  maxWidth: 250,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  whiteSpace: 'normal',
  fontSize: '0.8rem',
};

type Props = {
  serviceCompanyId: string;
  row: MixedPositionRow;
  editState: {
    id: string | null;
    field: keyof MixedPositionRow | null;
    values: Partial<MixedPositionFormValues>;
  };
  setEditState: React.Dispatch<
    React.SetStateAction<{
      id: string | null;
      field: keyof MixedPositionRow | null;
      values: Partial<MixedPositionFormValues>;
    }>
  >;
  inputRefs: Record<string, React.RefObject<HTMLInputElement>>;
  mixedPositionControl: Control<
    Record<string, Partial<MixedPositionFormValues>>,
    any
  >;
  handleEditStart: (
    row: MixedPositionRow,
    field: keyof MixedPositionRow,
  ) => void;
  handleNewSubPosition: (rowId: string) => void;
  handleDescriptionClick: (
    row: MixedPositionRow,
    positionType: 'mixed' | 'sub',
  ) => void;
  handlePreview: (rowId: string) => void;
  setDeleteEventState: React.Dispatch<React.SetStateAction<DeleteEventState>>;
  expandedRows: string[];
  setExpandedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setSubRows: React.Dispatch<
    React.SetStateAction<Record<string, SubPositionRow[]>>
  >;
  localRows: MixedPositionRow[];
  setLocalRows: React.Dispatch<React.SetStateAction<MixedPositionRow[]>>;
  showRightShadow?: boolean;
  showLeftShadow?: boolean;
};

const MixedPositionRowComponent = ({
  serviceCompanyId,
  row,
  editState,
  setEditState,
  inputRefs,
  mixedPositionControl,
  handleEditStart,
  handleNewSubPosition,
  handleDescriptionClick,
  handlePreview,
  setDeleteEventState,
  expandedRows,
  setExpandedRows,
  setSubRows,
  localRows,
  setLocalRows,
  showRightShadow,
  showLeftShadow,
}: Props) => {
  const {showError} = useSnackbar();
  const currentCurrency = useCurrentCurrency();
  const {language: selectedLng} = useContext(LanguageContext);

  const {mutateAsync: updateArticle} = useUpdateArticle('');

  const {mutateAsync: createArticleMix} = useCreateArticleMix(
    'Mixed Position created successfully',
  );

  const handleToggleExpand = async (id: string) => {
    const isExpanded = expandedRows.includes(id);
    setExpandedRows((prev) =>
      isExpanded ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );

    if (!isExpanded) {
      const subAssociations = await fetchArticleSubAssociations(id);
      const transformedSubPositions = subAssociations.map(
        transformToSubPositionRow,
      );

      setSubRows((prev) => ({...prev, [id]: transformedSubPositions}));
    }
  };

  const resetEditState = () => {
    setEditState({id: null, field: null, values: {}});
  };

  const handleMixedPositionArticle = async (
    rowId: string,
    updatedBody: CreateArticleRecord | UpdateArticleRecord,
  ) => {
    const isCreateArticleRecord = (
      body: CreateArticleRecord | UpdateArticleRecord,
    ): body is CreateArticleRecord => 'serviceCompanyId' in body;

    if (editState.id === rowId && !rowId.includes('mixed')) {
      const articleToUpdate =
        editState.values.name !== updatedBody.name && !updatedBody.id
          ? ({
              name: updatedBody.name,
              type: ArticleType.MIX,
            } as UpdateArticleRecord)
          : ({...updatedBody, type: ArticleType.MIX} as UpdateArticleRecord);

      try {
        await updateArticle({
          articleId: rowId,
          article: articleToUpdate,
        });
      } catch (error) {
        showError(error);
      }
      resetEditState();
    }

    if (isCreateArticleRecord(updatedBody)) {
      try {
        await createArticleMix({
          article: updatedBody,
          subAssociations: [],
        });
      } catch (error) {
        showError(error);
      }
      resetEditState();
    } else {
      try {
        await updateArticle({
          articleId: rowId,
          article: updatedBody,
        });
      } catch (error) {
        showError(error);
      }
      resetEditState();
    }
  };

  const handleSaveMixedPosition = async (rowId: string, field: string) => {
    const activeRow = localRows.find((localRow) => localRow.data.id === rowId);
    if (!activeRow) return;

    const currentValue = row[field as keyof MixedPositionRow];

    const newValue =
      editState.values[field as keyof Partial<MixedPositionFormValues>];

    if (newValue === undefined || newValue === currentValue) {
      setEditState({id: null, field: null, values: {}});
      return;
    }

    setLocalRows((prev) =>
      prev.map((localRow) =>
        localRow.data.id === rowId
          ? {...localRow, [field]: newValue}
          : localRow,
      ),
    );

    if (!rowId.includes('mixed')) {
      const updatePayload: UpdateArticleRecord = {};
      if (field === 'externalId') {
        updatePayload.externalId = newValue as string;
      } else if (field === 'name') {
        updatePayload.name = newValue as string;
      } else if (field === 'description') {
        updatePayload.description = newValue as string;
      } else if (field === 'unit') {
        updatePayload.unit = newValue as string;
      }

      if (Object.keys(updatePayload).length > 0) {
        try {
          await updateArticle({
            articleId: rowId,
            article: updatePayload,
          });
          setEditState({id: null, field: null, values: {}});
        } catch (error) {
          showError(error);
        }
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    activeRow: MixedPositionRow,
    field: string,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveMixedPosition(activeRow.data.id, field);
    }
  };

  const onChangeUnit = async (newUnit: string, mixedPositionId: string) => {
    try {
      await updateArticle({
        articleId: mixedPositionId,
        article: {unit: newUnit},
      });

      setEditState({id: null, field: null, values: {}});
    } catch (error) {
      showError(error);
    }
  };

  const renderEditableCell = (
    field: keyof MixedPositionRow,
    placeholder: string,
    type: 'text' | 'number' = 'text',
  ) => (
    <Controller
      name={`${row.data.id}.${field}`}
      control={mixedPositionControl}
      render={({field: formField}) => (
        <FormInput
          ref={inputRefs[row.data.id]}
          containerStyles={{width: '100%'}}
          fieldProps={{
            ...formField,
            value: formField.value || '',
            type,
            placeholder,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const value =
                type === 'number'
                  ? parseFloat(e.target.value) || 0
                  : e.target.value;
              formField.onChange(e);
              setEditState({
                ...editState,
                values: {...editState.values, [field]: value},
              });
            },
            onBlur: () => handleSaveMixedPosition(row.data.id, field),
            onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, row, field),
          }}
        />
      )}
    />
  );

  return (
    <>
      <TableCell
        isFirst
        noPadding={
          editState.field === 'externalId' && editState.id === row.data.id
        }
        onDoubleClick={() => handleEditStart(row, 'externalId')}
        showShadows={showRightShadow ? 'right' : undefined}>
        {editState.field === 'externalId' && editState.id === row.data.id ? (
          renderEditableCell('externalId', 'Article Number', 'text')
        ) : (
          <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
            {row.data.externalId}
          </Typography>
        )}
      </TableCell>

      {/* Name */}
      <TableCell noPadding onDoubleClick={() => handleEditStart(row, 'name')}>
        {editState.field === 'name' && editState.id === row.data.id ? (
          <NewArticleAutoComplete
            onBlur={() =>
              handleSaveMixedPosition(row.data.id, editState.field!)
            }
            initialValue={row.data}
            onArticleSelect={handleMixedPositionArticle}
            rowId={row.data.id}
            serviceCompanyId={serviceCompanyId}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: row.data.name ? 'none' : '2px solid red',
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                width: '100%',
                paddingRight: '16px',
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                <IconButton
                  sx={{padding: '6px', cursor: 'pointer'}}
                  onClick={() => handleToggleExpand(row.data.id)}>
                  {!expandedRows.includes(row.data.id) ? (
                    <ArrowRightIcon sx={{color: '#000034'}} />
                  ) : (
                    <ArrowDropDownIcon sx={{color: '#000034'}} />
                  )}
                </IconButton>

                <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
                  {row.data.name}
                </Typography>
              </Box>

              <IconButton
                onClick={() => handleDescriptionClick(row, 'mixed')}
                sx={{
                  color: removeHtmlTags(row.data.description || '')
                    ? '#000034'
                    : '#828DA3',
                }}>
                {removeHtmlTags(row.data.description || '') !== '' ? (
                  <Tooltip
                    title={
                      <div>
                        <Typography
                          sx={{
                            ...sanitizedTextStyles,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              row.data.description || '',
                            ),
                          }}
                        />
                      </div>
                    }
                    arrow
                    placement="top">
                    <NoteAlt fontSize="small" />
                  </Tooltip>
                ) : (
                  <NoteAltOutlined fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        )}
      </TableCell>

      {/* Type Icon */}
      <TableCell align="center" noPadding>
        {getIconByType(row.data.type)}
      </TableCell>
      <TableCell align="right">
        <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
          {formatCurrency(
            (row.data.unitPurchaseAmount?.netAmount ?? 0) /
              10 ** currentCurrency.fractionDigits,
            {
              currency: currentCurrency.code,
            },
          )}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
          {Number.isFinite(
            (((row.data.unitSellingAmount?.netAmount ?? 0) -
              (row.data.unitPurchaseAmount?.netAmount ?? 0)) /
              (row.data.unitPurchaseAmount?.netAmount ?? 0)) *
              100,
          ) &&
          (((row.data.unitSellingAmount?.netAmount ?? 0) -
            (row.data.unitPurchaseAmount?.netAmount ?? 0)) /
            (row.data.unitPurchaseAmount?.netAmount ?? 0)) *
            100 !==
            0
            ? (
                (((row.data.unitSellingAmount?.netAmount ?? 0) -
                  (row.data.unitPurchaseAmount?.netAmount ?? 0)) /
                  (row.data.unitPurchaseAmount?.netAmount ?? 0)) *
                100
              ).toFixed(2)
            : '-'}
          {Number.isFinite(
            (((row.data.unitSellingAmount?.netAmount ?? 0) -
              (row.data.unitPurchaseAmount?.netAmount ?? 0)) /
              (row.data.unitPurchaseAmount?.netAmount ?? 0)) *
              100,
          ) &&
          (((row.data.unitSellingAmount?.netAmount ?? 0) -
            (row.data.unitPurchaseAmount?.netAmount ?? 0)) /
            (row.data.unitPurchaseAmount?.netAmount ?? 0)) *
            100 !==
            0
            ? '%'
            : ''}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
          {formatCurrency(
            (row.data.unitSellingAmount?.netAmount ?? 0) /
              10 ** currentCurrency.fractionDigits,
            {
              currency: currentCurrency.code,
            },
          )}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography sx={{fontSize: '14px', fontWeight: '600'}}>1</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
          {`${row.data.unitSellingAmount?.percentageVat}%`}
        </Typography>
      </TableCell>
      <TableCell
        noPadding
        align="right"
        onDoubleClick={() => handleEditStart(row, 'unit')}>
        {editState.field === 'unit' && editState.id === row.data.id ? (
          <Controller
            name={`${row.data.id}.unit`}
            control={mixedPositionControl}
            render={({field}) => (
              <FormSelect
                labelId={`select-unit-label-${row.data.id}`}
                label=""
                resetOption={{label: t('Select Unit')}}
                options={createMeasurementOptions(
                  selectedLng,
                  MeasurementUnit.UE,
                )}
                selectProps={{
                  ...field,
                  value: editState.values.unit ?? '',
                  onChange: (event) => {
                    const selectedValue = event.target.value as string;
                    onChangeUnit(selectedValue, row.data.id);
                    field.onChange(event);
                  },
                  placeholder: t('Select Unit'),
                  sx: {
                    width: '100%',
                    border: '2px solid #000034',
                    borderRadius: '4px',
                  },
                  onBlur: (event) => {
                    const selectedValue = event.target.value as string;
                    onChangeUnit(selectedValue, row.data.id);
                    field.onChange(event);
                  },
                }}
              />
            )}
          />
        ) : (
          <Typography
            sx={{fontSize: '14px', fontWeight: '600', paddingRight: '12px'}}>
            {row.data?.unit ? t(row.data?.unit) : '-'}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Typography sx={{fontSize: '14px', fontWeight: '600'}}>
          {formatCurrency(
            ((row.data.unitSellingAmount?.netAmount ?? 0) * 1) /
              10 ** currentCurrency.fractionDigits,
            {
              currency: currentCurrency.code,
            },
          )}
        </Typography>
      </TableCell>
      <TableCell
        align="right"
        noPadding
        isLast
        width={ACTION_CELL_WIDTH}
        showShadows={showLeftShadow ? 'left' : undefined}>
        <Actions
          onPreview={() => handlePreview(row.id)}
          onAddSubPosition={() => handleNewSubPosition(row.id)}
          onDelete={() => {
            setEditState((prevState) => ({
              ...prevState,
              id: row.id,
            }));

            setDeleteEventState({
              userTypedName: '',
              isOpen: true,
              event: {
                type: 'mixed',
                id: row.id,
                name: row.name,
                externalId: row.externalId,
              },
            });
          }}
          isDraft={!!row.id?.startsWith('mixed')}
          onRemove={() => {
            setLocalRows((prev) =>
              prev.filter((prevRow) => prevRow.id !== row.id),
            );
          }}
        />
      </TableCell>
    </>
  );
};

export default MixedPositionRowComponent;
