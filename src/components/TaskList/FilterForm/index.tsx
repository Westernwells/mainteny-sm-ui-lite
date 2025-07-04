import {Box} from '@mui/system';
import ChipSelector from 'components/ChipSelector';
import FormInputLabel from 'components/FormInputLabel';
import {TagSelect} from 'components/TagSelect';
import {TagEntityType} from 'models/tag';
import {
  EXTRA_ASSIGNMENT_OPTIONS_MAP,
  TaskAssignmentType,
  TaskFilterForm,
  TaskStatus,
} from 'models/tasks';
import {useCallback} from 'react';
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {ALL_TASK_STATUSES, getTaskStatusStyles} from 'utils/tasks';
import {DatePicker} from 'components/DatePicker';
import UserSelect from 'components/UserSelect';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import {theme} from 'theme';
import ExtraOptionIconWrapper from '../ExtraOptionIconWrapper';
import TaskAssociationSelect from '../TaskAssociationSelect';

type Props = {
  control: Control<TaskFilterForm>;
  watch: UseFormWatch<TaskFilterForm>;
  setValue: UseFormSetValue<TaskFilterForm>;
};

const FilterForm = ({control, watch, setValue}: Props) => {
  const {t} = useTranslation();

  const watchedStatus = watch('status');
  const watchedAssignedEmployeeId = watch('assignedEmployeeId');
  const watchedRefEntity = watch('refEntity');

  const handleSelectedStatusChange = useCallback(
    (value: string) => {
      if (!watchedStatus.some((type) => type === value)) {
        setValue('status', [...watchedStatus, value as TaskStatus]);
      } else {
        setValue(
          'status',
          watchedStatus.filter((type) => type !== value),
        );
      }
    },
    [watchedStatus],
  );

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={2}>
      <Controller
        name="status"
        control={control}
        render={({field}) => (
          <ChipSelector
            headerLabel="Status"
            testId="task-status-chip-selector"
            options={ALL_TASK_STATUSES.map((status) => {
              const statusStyles = getTaskStatusStyles(status);

              return {
                value: status,
                labelKey: t(statusStyles.label),
              };
            })}
            selectedChips={field.value}
            onChange={handleSelectedStatusChange}
          />
        )}
      />
      <Controller
        name="tagName"
        control={control}
        render={({field}) => (
          <TagSelect
            entityType={TagEntityType.TASK}
            value={field.value}
            tagPrimaryKey="name"
            onChange={field.onChange}
          />
        )}
      />
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <FormInputLabel required={false} label="Assigned to" />
        <Controller
          name="assignedEmployeeId"
          control={control}
          render={() => (
            <UserSelect
              textFieldProps={{
                label: '',
                placeholder: t('Select'),
              }}
              extraOptions={Object.keys(EXTRA_ASSIGNMENT_OPTIONS_MAP).map(
                (optionKey) => {
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
                },
              )}
              value={watchedAssignedEmployeeId}
              onChange={(e, data) => {
                e.preventDefault();

                const {item} = data ?? {};

                setValue('assignedEmployeeId', item?.value);
                setValue('assignmentType', item?.type);
              }}
            />
          )}
        />
      </Box>
      <Box display="flex" flexDirection="row" columnGap={2}>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <FormInputLabel required={false} label="Due from" />
          <Controller
            name="dueDateStart"
            control={control}
            render={({field}) => (
              <DatePicker
                defaultDate={field.value ? new Date(field.value) : undefined}
                getSelectedDate={field.onChange}
                textFieldProps={{
                  label: '',
                  name: 'dueDateStart',
                  onBlur: field.onBlur,
                  required: true,
                }}
              />
            )}
          />
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <FormInputLabel required={false} label="Due to" />
          <Controller
            name="dueDateEnd"
            control={control}
            render={({field}) => (
              <DatePicker
                defaultDate={field.value ? new Date(field.value) : undefined}
                getSelectedDate={field.onChange}
                textFieldProps={{
                  label: '',
                  name: 'dueDateEnd',
                  onBlur: field.onBlur,
                  required: true,
                }}
              />
            )}
          />
        </Box>
      </Box>
      <Controller
        name="refEntity"
        control={control}
        render={({field}) => (
          <TaskAssociationSelect
            label="Connection type(s)"
            fullWidthInputs
            value={watchedRefEntity}
            onClear={field.onChange}
            onDone={(data) =>
              field.onChange({refId: data.id, refType: data.type})
            }
          />
        )}
      />
    </Box>
  );
};

export default FilterForm;
