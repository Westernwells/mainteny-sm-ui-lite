import {Grid} from '@mui/material';
import {Box} from '@mui/system';

import {useTranslation} from 'react-i18next';
import {FormInput} from 'components/form/FormInput';
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {
  EXTRA_ASSIGNMENT_OPTIONS_MAP,
  NewTaskForm,
  TaskAssignmentType,
  TaskFormRefEntity,
  TaskStatus,
} from 'models/tasks';
import FormInputLabel from 'components/FormInputLabel';
import RichTextEditor from 'components/RichTextEditor';
import StatusSelect from 'components/StatusSelect';
import {ALL_TASK_STATUSES, getTaskStatusStyles} from 'utils/tasks';
import {DatePicker} from 'components/DatePicker';
import TagFormField from 'components/Tag/TagFormField';
import {TagEntityType} from 'models/tag';
import UserSelect from 'components/UserSelect';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import {theme} from 'theme';
import TaskAssociationSelect from '../TaskAssociationSelect';
import ExtraOptionIconWrapper from '../ExtraOptionIconWrapper';

type Props = {
  control: Control<NewTaskForm>;
  setValue: UseFormSetValue<NewTaskForm>;
  watch: UseFormWatch<NewTaskForm>;
  fixedRefEntity?: TaskFormRefEntity;
};

const extraAssignmentOptions = Object.keys(EXTRA_ASSIGNMENT_OPTIONS_MAP);

const TaskForm = ({control, setValue, watch, fixedRefEntity}: Props) => {
  const {t} = useTranslation();

  const assignmentWatched = watch('assignment');
  const refEntityWatched = watch('refEntity');
  const descriptionWatched = watch('description');
  const assignmentValue = extraAssignmentOptions.includes(
    assignmentWatched?.type ?? '',
  )
    ? assignmentWatched?.type
    : assignmentWatched?.employeeId;

  return (
    <Box width="100%">
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          <Box width="100%">
            <FormInputLabel required label="Name" />
            <Controller
              control={control}
              name="name"
              render={({field}) => (
                <FormInput
                  fieldProps={{
                    onChange: field.onChange,
                    onBlur: field.onBlur,
                    size: 'small',
                    label: '',
                    name: 'name',
                    value: field.value,
                    helperText: '',
                    error: false,
                  }}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <FormInputLabel label="Description" />
            <Controller
              name="description"
              control={control}
              defaultValue={descriptionWatched}
              render={({field: {onChange, value}}) => (
                <RichTextEditor
                  isLoadingFiles={false}
                  hasAttachFileButton={false}
                  label=""
                  html={value}
                  updateHtml={(str) => onChange(str)}
                  existingFiles={[]}
                  hasSignatureButton={false}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Grid columnSpacing={2} container>
            <Grid item xs={6}>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <FormInputLabel required label="Status" />
                <Controller
                  name="status"
                  control={control}
                  render={({field, fieldState: {error}}) => (
                    <StatusSelect
                      testId="status-input-control"
                      labelId="status-label"
                      label=""
                      options={ALL_TASK_STATUSES.map((status) => {
                        const statusStyles = getTaskStatusStyles(status);

                        return {
                          label: statusStyles.label,
                          value: status,
                          color: statusStyles.color,
                          textColor:
                            status === TaskStatus.TO_DO ? 'black' : 'white',
                        };
                      })}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!error}
                      errorText={error?.message}
                      required={false}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <FormInputLabel required={false} label="Due date" />
                <Controller
                  name="dueDate"
                  control={control}
                  render={({field}) => (
                    <DatePicker
                      defaultDate={
                        field.value ? new Date(field.value) : undefined
                      }
                      inputTestId="duedate-picker"
                      popupTestId="duedate-picker-popup"
                      getSelectedDate={field.onChange}
                      textFieldProps={{
                        label: '',
                        name: 'dueDate',
                        onBlur: field.onBlur,
                        required: true,
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid columnSpacing={2} container>
            <Grid item xs={6}>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <FormInputLabel required={false} label="Assigned to" />
                <Controller
                  name="assignment"
                  control={control}
                  render={() => (
                    <UserSelect
                      textFieldProps={{
                        label: '',
                        placeholder: t('Select'),
                      }}
                      testId="assigned-to-autocomplete-root"
                      extraOptions={extraAssignmentOptions.map((optionKey) => {
                        const key = optionKey as TaskAssignmentType;

                        return {
                          type: key,
                          label: t(EXTRA_ASSIGNMENT_OPTIONS_MAP[key]),
                          value: optionKey,
                          iconComponent: (
                            <ExtraOptionIconWrapper>
                              {optionKey === TaskAssignmentType.OFFICE ? (
                                <BusinessOutlinedIcon
                                  htmlColor={theme.palette.text.secondary}
                                  sx={{width: '80%', height: '80%'}}
                                />
                              ) : null}
                              {optionKey === TaskAssignmentType.TECHNICIANS ? (
                                <BuildOutlinedIcon
                                  htmlColor={theme.palette.text.secondary}
                                  sx={{width: '70%', height: '70%'}}
                                />
                              ) : null}
                            </ExtraOptionIconWrapper>
                          ),
                        };
                      })}
                      value={assignmentValue}
                      onChange={(e, data) => {
                        e.preventDefault();

                        const {item} = data ?? {};

                        if (!item) {
                          setValue('assignment', undefined);
                        } else {
                          setValue('assignment', {
                            employeeId: item?.value,
                            type: item?.type!,
                          });
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <FormInputLabel required={false} label="Tags" />
                <Controller
                  name="tags"
                  control={control}
                  render={({field}) => (
                    <TagFormField
                      testId="tags-form"
                      tagSearchTestId="tags-form-search"
                      tags={field.value ?? []}
                      entity={TagEntityType.TASK}
                      height="40px"
                      onChange={field.onChange}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
        {!fixedRefEntity && (
          <Grid item xs={12}>
            <Controller
              name="refEntity"
              control={control}
              render={({field}) => (
                <TaskAssociationSelect
                  label="Connected to"
                  value={
                    refEntityWatched
                      ? {
                          refId: refEntityWatched.id,
                          refType: refEntityWatched.type,
                        }
                      : undefined
                  }
                  onClear={field.onChange}
                  onDone={field.onChange}
                  refTypeTestId="connected-to-input"
                  elevatorRefTestId="connected-to-elevator-input"
                  serviceOrderRefTestId="connected-to-service-order-input"
                />
              )}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TaskForm;
