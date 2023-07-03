import React from 'react';
import {useFormikContext} from 'formik';
import {Box} from '@mui/material';

import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {CustomerEditForm} from './model';

export const SelectPriority = () => {
  const {setFieldValue, values} = useFormikContext<CustomerEditForm>();

  return (
    <Box display="flex" gap="1em">
      <MultipleSelectCheckmarks
        label="Priority"
        options={['A', 'B', 'C', 'NONE']}
        getSelectedValue={(item: string[]) =>
          setFieldValue('priority', item[0])
        }
        disableClearBtn
        initialSelectedItems={values.priority ? [values.priority] : ['NONE']}
        multiple={false}
        containerStyles={{width: '100%'}}
        formControlStyles={{width: '100%'}}
      />
    </Box>
  );
};
