import {Box} from '@mui/material';
import {CheckListComponentView} from 'models/checklist';
import {FileResourceRecord} from 'models/media';
import {Image} from '../Image';

interface Props {
  isEditing?: boolean;
  component: CheckListComponentView;
  serviceCompanyId?: string;
  onImageDelete?: (image: FileResourceRecord, index: number) => void;
}

export const HorizontalChecklistImageList = ({
  component,
  onImageDelete,
  serviceCompanyId,
  isEditing = false,
}: Props) => {
  const pictures = component.additionalInfo.pictures ?? [];

  if (!pictures.length) return null;

  return (
    <Box display="flex" flexWrap="nowrap" sx={{overflowX: 'auto'}}>
      {pictures.map((item, i) => (
        <Image
          serviceCompanyId={serviceCompanyId}
          onDelete={() => onImageDelete?.(item, i)}
          isEditing={isEditing}
          key={item.uri === 'loading' ? i : item.uri}
          data={item}
        />
      ))}
    </Box>
  );
};
