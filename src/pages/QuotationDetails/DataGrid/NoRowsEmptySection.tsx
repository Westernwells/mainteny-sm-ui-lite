import {EmptySection} from 'components/EmptySection';

interface Props {
  placeholder: string;
  action?: () => void;
}

export const NoRowsEmptySection = ({placeholder, action}: Props) => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{m: 'auto', width: '60%'}}
    label={`Sorry, we couldn't find any ${placeholder} that matches the search text. 
    If you like to add a new ${placeholder}, please click the button below`}
    showActionBtn
    btnLabel="Add New"
    btnAction={action}
  />
);
