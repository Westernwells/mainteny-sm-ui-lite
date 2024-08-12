import {Box} from '@mui/material';
import {EmptySection} from 'components/EmptySection';

interface Props {
  onAddPress: () => void;
}

export const NoChecklist = ({onAddPress}: Props) => (
  <Box display="flex" justifyContent="center">
    <EmptySection
      illustration="checklist"
      size="small"
      containerStyle={{width: '60%', marginTop: 0}}
      showActionBtn
      btnAction={onAddPress}
      btnLabel="Add Checklist"
      labelVariant="h5"
      subLabelProps={{
        mt: 1,
        variant: 'body1',
      }}
      btnSize="large"
      label="No checklist yet."
      subLabel="No checklist yet. Please add them by clicking the button below!"
    />
  </Box>
);
